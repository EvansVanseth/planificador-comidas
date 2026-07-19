import { getUserId } from '@/lib/auth';
import { getContainer } from '@/domain-container';
import { notFound } from 'next/navigation';
import type { PlanningPrimitives } from '@/domain/planning/aggregates/planning.aggregate';
import PantryView from './pantry-view';

type Props = {
  planning: PlanningPrimitives;
  planningId: string;
};

export default async function PantryTabContent({ planning, planningId }: Props) {
  const userId = await getUserId();
  if (!userId) notFound();

  const c = getContainer();
  const neededIngredients = await c.getNeededIngredients.execute(planningId);

  return <PantryView planning={planning} neededIngredients={neededIngredients} />;
}
