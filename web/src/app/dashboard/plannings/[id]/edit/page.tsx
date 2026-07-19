import { Suspense } from 'react';
import { getUserId } from '@/lib/auth';
import { getContainer } from '@/domain-container';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CloseIcon } from '@/components/icons';
import TabNav from './tab-nav';
import GridTabContent from './grid-tab-content';
import PantryTabContent from './pantry-tab-content';
import ShoppingTabContent from './shopping-tab-content';
import { GridLoading, PantryLoading, ShoppingLoading } from './tab-loading';

export default async function EditPlanningPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { tab?: string };
}) {
  const userId = await getUserId();
  if (!userId) notFound();

  const tab = searchParams.tab ?? 'grid';

  const c = getContainer();
  const planningList = await c.listPlannings.execute(userId);
  const planning = planningList.find((p) => p.getId() === params.id);
  if (!planning) notFound();

  const primitives = planning.toPrimitives();

  const recipes = await c.listRecipes.execute(userId);
  const allTags = await c.listTags.execute(userId);
  const calienteTagId = allTags.find((t) => t.systemKey === 'CALIENTE')?.id;
  const frioTags = allTags.filter((t) => t.systemKey === 'FRIO').map((t) => t.id);
  const recipeFormato = new Map(
    recipes.map((r) => [
      r.id,
      {
        isCaliente: calienteTagId ? r.tags.some((t) => t.id === calienteTagId) : false,
        isFrio: r.tags.some((t) => frioTags.includes(t.id)),
      },
    ]),
  );
  let hotCount = 0;
  let coldCount = 0;
  let totalAssigned = 0;
  for (const day of primitives.days) {
    for (const svc of day.services) {
      if (svc.recipeId) {
        totalAssigned++;
        const formato = recipeFormato.get(svc.recipeId);
        if (formato?.isCaliente) hotCount++;
        else if (formato?.isFrio) coldCount++;
      }
    }
  }
  const targetPct = primitives.hotColdBalance ?? 50;
  const actualPct = totalAssigned > 0 ? Math.round((hotCount / totalAssigned) * 100) : null;

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
            {totalAssigned > 0 && actualPct !== null && (
              <div className="mt-2 flex items-center gap-2 text-xs text-[#4F617B]">
                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 font-medium text-red-600">
                  {hotCount} caliente
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-600">
                  {coldCount} frío
                </span>
                <span className="text-[#94A3B8]">·</span>
                <span>
                  {actualPct}% caliente
                  {actualPct !== targetPct && ` (objetivo: ${targetPct}%)`}
                </span>
              </div>
            )}
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

      <div className="flex min-h-0 flex-1 flex-col">
        <Suspense key={tab} fallback={
          tab === 'grid' ? <GridLoading /> :
          tab === 'pantry' ? <PantryLoading /> :
          <ShoppingLoading />
        }>
          {tab === 'grid' && <GridTabContent planning={primitives} />}
          {tab === 'pantry' && <PantryTabContent planning={primitives} planningId={params.id} />}
          {tab === 'shopping' && <ShoppingTabContent planning={primitives} planningId={params.id} />}
        </Suspense>
      </div>
    </div>
  );
}
