import { getUserId } from '@/lib/auth';
import { getContainer } from '@/domain-container';
import { notFound } from 'next/navigation';
import type { PlanningPrimitives } from '@/domain/planning/aggregates/planning.aggregate';
import type { RecipePrimitives } from '@/domain/recipes/aggregates/recipe.aggregate';
import PlanningGrid from './planning-grid';
import MobilePlanningGrid from './mobile-planning-grid';

type Props = {
  planning: PlanningPrimitives;
};

export default async function GridTabContent({ planning }: Props) {
  const userId = await getUserId();
  if (!userId) notFound();

  const c = getContainer();
  const recipes: RecipePrimitives[] = await c.listRecipes.execute(userId);
  const tags = await c.listTags.execute(userId);

  const momentTags = tags
    .filter((t) => t.dimension === 'MOMENTO_DIA')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const allTags = tags.map((t) => ({ id: t.id, name: t.name, dimension: t.dimension }));

  return (
    <>
      <div className="hidden min-h-0 flex-1 overflow-y-auto md:block">
        <PlanningGrid
          planning={planning}
          recipes={recipes}
          momentTags={momentTags}
          allTags={allTags}
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col md:hidden">
        <MobilePlanningGrid
          planning={planning}
          recipes={recipes}
          momentTags={momentTags}
          allTags={allTags}
        />
      </div>
    </>
  );
}
