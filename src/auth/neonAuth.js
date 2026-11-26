import { createAuthClient } from '@neon/neon-js/auth';

const authUrl = import.meta.env.VITE_NEON_AUTH_URL;
if (!authUrl) {
  console.warn('VITE_NEON_AUTH_URL is not configured. Neon account features are unavailable.');
}

export const neonAuth = authUrl ? createAuthClient(authUrl) : null;
