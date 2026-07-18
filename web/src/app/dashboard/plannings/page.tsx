import { getUserId } from '@/lib/auth';
import { getContainer } from '@/domain-container';
import { PlusIcon } from '@/components/icons';
import PlanningCard from './planning-card';

export default async function PlanningsPage() {
  const userId = await getUserId();

  const c = getContainer();
  const plannings = await c.listPlannings.execute(userId);
  const primitives = plannings.map((p) => p.toPrimitives());

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-gray-200 pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172B]">Planificaciones</h1>
            <p className="mt-1 text-base text-[#4F617B]">
              Historial de planificaciones semanales.
            </p>
          </div>
          <a
            href={`/dashboard/plannings/new`}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[#007A55] px-4 text-sm font-medium text-white transition-colors hover:bg-[#008055] md:w-auto"
          >
            <PlusIcon />
            Nueva planificación
          </a>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {primitives.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-sm text-[#4F617B]">
              No hay planificaciones todavía. ¡Crea la primera!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {primitives.map((p) => (
              <PlanningCard key={p.id} planning={p} userId={userId} />
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-gray-200 pt-3 text-xs text-[#4F617B]">
        Mostrando {primitives.length} planificación{primitives.length === 1 ? '' : 'es'}
      </div>
    </div>
  );
}
