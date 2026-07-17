'use client';

import { useState, useTransition } from 'react';
import type { PlanningPrimitives } from '@/domain/planning/aggregates/planning.aggregate';
import { PeopleIcon, PlusIcon, MinusIcon, CloseIcon, WandIcon } from '@/components/icons';
import { addDay, removeDay, addAllDays, removeMeal, clearAllRecipes, autoSchedule } from '../../actions';
import MealCellModal from './meal-cell-modal';
import EditPlanningModal from './edit-planning-modal';
import BulkAddServiceModal from './bulk-add-service-modal';

type Props = {
  planning: PlanningPrimitives;
  recipes: { id: string; name: string; tags: { id: string; dimension: string }[] }[];
  momentTags: { id: string; name: string }[];
  allTags: { id: string; name: string; dimension: string }[];
};

type CellSelection = {
  dayOrder: number;
  dateLabel: string;
  momentTagId: string;
  momentName: string;
  currentRecipeId: string | null;
  currentCovers: number;
  serviceExclusions: string[];
  servicePreferences: string[];
  currentIgnoreRestrictions: boolean;
};

const DAY_COLS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function parseStartDate(str: string | null | undefined): Date | null {
  if (!str) return null;
  if (str.includes('T')) return new Date(str);
  return new Date(str + 'T00:00:00');
}

function getDateForDay(startDate: string | null, dayOrder: number): { short: string; label: string } | null {
  if (!startDate) return null;
  const start = parseStartDate(startDate)!;
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

export default function PlanningGrid({ planning, recipes, momentTags, allTags }: Props) {
  const dayMap = new Map(planning.days.map((d) => [d.order, d]));
  const [cell, setCell] = useState<CellSelection | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [removeConfirmDay, setRemoveConfirmDay] = useState<number | null>(null);
  const [removeConfirmMeal, setRemoveConfirmMeal] = useState<{ dayOrder: number; momentTagId: string } | null>(null);
  const [showClearRecipesConfirm, setShowClearRecipesConfirm] = useState(false);
  const [showAddDaysConfirm, setShowAddDaysConfirm] = useState(false);
  const [showBulkAddService, setShowBulkAddService] = useState(false);
  const [showAutoSchedule, setShowAutoSchedule] = useState(false);
  const [, startTransition] = useTransition();
  const totalDays = planning.weeks * 7;

  function handleRemoveDay(order: number, servicesLength: number) {
    if (servicesLength > 0) {
      setRemoveConfirmDay(order);
      return;
    }
    startTransition(() => {
      const fd = new FormData();
      fd.append('planningId', planning.id);
      fd.append('dayOrder', String(order));
      removeDay(fd);
    });
  }

  const recipeName = (id: string | null) =>
    id ? recipes.find((r) => r.id === id)?.name ?? null : null;

  const tagName = (id: string) =>
    allTags.find((t) => t.id === id)?.name ?? id;

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
      servicePreferences: svc?.preferences ?? [],
      currentIgnoreRestrictions: svc?.ignoreRestrictions ?? false,
    };
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowEditModal(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3.5 text-sm font-medium text-[#0F172B] transition-colors hover:bg-gray-50"
        >
          Editar datos
        </button>
        <button
          type="button"
          onClick={() => setShowAddDaysConfirm(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3.5 text-sm font-medium text-[#0F172B] transition-colors hover:bg-gray-50"
        >
          <PlusIcon size={14} />
          Añadir todos los días
        </button>
        <button
          type="button"
          onClick={() => setShowBulkAddService(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3.5 text-sm font-medium text-[#0F172B] transition-colors hover:bg-gray-50"
        >
          Añadir servicio
        </button>
        <button
          type="button"
          onClick={() => setShowAutoSchedule(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#007A55] to-[#0D9488] px-4 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110"
        >
          <WandIcon size={16} />
          Autoplanificar
        </button>
        <button
          type="button"
          onClick={() => setShowClearRecipesConfirm(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          Limpiar recetas
        </button>
      </div>

      {showEditModal && (
        <EditPlanningModal
          planningId={planning.id}
          initialName={planning.name}
          initialWeeks={planning.weeks}
          initialStartDate={planning.startdate}
          initialBalance={planning.hotColdBalance ?? 50}
          onClose={() => setShowEditModal(false)}
        />
      )}

      <div className="overflow-hidden rounded-xl border border-[#CBD5E1] bg-white shadow-sm">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr>
              {DAY_COLS.map((day) => (
                <th
                  key={day}
                  className="border-b-2 border-[#CBD5E1] bg-[#F1F5F9] px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#475569]"
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
                        className="border border-[#CBD5E1] align-top"
                      >
                        <div className="min-h-[140px] p-2.5">
                          <div className="mb-1 flex items-center justify-end gap-0.5">
                            {dateInfo !== null && (
                              <span className="mr-auto text-[11px] font-semibold text-[#4F617B]">
                                {dateInfo.short}
                              </span>
                            )}
                            {!dayData && (
                              <form action={addDay}>
                                <input type="hidden" name="planningId" value={planning.id} />
                                <input type="hidden" name="dayOrder" value={order} />
                                <button
                                  type="submit"
                                  className="rounded-md p-1 text-[#4F617B] transition-colors hover:bg-gray-100"
                                  title="Añadir día"
                                >
                                  <PlusIcon size={14} />
                                </button>
                              </form>
                            )}
                            {dayData && (
                              <button
                                type="button"
                                onClick={() => handleRemoveDay(order, dayData.services.length)}
                                className="rounded-md p-1 text-[#4F617B] transition-colors hover:bg-red-50 hover:text-red-500"
                                title="Eliminar día"
                              >
                                <MinusIcon size={14} />
                              </button>
                            )}
                          </div>

                          {!dayData && (
                            <div className="flex items-center justify-center pt-6">
                              <form action={addDay}>
                                <input type="hidden" name="planningId" value={planning.id} />
                                <input type="hidden" name="dayOrder" value={order} />
                                <button
                                  type="submit"
                                  className="rounded-full border border-dashed border-[#94A3B8] p-2 text-[#4F617B] transition-colors hover:border-[#007A55] hover:text-[#007A55]"
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
                              if (svc) {
                                return (
                                  <div key={mt.id} className="group relative mb-1.5">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setCell(buildCell(order, mt.id, mt.name))
                                      }
                                      className="w-full rounded-md border border-[#D1FAE5] bg-[#F0FDF4] px-2 py-1.5 text-left transition-colors hover:bg-[#D1FAE5]"
                                    >
                                      <div className="text-[10px] font-semibold uppercase tracking-wide text-[#007A55]">
                                        {mt.name}
                                      </div>
                                      {svc.recipeId ? (
                                        <>
                                          <div className="break-words text-xs font-semibold leading-tight text-[#0F172B]">
                                            {recipeName(svc.recipeId)}
                                          </div>
                                          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[#4F617B]">
                                            <PeopleIcon size={12} />
                                            {svc.covers}
                                            {svc.preferences && svc.preferences.length > 0 && (
                                              <span className="ml-auto text-green-700" title={`Preferencias: ${svc.preferences.map((id) => tagName(id)).join(', ')}`}>
                                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8l3 3 5-5" /></svg>
                                              </span>
                                            )}
                                            {svc.exclusions && svc.exclusions.length > 0 && (
                                              <span className="text-red-500" title={`Exclusiones: ${svc.exclusions.map((id) => tagName(id)).join(', ')}`}>
                                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4l8 8" /><path d="M12 4l-8 8" /></svg>
                                              </span>
                                            )}
                                          </div>
                                        </>
                                      ) : (
                                        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[#4F617B]">
                                          <PeopleIcon size={12} />
                                          {svc.covers}
                                          {svc.preferences && svc.preferences.length > 0 && (
                                            <span className="ml-auto text-green-700" title={`Preferencias: ${svc.preferences.map((id) => tagName(id)).join(', ')}`}>
                                              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8l3 3 5-5" /></svg>
                                            </span>
                                          )}
                                          {svc.exclusions && svc.exclusions.length > 0 && (
                                            <span className="text-red-500" title={`Exclusiones: ${svc.exclusions.map((id) => tagName(id)).join(', ')}`}>
                                              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4l8 8" /><path d="M12 4l-8 8" /></svg>
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setRemoveConfirmMeal({ dayOrder: order, momentTagId: mt.id })}
                                      className="absolute right-0 top-0 hidden rounded-md p-0.5 text-[#4F617B] transition-colors hover:text-red-500 group-hover:block"
                                      title="Eliminar servicio"
                                    >
                                      <CloseIcon />
                                    </button>
                                  </div>
                                );
                              }
                              return (
                                <div key={mt.id} className="mb-1.5">
                                  <div className="flex items-center">
                                    <span className="rounded-l-md border border-dashed border-[#CBD5E1] bg-white px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#4F617B]">
                                      {mt.name}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setCell(buildCell(order, mt.id, mt.name))
                                      }
                                      className="rounded-r-md border-b border-r border-t border-dashed border-[#CBD5E1] bg-white px-1.5 py-1.5 text-[#4F617B] transition-colors hover:bg-[#F0FDF4] hover:text-[#007A55]"
                                      title="Añadir servicio"
                                    >
                                      <PlusIcon size={14} />
                                    </button>
                                  </div>
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

      {cell && (
        <MealCellModal
          key={`${cell.dayOrder}-${cell.momentTagId}`}
          planningId={planning.id}
          dayOrder={cell.dayOrder}
          dateLabel={cell.dateLabel}
          momentTagId={cell.momentTagId}
          momentName={cell.momentName}
          allRecipes={recipes}
          allTags={allTags}
          serviceExclusions={cell.serviceExclusions}
          servicePreferences={cell.servicePreferences}
          currentRecipeId={cell.currentRecipeId}
          currentCovers={cell.currentCovers}
          currentIgnoreRestrictions={cell.currentIgnoreRestrictions}
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

      {removeConfirmDay !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setRemoveConfirmDay(null)}
          />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-lg font-semibold text-[#0F172B]">
              Eliminar día
            </h2>
            <p className="mb-4 text-sm text-[#4F617B]">
              ¿Estás seguro de que quieres eliminar el día {removeConfirmDay} y todos sus servicios?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRemoveConfirmDay(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-[#4F617B] transition-colors hover:bg-gray-50"
              >
                Cancelar
              </button>
              <form action={removeDay} onSubmit={() => setRemoveConfirmDay(null)}>
                <input type="hidden" name="planningId" value={planning.id} />
                <input type="hidden" name="dayOrder" value={removeConfirmDay} />
                <button
                  type="submit"
                  className="rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#B91C1C]"
                >
                  Eliminar
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {removeConfirmMeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setRemoveConfirmMeal(null)}
          />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-lg font-semibold text-[#0F172B]">
              Eliminar servicio
            </h2>
            <p className="mb-4 text-sm text-[#4F617B]">
              ¿Estás seguro de que quieres eliminar este servicio?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRemoveConfirmMeal(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-[#4F617B] transition-colors hover:bg-gray-50"
              >
                Cancelar
              </button>
              <form action={removeMeal} onSubmit={() => setRemoveConfirmMeal(null)}>
                <input type="hidden" name="planningId" value={planning.id} />
                <input type="hidden" name="dayOrder" value={removeConfirmMeal.dayOrder} />
                <input type="hidden" name="momentTagId" value={removeConfirmMeal.momentTagId} />
                <button
                  type="submit"
                  className="rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#B91C1C]"
                >
                  Eliminar
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showClearRecipesConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowClearRecipesConfirm(false)}
          />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-lg font-semibold text-[#0F172B]">
              Limpiar todas las recetas
            </h2>
            <p className="mb-4 text-sm text-[#4F617B]">
              ¿Estás seguro de que quieres eliminar las recetas de todos los servicios?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowClearRecipesConfirm(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-[#4F617B] transition-colors hover:bg-gray-50"
              >
                Cancelar
              </button>
              <form action={clearAllRecipes} onSubmit={() => setShowClearRecipesConfirm(false)}>
                <input type="hidden" name="planningId" value={planning.id} />
                <button
                  type="submit"
                  className="rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#B91C1C]"
                >
                  Limpiar
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showAddDaysConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowAddDaysConfirm(false)}
          />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-lg font-semibold text-[#0F172B]">
              Añadir todos los días
            </h2>
            <p className="mb-4 text-sm text-[#4F617B]">
              Se añadirán los {planning.weeks * 7 - planning.days.length} días que faltan para completar las {planning.weeks} {planning.weeks === 1 ? 'semana' : 'semanas'} del planning.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddDaysConfirm(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-[#4F617B] transition-colors hover:bg-gray-50"
              >
                Cancelar
              </button>
              <form action={addAllDays} onSubmit={() => setShowAddDaysConfirm(false)}>
                <input type="hidden" name="planningId" value={planning.id} />
                <input type="hidden" name="weeks" value={planning.weeks} />
                <input type="hidden" name="existingDays" value={planning.days.map((d) => d.order).join(',')} />
                <button
                  type="submit"
                  className="rounded-lg bg-[#007A55] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#008055]"
                >
                  Añadir
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showBulkAddService && (
        <BulkAddServiceModal
          planningId={planning.id}
          momentTags={momentTags}
          allTags={allTags}
          onClose={() => setShowBulkAddService(false)}
        />
      )}

      {showAutoSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowAutoSchedule(false)}
          />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-lg font-semibold text-[#0F172B]">
              Autoplanificar
            </h2>
            <p className="mb-4 text-sm text-[#4F617B]">
              ¿Estás seguro de que quieres autoplanificar? Se asignarán recetas a todos los servicios vacíos según las preferencias, exclusiones y balance establecidos.
            </p>
            <p className="mb-4 text-sm text-[#4F617B]">
              Los servicios que ya tengan receta no se modificarán.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAutoSchedule(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-[#4F617B] transition-colors hover:bg-gray-50"
              >
                Cancelar
              </button>
              <form action={autoSchedule} onSubmit={() => setShowAutoSchedule(false)}>
                <input type="hidden" name="planningId" value={planning.id} />
                <button
                  type="submit"
                  className="rounded-lg bg-gradient-to-r from-[#007A55] to-[#0D9488] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110"
                >
                  Autoplanificar
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
