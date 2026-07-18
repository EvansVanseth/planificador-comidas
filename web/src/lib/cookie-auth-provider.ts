import { cookies } from 'next/headers';
import type { AuthProvider } from '@/application/auth/auth-provider.interface';

type UserLookup = (email: string) => Promise<{ id: string; name: string; email: string } | null>;

export class CookieAuthProvider implements AuthProvider {
  constructor(private findUserByEmail: UserLookup) {}

  async getUserId(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get('userId')?.value ?? null;
  }

  async getUser(): Promise<{ id: string; name: string; email: string } | null> {
    const userId = await this.getUserId();
    if (!userId) return null;
    const container = (await import('@/domain-container')).getContainer();
    const users = await container.listUsers.execute();
    const user = users.find((u) => u.id === userId);
    if (!user) return null;
    return { id: user.id, name: user.name, email: user.email };
  }

  async signUp(_email: string, _password: string, _name: string): Promise<string> {
    const { randomUUID } = await import('crypto');
    const userId = randomUUID();
    const cookieStore = await cookies();
    cookieStore.set('userId', userId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });
    return userId;
  }

  async signIn(email: string, _password: string): Promise<string> {
    const user = await this.findUserByEmail(email);
    if (!user) throw new Error('Email o contraseña incorrectos');
    const cookieStore = await cookies();
    cookieStore.set('userId', user.id, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });
    return user.id;
  }

  async signOut(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set('userId', '', { maxAge: 0, path: '/' });
  }

  async updateName(_userId: string, _name: string): Promise<void> {}

  async resetPassword(_email: string): Promise<void> {
    throw new Error('Recuperación de contraseña no disponible en este modo');
  }

  async updatePassword(_password: string): Promise<void> {
    throw new Error('Cambio de contraseña no disponible en este modo');
  }

  async deleteUser(_userId: string): Promise<void> {}
}
