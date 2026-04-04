# RaftaarX Deployment Guide

## Recommended Production Setup

- Frontend: Vercel
- Backend: Render or Railway
- Database: MongoDB Atlas

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
