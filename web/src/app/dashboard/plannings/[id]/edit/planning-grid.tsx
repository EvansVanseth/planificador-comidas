'use client';

import type { PlanningPrimitives } from '@/domain/planning/aggregates/planning.aggregate';
import { PeopleIcon } from '@/components/icons';

type Props = {
  planning: PlanningPrimitives;
  recipes: { id: string; name: string }[];
  momentTags: { id: string; name: string }[];
};

const DAY_COLS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function getDateForDay(startDate: string | null, dayOrder: number): number | null {
  if (!startDate) return null;
  const start = new Date(startDate);
  const d = new Date(start);
  d.setDate(start.getDate() + (dayOrder - 1));
  return d.getDate();
}

export default function PlanningGrid({ planning, recipes, momentTags }: Props) {
  const dayMap = new Map(planning.days.map((d) => [d.order, d]));

  const recipeName = (id: string | null) =>
    id ? recipes.find((r) => r.id === id)?.name ?? null : null;

  const weekIndices = Array.from({ length: planning.weeks }, (v, k) => k);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172B]">
            {planning.name}
          </h1>
          <p className="mt-1 text-sm text-[#62748E]">
            {planning.weeks} {planning.weeks === 1 ? 'semana' : 'semanas'}
            {planning.startdate &&
              ` — desde ${new Date(planning.startdate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr>
              {DAY_COLS.map((day) => (
                <th
                  key={day}
                  className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-[#62748E]"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weekIndices.map((weekIdx) => {
              const weekStart = weekIdx * 7 + 1;
              return (
                <tr key={weekIdx}>
                  {DAY_COLS.map((_day, colIdx) => {
                    const order = weekStart + colIdx;
                    const dayData = dayMap.get(order);
                    const dayNum = getDateForDay(planning.startdate, order);

                    return (
                      <td
                        key={colIdx}
                        className="border border-[#E2E8F0] align-top"
                      >
                        <div className="min-h-[120px] p-2">
                          {dayNum !== null && (
                            <span className="mb-1 block text-right text-[11px] font-medium text-[#94A3B8]">
                              {dayNum}
                            </span>
                          )}

                          {dayData &&
                            momentTags.map((mt) => {
                              const svc = dayData.services.find(
                                (s) => s.time === mt.id,
                              );
                              return (
                                <div
                                  key={mt.id}
                                  className="mb-1 rounded-md bg-[#F1F5F9] px-2 py-1.5"
                                >
                                  <div className="text-[10px] font-medium uppercase tracking-wide text-[#62748E]">
                                    {mt.name}
                                  </div>
                                  {svc?.recipeId ? (
                                    <>
                                      <div className="break-words text-xs font-semibold leading-tight text-[#0F172B]">
                                        {recipeName(svc.recipeId)}
                                      </div>
                                      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[#62748E]">
                                        <PeopleIcon size={12} />
                                        {svc.covers}
                                      </div>
                                    </>
                                  ) : (
                                    <div className="text-[11px] italic text-[#94A3B8]">
                                      Vacío
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
