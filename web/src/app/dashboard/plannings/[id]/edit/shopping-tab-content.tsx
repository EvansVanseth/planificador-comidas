import { getUserId } from '@/lib/auth';
import { getContainer } from '@/domain-container';
import { notFound } from 'next/navigation';
import type { PlanningPrimitives } from '@/domain/planning/aggregates/planning.aggregate';
import ShoppingView from './shopping-view';

type Props = {
  planning: PlanningPrimitives;
  planningId: string;
};

export default async function ShoppingTabContent({ planning, planningId }: Props) {
  const userId = await getUserId();
  if (!userId) notFound();

  const c = getContainer();
  const shoppingList = await c.getShoppingList.execute(planningId);

  return <ShoppingView planning={planning} shoppingList={shoppingList} />;
}
