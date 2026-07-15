import { cookies } from 'next/headers';
import { getContainer } from '@/domain-container';
import { notFound } from 'next/navigation';
import PlanningGrid from './planning-grid';
import PantryView from './pantry-view';
import ShoppingView from './shopping-view';
import TabNav from './tab-nav';

export default async function EditPlanningPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { tab?: string };
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value ?? '';
  if (!userId) notFound();

  const tab = searchParams.tab ?? 'grid';

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

  const neededIngredients =
    tab === 'pantry' ? c.getNeededIngredients.execute(params.id) : [];
  const shoppingList =
    tab === 'shopping' ? c.getShoppingList.execute(params.id) : [];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TabNav planningId={params.id} activeTab={tab} />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'grid' && (
          <PlanningGrid
            planning={primitives}
            recipes={recipes}
            momentTags={momentTags}
            allTags={allTags}
          />
        )}

        {tab === 'pantry' && (
          <PantryView
            planning={primitives}
            neededIngredients={neededIngredients}
          />
        )}

        {tab === 'shopping' && (
          <ShoppingView
            planning={primitives}
            shoppingList={shoppingList}
          />
        )}
      </div>
    </div>
  );
}
