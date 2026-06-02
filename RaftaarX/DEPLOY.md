# RaftaarX Deployment Guide

## Recommended Production Setup

- Frontend: Render Static Site or Vercel
- Backend: Render Web Service or Railway
- Database: MongoDB Atlas

## Render Blueprint Deploy

This repo includes a root-level `render.yaml` that creates:

- `raftaarx-backend`: Node web service from `RaftaarX/backend`
- `raftaarx-frontend`: static Vite frontend from `RaftaarX/frontend`

Deploy steps:

1. Push the repo to GitHub.
2. In Render, choose **New > Blueprint**.
3. Connect `Mayankhacker608/RaftaarXmayank`.
4. Keep the default Blueprint file path: `render.yaml`.
5. Fill the prompted environment variables.
6. Deploy the Blueprint.

Render will auto-deploy both services on future commits to the connected branch.

Prompted backend values:

- `MONGODB_URL`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `EMAIL_USER`
- `EMAIL_PASS`

Prompted frontend value:

- `VITE_GOOGLE_CLIENT_ID`

The Blueprint generates `AUTH_SECRET` and `ADMIN_SIGNUP_KEY` automatically. If you need a known admin signup key, replace the generated value in the Render dashboard after the first deploy.

## Why not deploy the current backend on Vercel?

The backend currently stores uploaded partner files on the local `uploads` folder.
According to Vercel docs, Functions have a read-only filesystem except temporary `/tmp`
scratch space, so persistent uploads are not a good fit there.

Official references:
- [Vercel Functions](https://vercel.com/docs/functions)
- [Vercel Runtimes filesystem support](https://vercel.com/docs/functions/runtimes)
- [Rewrites on Vercel](https://vercel.com/docs/rewrites)

## Frontend on Vercel

Set the Vercel project Root Directory to:

`frontend`

Add these environment variables in Vercel:

- `VITE_API_URL`
- `VITE_GOOGLE_CLIENT_ID`

Example production values:

- `VITE_API_URL=https://your-backend-domain.com/api`
- `VITE_GOOGLE_CLIENT_ID=your_google_client_id`

The frontend already includes:

- `vercel.json` SPA rewrite support
- Vite production build support
- React Router deep-link handling

## Backend on Render or Railway

Set these environment variables:

- `PORT`
- `MONGODB_URL`
- `AUTH_SECRET`
- `CLIENT_URL`
- `ALLOWED_ORIGINS`
- `ADMIN_SIGNUP_KEY`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `EMAIL_USER`
- `EMAIL_PASS`

Important production values:

- `CLIENT_URL=https://your-vercel-domain.vercel.app`
- `ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app`

## Vercel Deploy Steps

1. Push the project to GitHub.
2. Import the repo into Vercel.
3. In Vercel project settings, set Root Directory to `frontend`.
4. Add `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID`.
5. Deploy.

## Backend Deploy Steps

1. Create a new Render or Railway service from the `backend` folder.
2. Add all backend env vars.
3. Run install: `npm install`
4. Run start command: `npm start`
5. Update frontend `VITE_API_URL` to this deployed backend URL and redeploy frontend.

## Final Production Checklist

- MongoDB Atlas network access allows your backend host.
- Google OAuth allowed origins include your live frontend domain.
- Gmail uses a valid app password.
- Backend health works at `/api/health`.
- Frontend login, signup, booking, partner, and admin flows work against the live backend.
