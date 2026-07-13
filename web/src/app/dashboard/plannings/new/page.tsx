import { cookies } from 'next/headers';
import CreatePlanningForm from './create-planning-form';

export default async function NewPlanningPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value ?? '';

  return <CreatePlanningForm userId={userId} />;
}
