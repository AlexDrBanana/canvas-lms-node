import { CanvasLMS } from '../src/index.js';

/**
 * Creates a test client from environment variables.
 * Requires CANVAS_BASE_URL and CANVAS_API_KEY in .env.
 */
export function createTestClient(): CanvasLMS {
  return new CanvasLMS({
    apiKey: process.env['CANVAS_API_KEY'],
    baseURL: process.env['CANVAS_BASE_URL'],
    logLevel: 'warn',
  });
}

/** Get the account ID for the test user (uses 'self' by default). */
export async function getTestAccountId(client: CanvasLMS): Promise<string> {
  const user = await client.users.getSelf();
  // For free Canvas accounts, the root account is usually accessible
  // We'll use 'self' which resolves to the user's primary account
  return 'self';
}
