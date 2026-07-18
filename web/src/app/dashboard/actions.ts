'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { createServiceRoleClient } from './service-role';
import { getContainer } from '@/domain-container';

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function deleteAccount() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  // Delete user data from our database (cascade removes everything)
  const container = getContainer();
  await container.deleteUser.execute(user.id);

  // Delete auth user from Supabase
  const adminClient = createServiceRoleClient();
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  redirect('/');
}
