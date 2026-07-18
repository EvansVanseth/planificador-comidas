import { getUserId } from '@/lib/auth';
import CreatePlanningForm from './create-planning-form';

export default async function NewPlanningPage() {
  const userId = await getUserId();

  return <CreatePlanningForm userId={userId} />;
}
