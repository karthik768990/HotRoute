import { OAuth2Client } from 'google-auth-library';
import { GoogleUserPayload } from './google.types';
import { InvalidGoogleTokenError } from './helpers/google.errors';

// In production, ensure this is set in your environment
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Verifies a Google JWT credential and extracts the normalized user payload.
 */
export async function verifyGoogleCredential(credential: string): Promise<GoogleUserPayload> {
    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID, 
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.sub || !payload.email) {
            throw new InvalidGoogleTokenError("Malformed Google payload");
        }

        return {
            googleId: payload.sub,
            email: payload.email,
            // Fallback to the email prefix if the Google account doesn't have a name set
            username: payload.name || payload.email.split('@')[0], 
        };
    } catch (error) {
        if (error instanceof InvalidGoogleTokenError) throw error;
        // Catch network issues or verification failures from the google-auth-library
        throw new InvalidGoogleTokenError("Failed to verify Google credential");
    }
}