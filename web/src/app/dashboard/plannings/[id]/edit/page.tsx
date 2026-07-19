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
