import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { AuthProvider } from '@/application/auth/auth-provider.interface';

/**
 * Read-only Supabase server client for reads that happen during Server
 * Component render (getUser/getUserId). Token refresh must never write
 * cookies here — the middleware refreshes the session on each request in a
 * Route Handler context, where writing is allowed.
 */
async function getSupabaseReadOnly() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() { /* no-op: session refresh is handled by middleware */ },
      },
    },
  );
}

/**
 * Writable Supabase client for Server Actions that create, mutate, or clear
 * the session (signUp, signIn, signOut, updateUser...). Server Actions may set
 * cookies, so this refreshes through cookieStore.set.
 */
async function getSupabaseWritable() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        },
      },
    },
  );
}

function getAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

export class SupabaseAuthProvider implements AuthProvider {
  async getUserId(): Promise<string | null> {
    const supabase = await getSupabaseReadOnly();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  }

  async getUser(): Promise<{ id: string; name: string; email: string } | null> {
    const supabase = await getSupabaseReadOnly();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return {
      id: user.id,
      name: (user.user_metadata?.name as string) ?? '',
      email: user.email ?? '',
    };
  }

  async signUp(email: string, password: string, name: string): Promise<string> {
    const supabase = await getSupabaseWritable();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;
    if (!data.user?.id) throw new Error('Error al crear la cuenta');
    return data.user.id;
  }

  async signIn(email: string, password: string): Promise<string> {
    const supabase = await getSupabaseWritable();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Email o contraseña incorrectos');
      }
      throw error;
    }
    return data.user.id;
  }

  async signOut(): Promise<void> {
    const supabase = await getSupabaseWritable();
    await supabase.auth.signOut();
  }

  async updateName(userId: string, name: string): Promise<void> {
    const supabase = await getSupabaseWritable();
    const { error } = await supabase.auth.updateUser({
      data: { name },
    });
    if (error) throw error;
  }

  async resetPassword(email: string): Promise<void> {
    const supabase = await getSupabaseWritable();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.APP_URL ?? 'http://127.0.0.1:3000'}/update-password`,
    });
    if (error) throw error;
  }

  async updatePassword(password: string): Promise<void> {
    const supabase = await getSupabaseWritable();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  }

  async deleteUser(userId: string): Promise<void> {
    const admin = getAdmin();
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) throw error;
  }
}
