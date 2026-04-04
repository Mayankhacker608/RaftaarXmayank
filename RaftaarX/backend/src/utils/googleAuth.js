import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.AUTH_GOOGLE_ID);

export async function verifyGoogleCredential(credential) {
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.AUTH_GOOGLE_ID,
  });

  return ticket.getPayload();
}
