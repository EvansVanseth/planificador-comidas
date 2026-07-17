'use client';

import { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { PlanningPrimitives } from '@/domain/planning/aggregates/planning.aggregate';
import {
  PeopleIcon, PlusIcon, MinusIcon, CloseIcon, WandIcon,
  PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon,
} from '@/components/icons';
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

const DAY_NAMES = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const WEEKDAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

function parseStartDate(str: string | null | undefined): Date | null {
  if (!str) return null;
  if (str.includes('T')) return new Date(str);
  return new Date(str + 'T00:00:00');
}

function getDateForDay(startDate: string | null, dayOrder: number): { dayOfWeek: string; dateStr: string } | null {
  if (!startDate) return null;
  const start = parseStartDate(startDate)!;
  const d = new Date(start);
  d.setDate(start.getDate() + (dayOrder - 1));
  return {
    dayOfWeek: WEEKDAY_NAMES[d.getDay()],
    dateStr: `${d.getDate()} de ${d.toLocaleDateString('es-ES', { month: 'long' })}`,
  };
}

export default function MobilePlanningGrid({ planning, recipes, momentTags, allTags }: Props) {
  const dayMap = new Map(planning.days.map((d) => [d.order, d]));
  const totalDays = planning.weeks * 7;
  const dayOrders = Array.from({ length: totalDays }, (_, i) => i + 1);
  const existingDayOrders = planning.days.map((d) => d.order).sort((a, b) => a - b);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    skipSnaps: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cell, setCell] = useState<CellSelection | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [removeConfirmDay, setRemoveConfirmDay] = useState<number | null>(null);
  const [removeConfirmMeal, setRemoveConfirmMeal] = useState<{ dayOrder: number; momentTagId: string } | null>(null);
  const [showClearRecipesConfirm, setShowClearRecipesConfirm] = useState(false);
  const [showBulkAddService, setShowBulkAddService] = useState(false);
  const [showAutoSchedule, setShowAutoSchedule] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();

    if (existingDayOrders.length > 0) {
      const firstIndex = dayOrders.indexOf(existingDayOrders[0]);
      if (firstIndex > 0) {
        setTimeout(() => emblaApi.scrollTo(firstIndex), 0);
      }
    }
  }, [emblaApi, dayOrders, existingDayOrders]);

  const scrollTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

  const recipeName = (id: string | null) =>
    id ? recipes.find((r) => r.id === id)?.name ?? null : null;

  const tagName = (id: string) =>
    allTags.find((t) => t.id === id)?.name ?? id;

  function buildCell(order: number, momentId: string, momentName: string): CellSelection {
    const dd = dayMap.get(order);
    const svc = dd?.services.find((s) => s.time === momentId);
    return {
      dayOrder: order,
      dateLabel: getDateForDay(planning.startdate, order)?.dateStr ?? '',
      momentTagId: momentId,
      momentName,
      currentRecipeId: svc?.recipeId ?? null,
      currentCovers: svc?.covers ?? 1,
      serviceExclusions: svc?.exclusions ?? [],
      servicePreferences: svc?.preferences ?? [],
      currentIgnoreRestrictions: svc?.ignoreRestrictions ?? false,
    };
  }

  const weekRows = Array.from({ length: planning.weeks }, (_, weekIdx) => {
    const weekStart = weekIdx * 7;
    return DAY_NAMES.map((_day, colIdx) => {
      const order = weekStart + colIdx + 1;
      const dd = dayMap.get(order);
      const servicesCount = dd ? dd.services.filter((s) => s.recipeId).length : 0;
      const orderIndex = dayOrders.indexOf(order);
      return { order, orderIndex, dd, servicesCount };
    });
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-gray-200 px-2 py-2">
        <button
          type="button"
          onClick={() => setShowEditModal(true)}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#0F172B] transition-colors hover:bg-gray-50"
          title="Editar datos"
        >
          <PencilIcon />
        </button>
        <form action={addAllDays}>
          <input type="hidden" name="planningId" value={planning.id} />
          <input type="hidden" name="weeks" value={planning.weeks} />
          <input type="hidden" name="existingDays" value={planning.days.map((d) => d.order).join(',')} />
          <button
            type="submit"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#0F172B] transition-colors hover:bg-gray-50"
            title="Añadir todos los días"
          >
            <PlusIcon size={18} />
          </button>
        </form>
        <button
          type="button"
          onClick={() => setShowBulkAddService(true)}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#0F172B] transition-colors hover:bg-gray-50"
          title="Añadir servicio"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2.5" y="2.5" width="15" height="15" rx="2" strokeDasharray="2 2" />
            <path d="M10 6v8M6 10h8" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setShowAutoSchedule(true)}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-gradient-to-r from-[#007A55] to-[#0D9488] text-white transition-all hover:brightness-110"
          title="Autoplanificar"
        >
          <WandIcon size={18} />
        </button>

        <div className="mx-1 h-6 w-px bg-gray-200" />

        <button
          type="button"
          onClick={() => {
            const order = dayOrders[selectedIndex];
            const dd = dayMap.get(order);
            if (dd && dd.services.length > 0) {
              setRemoveConfirmDay(order);
            } else {
              const fd = new FormData();
              fd.append('planningId', planning.id);
              fd.append('dayOrder', String(order));
              removeDay(fd);
            }
          }}
          disabled={!dayMap.has(dayOrders[selectedIndex])}
          className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-lg border border-red-200 bg-white text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
          title="Eliminar día actual"
        >
          <MinusIcon size={16} />
          <span className="text-[9px] font-medium leading-none">Día</span>
        </button>
        <button
          type="button"
          onClick={() => setShowClearRecipesConfirm(true)}
          className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-lg border border-red-200 bg-white text-red-600 transition-colors hover:bg-red-50"
          title="Limpiar recetas"
        >
          <TrashIcon />
          <span className="text-[9px] font-medium leading-none">Recetas</span>
        </button>
      </div>

      {/* Swipeable area */}
      <div className="min-h-0 flex-1 overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {dayOrders.map((order) => {
            const dd = dayMap.get(order);
            const date = getDateForDay(planning.startdate, order);
            return (
              <div key={order} className="min-w-0 shrink-0 grow-0 basis-full">
                <div className="flex h-full flex-col px-4 py-3">
                  {/* Day header */}
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      {date ? (
                        <>
                          <h2 className="text-lg font-bold text-[#0F172B]">{date.dayOfWeek}</h2>
                          <p className="text-sm text-[#4F617B]">{date.dateStr}</p>
                        </>
                      ) : (
                        <h2 className="text-lg font-bold text-[#0F172B]">Día {order}</h2>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => scrollTo(Math.max(0, selectedIndex - 1))}
                        disabled={selectedIndex === 0}
                        className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-[#4F617B] transition-colors hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent"
                      >
                        <ChevronLeftIcon size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollTo(Math.min(dayOrders.length - 1, selectedIndex + 1))}
                        disabled={selectedIndex === dayOrders.length - 1}
                        className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-[#4F617B] transition-colors hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent"
                      >
                        <ChevronRightIcon size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Day content */}
                  {dd ? (
                    <div className="flex-1 space-y-3 overflow-y-auto">
                      {momentTags.map((mt) => {
                        const svc = dd.services.find((s) => s.time === mt.id);
                        if (svc) {
                          return (
                            <div key={mt.id} className="relative">
                              <button
                                type="button"
                                onClick={() => setCell(buildCell(order, mt.id, mt.name))}
                                className="w-full rounded-xl border border-[#D1FAE5] bg-[#F0FDF4] px-4 py-3 text-left transition-colors hover:bg-[#D1FAE5]"
                              >
                                <div className="text-xs font-semibold uppercase tracking-wide text-[#007A55]">
                                  {mt.name}
                                </div>
                                {svc.recipeId ? (
                                  <>
                                    <div className="mt-0.5 text-sm font-semibold text-[#0F172B]">
                                      {recipeName(svc.recipeId)}
                                    </div>
                                    <div className="mt-1 flex items-center gap-2 text-xs text-[#4F617B]">
                                      <PeopleIcon size={14} />
                                      {svc.covers}
                                      {svc.preferences && svc.preferences.length > 0 && (
                                        <span className="text-green-700" title={`Preferencias: ${svc.preferences.map((id) => tagName(id)).join(', ')}`}>
                                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8l3 3 5-5" /></svg>
                                        </span>
                                      )}
                                      {svc.exclusions && svc.exclusions.length > 0 && (
                                        <span className="text-red-500" title={`Exclusiones: ${svc.exclusions.map((id) => tagName(id)).join(', ')}`}>
                                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4l8 8" /><path d="M12 4l-8 8" /></svg>
                                        </span>
                                      )}
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="mt-0.5 text-sm italic text-[#4F617B]">
                                      Sin asignar
                                    </div>
                                    <div className="mt-1 flex items-center gap-2 text-xs text-[#4F617B]">
                                      <PeopleIcon size={14} />
                                      {svc.covers}
                                    </div>
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setRemoveConfirmMeal({ dayOrder: order, momentTagId: mt.id })}
                                className="absolute right-2 top-2 rounded-md p-1 text-[#4F617B] transition-colors hover:text-red-500"
                                title="Eliminar servicio"
                              >
                                <CloseIcon />
                              </button>
                            </div>
                          );
                        }
                        return (
                          <button
                            key={mt.id}
                            type="button"
                            onClick={() => setCell(buildCell(order, mt.id, mt.name))}
                            className="flex w-full items-center gap-3 rounded-xl border border-dashed border-[#CBD5E1] bg-white px-4 py-3 text-left transition-colors hover:bg-[#F0FDF4] hover:text-[#007A55]"
                          >
                            <span className="text-xs font-semibold uppercase tracking-wide text-[#4F617B]">
                              {mt.name}
                            </span>
                            <PlusIcon size={16} />
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-1 items-center justify-center">
                      <form action={addDay}>
                        <input type="hidden" name="planningId" value={planning.id} />
                        <input type="hidden" name="dayOrder" value={order} />
                        <button
                          type="submit"
                          className="flex flex-col items-center gap-2 rounded-full border border-dashed border-[#94A3B8] p-6 text-[#4F617B] transition-colors hover:border-[#007A55] hover:text-[#007A55]"
                          title="Añadir día"
                        >
                          <PlusIcon size={24} />
                          <span className="text-xs font-medium">Añadir día</span>
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Week progress bar */}
      <div className="shrink-0 border-t border-gray-200 bg-white px-2 py-2 rounded-t-xl">
        {weekRows.map((week, weekIdx) => (
          <div key={weekIdx} className="mb-1 flex items-center gap-0.5 last:mb-0">
            <span className="mr-1 w-6 text-[10px] font-semibold uppercase text-[#4F617B]">
              {weekIdx + 1}
            </span>
            {week.map(({ order, orderIndex, dd, servicesCount }) => {
              const isCurrent = orderIndex === selectedIndex;
              const hasDay = !!dd;
              return (
                <button
                  key={order}
                  type="button"
                  onClick={() => scrollTo(orderIndex)}
                  className={`flex min-w-0 flex-1 items-center justify-center rounded-lg py-1.5 text-[11px] font-semibold transition-colors ${
                    isCurrent
                      ? 'bg-[#A7F3D0] text-[#007A55] ring-1 ring-[#007A55]'
                      : hasDay && servicesCount > 0
                        ? 'bg-[#D1FAE5] text-[#007A55]'
                        : hasDay
                          ? 'bg-[#D1FAE5] text-[#4F617B]'
                          : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {hasDay && servicesCount > 0 ? servicesCount : DAY_NAMES[orderIndex % 7]}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Modals and confirmations */}
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
            const idx = existingDayOrders.indexOf(cell.dayOrder);
            return idx > 0
              ? () => setCell(buildCell(existingDayOrders[idx - 1], cell.momentTagId, cell.momentName))
              : undefined;
          })()}
          onNextDay={(() => {
            const idx = existingDayOrders.indexOf(cell.dayOrder);
            return idx < existingDayOrders.length - 1
              ? () => setCell(buildCell(existingDayOrders[idx + 1], cell.momentTagId, cell.momentName))
              : undefined;
          })()}
        />
      )}

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

      {removeConfirmDay !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setRemoveConfirmDay(null)} />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-lg font-semibold text-[#0F172B]">Eliminar día</h2>
            <p className="mb-4 text-sm text-[#4F617B]">¿Estás seguro de que quieres eliminar el día {removeConfirmDay} y todos sus servicios?</p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setRemoveConfirmDay(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-[#4F617B] transition-colors hover:bg-gray-50">Cancelar</button>
              <form action={removeDay} onSubmit={() => setRemoveConfirmDay(null)}>
                <input type="hidden" name="planningId" value={planning.id} />
                <input type="hidden" name="dayOrder" value={removeConfirmDay} />
                <button type="submit" className="rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#B91C1C]">Eliminar</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {removeConfirmMeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setRemoveConfirmMeal(null)} />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-lg font-semibold text-[#0F172B]">Eliminar servicio</h2>
            <p className="mb-4 text-sm text-[#4F617B]">¿Estás seguro de que quieres eliminar este servicio?</p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setRemoveConfirmMeal(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-[#4F617B] transition-colors hover:bg-gray-50">Cancelar</button>
              <form action={removeMeal} onSubmit={() => setRemoveConfirmMeal(null)}>
                <input type="hidden" name="planningId" value={planning.id} />
                <input type="hidden" name="dayOrder" value={removeConfirmMeal.dayOrder} />
                <input type="hidden" name="momentTagId" value={removeConfirmMeal.momentTagId} />
                <button type="submit" className="rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#B91C1C]">Eliminar</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showClearRecipesConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowClearRecipesConfirm(false)} />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-lg font-semibold text-[#0F172B]">Limpiar todas las recetas</h2>
            <p className="mb-4 text-sm text-[#4F617B]">¿Estás seguro de que quieres eliminar las recetas de todos los servicios?</p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowClearRecipesConfirm(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-[#4F617B] transition-colors hover:bg-gray-50">Cancelar</button>
              <form action={clearAllRecipes} onSubmit={() => setShowClearRecipesConfirm(false)}>
                <input type="hidden" name="planningId" value={planning.id} />
                <button type="submit" className="rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#B91C1C]">Limpiar</button>
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
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAutoSchedule(false)} />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-lg font-semibold text-[#0F172B]">Autoplanificar</h2>
            <p className="mb-4 text-sm text-[#4F617B]">¿Estás seguro de que quieres autoplanificar? Se asignarán recetas a todos los servicios vacíos según las preferencias, exclusiones y balance establecidos.</p>
            <p className="mb-4 text-sm text-[#4F617B]">Los servicios que ya tengan receta no se modificarán.</p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowAutoSchedule(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-[#4F617B] transition-colors hover:bg-gray-50">Cancelar</button>
              <form action={autoSchedule} onSubmit={() => setShowAutoSchedule(false)}>
                <input type="hidden" name="planningId" value={planning.id} />
                <button type="submit" className="rounded-lg bg-gradient-to-r from-[#007A55] to-[#0D9488] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110">Autoplanificar</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
