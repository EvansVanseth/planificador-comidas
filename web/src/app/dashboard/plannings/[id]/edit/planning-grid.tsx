'use client';

import { useState } from 'react';
import type { PlanningPrimitives } from '@/domain/planning/aggregates/planning.aggregate';
import { PeopleIcon, PlusIcon, MinusIcon } from '@/components/icons';
import { addDay, removeDay } from '../../actions';
import MealCellModal from './meal-cell-modal';

type Props = {
  planning: PlanningPrimitives;
  recipes: { id: string; name: string; tags: { id: string; dimension: string }[] }[];
  momentTags: { id: string; name: string }[];
};

type CellSelection = {
  dayOrder: number;
  dateLabel: string;
  momentTagId: string;
  momentName: string;
  currentRecipeId: string | null;
  currentCovers: number;
  serviceExclusions: string[];
};

const DAY_COLS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function getDateForDay(startDate: string | null, dayOrder: number): { short: string; label: string } | null {
  if (!startDate) return null;
  const start = new Date(startDate);
  const d = new Date(start);
  d.setDate(start.getDate() + (dayOrder - 1));
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  return {
    short: `${day}/${month}/${year}`,
    label: `${WEEKDAYS[d.getDay()]}, ${d.getDate()} de ${d.toLocaleDateString('es-ES', { month: 'long' })}`,
  };
}

function prevExistingDay(dayMap: Map<number, unknown>, order: number): number | null {
  for (let o = order - 1; o >= 1; o--) {
    if (dayMap.has(o)) return o;
  }
  return null;
}

function nextExistingDay(dayMap: Map<number, unknown>, order: number, max: number): number | null {
  for (let o = order + 1; o <= max; o++) {
    if (dayMap.has(o)) return o;
  }
  return null;
}

export default function PlanningGrid({ planning, recipes, momentTags }: Props) {
  const dayMap = new Map(planning.days.map((d) => [d.order, d]));
  const [cell, setCell] = useState<CellSelection | null>(null);
  const totalDays = planning.weeks * 7;

  const recipeName = (id: string | null) =>
    id ? recipes.find((r) => r.id === id)?.name ?? null : null;

  const weekIndices = Array.from({ length: planning.weeks }, (v, k) => k);

  function buildCell(order: number, momentId: string, momentName: string): CellSelection {
    const dayData = dayMap.get(order);
    const svc = dayData?.services.find((s) => s.time === momentId);
    return {
      dayOrder: order,
      dateLabel: getDateForDay(planning.startdate, order)?.label ?? '',
      momentTagId: momentId,
      momentName,
      currentRecipeId: svc?.recipeId ?? null,
      currentCovers: svc?.covers ?? 1,
      serviceExclusions: svc?.exclusions ?? [],
    };
  }

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
                    const dateInfo = getDateForDay(planning.startdate, order);

                    return (
                      <td
                        key={colIdx}
                        className="border border-[#E2E8F0] align-top"
                      >
                        <div className="min-h-[120px] p-2">
                          <div className="mb-1 flex items-center justify-end gap-0.5">
                            {dateInfo !== null && (
                              <span className="mr-auto text-[11px] font-medium text-[#94A3B8]">
                                {dateInfo.short}
                              </span>
                            )}
                            {!dayData && (
                              <form action={addDay}>
                                <input type="hidden" name="planningId" value={planning.id} />
                                <input type="hidden" name="dayOrder" value={order} />
                                <button
                                  type="submit"
                                  className="rounded-md p-1 text-[#62748E] transition-colors hover:bg-gray-100"
                                  title="Añadir día"
                                >
                                  <PlusIcon size={14} />
                                </button>
                              </form>
                            )}
                            {dayData && (
                              <form action={removeDay}>
                                <input type="hidden" name="planningId" value={planning.id} />
                                <input type="hidden" name="dayOrder" value={order} />
                                <button
                                  type="submit"
                                  className="rounded-md p-1 text-[#62748E] transition-colors hover:bg-red-50 hover:text-red-500"
                                  title="Eliminar día"
                                >
                                  <MinusIcon size={14} />
                                </button>
                              </form>
                            )}
                          </div>

                          {!dayData && (
                            <div className="flex items-center justify-center pt-6">
                              <form action={addDay}>
                                <input type="hidden" name="planningId" value={planning.id} />
                                <input type="hidden" name="dayOrder" value={order} />
                                <button
                                  type="submit"
                                  className="rounded-full border border-dashed border-[#94A3B8] p-2 text-[#62748E] transition-colors hover:border-[#009966] hover:text-[#009966]"
                                  title="Añadir día"
                                >
                                  <PlusIcon size={18} />
                                </button>
                              </form>
                            </div>
                          )}

                          {dayData &&
                            momentTags.map((mt) => {
                              const svc = dayData.services.find(
                                (s) => s.time === mt.id,
                              );
                              return (
                                <button
                                  key={mt.id}
                                  type="button"
                                  onClick={() =>
                                    setCell(buildCell(order, mt.id, mt.name))
                                  }
                                  className="mb-1 w-full rounded-md bg-[#F1F5F9] px-2 py-1.5 text-left transition-colors hover:bg-[#E2E8F0]"
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
                                </button>
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

      {cell && (
        <MealCellModal
          key={`${cell.dayOrder}-${cell.momentTagId}`}
          planningId={planning.id}
          dayOrder={cell.dayOrder}
          dateLabel={cell.dateLabel}
          momentTagId={cell.momentTagId}
          momentName={cell.momentName}
          allRecipes={recipes}
          serviceExclusions={cell.serviceExclusions}
          currentRecipeId={cell.currentRecipeId}
          currentCovers={cell.currentCovers}
          onClose={() => setCell(null)}
          onPrevDay={(() => {
            const prev = prevExistingDay(dayMap, cell.dayOrder);
            return prev !== null ? () => setCell(buildCell(prev, cell.momentTagId, cell.momentName)) : undefined;
          })()}
          onNextDay={(() => {
            const next = nextExistingDay(dayMap, cell.dayOrder, totalDays);
            return next !== null ? () => setCell(buildCell(next, cell.momentTagId, cell.momentName)) : undefined;
          })()}
        />
      )}
    </div>
  );
}
