import { cookies } from 'next/headers';
import { getContainer } from '@/domain-container';
import { notFound } from 'next/navigation';
import PlanningGrid from './planning-grid';

export default async function EditPlanningPage({
  params,
}: {
  params: { id: string };
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value ?? '';
  if (!userId) notFound();

  const c = getContainer();
  const planningList = c.listPlannings.execute(userId);
  const planning = planningList.find((p) => p.getId() === params.id);
  if (!planning) notFound();

  const primitives = planning.toPrimitives();
  const recipes = c.listRecipes.execute(userId);
  const tags = c.listTags.execute(userId);
  const momentTags = tags
    .filter((t) => t.dimension === 'MOMENTO_DIA')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const allTags = tags.map((t) => ({ id: t.id, name: t.name, dimension: t.dimension }));

  return (
    <PlanningGrid
      planning={primitives}
      recipes={recipes}
      momentTags={momentTags}
      allTags={allTags}
    />
  );
}
