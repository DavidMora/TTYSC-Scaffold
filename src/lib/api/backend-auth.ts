import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { BackendDefinition } from './backend-resolver';

export interface BuildAuthHeadersOptions {
  backend: BackendDefinition;
}

export interface AuthHeadersResult {
  headers: Record<string, string>;
  /** True if auth was applied */
  applied: boolean;
}

export async function buildAuthHeaders({
  backend,
}: BuildAuthHeadersOptions): Promise<AuthHeadersResult> {
  switch (backend.auth.type) {
    case 'basic': {
      const username = process.env.NEXT_PUBLIC_API_USERNAME;
      const password = process.env.NEXT_PUBLIC_API_PASSWORD;
      if (!username || !password) return { headers: {}, applied: false };
      const token = Buffer.from(`${username}:${password}`).toString('base64');
      return { headers: { Authorization: `Basic ${token}` }, applied: true };
    }
    case 'bearer-id-token': {
      const session = await getServerSession(authOptions as never);
      const idToken = (session &&
        (session as Record<string, unknown>).idToken) as string | undefined;
      if (!idToken) return { headers: {}, applied: false };
      return { headers: { Authorization: `Bearer ${idToken}` }, applied: true };
    }
    default:
      return { headers: {}, applied: false };
  }
}
