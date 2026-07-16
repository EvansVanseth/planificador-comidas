import { cookies } from 'next/headers';
import { getContainer } from '@/domain-container';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CloseIcon } from '@/components/icons';
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
      <div className="shrink-0 space-y-4 border-b border-gray-200 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172B]">
              {primitives.name}
            </h1>
            <p className="mt-1 text-sm text-[#4F617B]">
              {primitives.weeks} {primitives.weeks === 1 ? 'semana' : 'semanas'}
              {primitives.startdate &&
                ` — desde ${new Date(primitives.startdate + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`}
            </p>
          </div>
          <Link
            href="/dashboard/plannings"
            className="rounded-md p-2 text-[#4F617B] transition-colors hover:bg-gray-100"
            title="Volver a planificaciones"
          >
            <CloseIcon />
          </Link>
        </div>

        <TabNav planningId={params.id} activeTab={tab} />
      </div>

      <div className="min-h-0 flex-1">
        {tab === 'grid' && (
          <div className="h-full overflow-y-auto">
            <PlanningGrid
              planning={primitives}
              recipes={recipes}
              momentTags={momentTags}
              allTags={allTags}
            />
          </div>
        )}

        {tab === 'pantry' && (
          <PantryView
            planning={primitives}
            neededIngredients={neededIngredients}
          />
        )}

        {tab === 'shopping' && (
          <div className="h-full overflow-y-auto">
            <ShoppingView
              planning={primitives}
              shoppingList={shoppingList}
            />
          </div>
        )}
      </div>
    </div>
  );
}
