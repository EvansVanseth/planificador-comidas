import { cookies } from 'next/headers';
import { getContainer } from '@/domain-container';
import { PlusIcon } from '@/components/icons';
import PlanningCard from './planning-card';

export default async function PlanningsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value ?? '';

  const c = getContainer();
  const plannings = c.listPlannings.execute(userId);
  const primitives = plannings.map((p) => p.toPrimitives());

  return (
    <>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172B]">Planificaciones</h1>
          <p className="mt-1 text-base text-[#4F617B]">
            Historial de planificaciones semanales.
          </p>
        </div>
        <a
          href={`/dashboard/plannings/new`}
          className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#007A55] px-4 text-sm font-medium text-white transition-colors hover:bg-[#008055]"
        >
          <PlusIcon />
          Nueva planificación
        </a>
      </div>

      {primitives.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-[#4F617B]">
            No hay planificaciones todavía. ¡Creá la primera!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {primitives.map((p) => (
            <PlanningCard key={p.id} planning={p} userId={userId} />
          ))}
        </div>
      )}
    </>
  );
}
