import type { AuthProvider } from '@/application/auth/auth-provider.interface';
import { SupabaseAuthProvider } from './supabase-auth-provider';
import { CookieAuthProvider } from './cookie-auth-provider';
import { getContainer } from '@/domain-container';

let _provider: AuthProvider | null = null;

export function getAuthProvider(): AuthProvider {
  if (!_provider) {
    const backend = process.env.STORAGE_BACKEND ?? 'postgres';
    if (backend === 'postgres') {
      _provider = new SupabaseAuthProvider();
    } else {
      const container = getContainer();
      _provider = new CookieAuthProvider(
        async (email: string) => {
          const users = await container.listUsers.execute();
          const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
          return user ? { id: user.id, name: user.name, email: user.email } : null;
        },
      );
    }
  }
  return _provider;
}

export async function getUserId(): Promise<string> {
  const id = await getAuthProvider().getUserId();
  return id ?? '';
}
