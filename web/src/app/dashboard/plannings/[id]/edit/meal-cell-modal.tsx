'use client';

import { useState, useMemo } from 'react';
import { assignMeal } from '../../actions';
import { CloseIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';

type Props = {
  planningId: string;
  dayOrder: number;
  dateLabel: string;
  momentTagId: string;
  momentName: string;
  allRecipes: { id: string; name: string; tags: { id: string; dimension: string }[] }[];
  serviceExclusions: string[];
  currentRecipeId: string | null;
  currentCovers: number;
  onClose: () => void;
  onPrevDay?: () => void;
  onNextDay?: () => void;
};

export default function MealCellModal({
  planningId,
  dayOrder,
  dateLabel,
  momentTagId,
  momentName,
  allRecipes,
  serviceExclusions,
  currentRecipeId,
  currentCovers,
  onClose,
  onPrevDay,
  onNextDay,
}: Props) {
  const [selectedRecipe, setSelectedRecipe] = useState(currentRecipeId ?? '');

  const filteredRecipes = useMemo(() => {
    return allRecipes.filter((r) => {
      const momentTags = r.tags.filter((t) => t.dimension === 'MOMENTO_DIA');
      if (momentTags.length > 0 && !momentTags.some((t) => t.id === momentTagId)) {
        return false;
      }
      if (serviceExclusions.some((ex) => r.tags.some((t) => t.id === ex))) {
        return false;
      }
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [allRecipes, momentTagId, serviceExclusions]);

  const [covers, setCovers] = useState(currentCovers);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#0F172B]">
            {momentName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[#62748E] transition-colors hover:bg-gray-100"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between text-sm text-[#62748E]">
          <span>
            Día {dayOrder}{dateLabel ? ` — ${dateLabel}` : ''}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={!onPrevDay}
              onClick={onPrevDay}
              className={`rounded-md p-1 transition-colors ${
                onPrevDay
                  ? 'text-[#62748E] hover:bg-gray-100'
                  : 'text-gray-300'
              }`}
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              disabled={!onNextDay}
              onClick={onNextDay}
              className={`rounded-md p-1 transition-colors ${
                onNextDay
                  ? 'text-[#62748E] hover:bg-gray-100'
                  : 'text-gray-300'
              }`}
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>

        <form action={assignMeal} onSubmit={onClose} className="space-y-4">
          <input type="hidden" name="planningId" value={planningId} />
          <input type="hidden" name="dayOrder" value={dayOrder} />
          <input type="hidden" name="momentTagId" value={momentTagId} />

          <div>
            <label className="mb-1 block text-sm font-medium text-[#0F172B]">
              Receta
            </label>
            <select
              name="recipeId"
              value={selectedRecipe}
              onChange={(e) => setSelectedRecipe(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#009966] focus:outline-none focus:ring-2 focus:ring-[#009966]/20"
            >
              <option value="">— Sin receta —</option>
              {filteredRecipes.length === 0 ? (
                <option value="" disabled>
                  No hay recetas disponibles
                </option>
              ) : (
                filteredRecipes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))
              )}
            </select>
            {filteredRecipes.length === 0 && (
              <p className="mt-1 text-xs text-[#62748E]">
                Ninguna receta coincide con {momentName.toLowerCase()} ni con las exclusiones del servicio.
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#0F172B]">
              Comensales
            </label>
            <input
              type="number"
              name="covers"
              value={covers}
              onChange={(e) => setCovers(parseInt(e.target.value, 10) || 1)}
              min={1}
              max={99}
              className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#009966] focus:outline-none focus:ring-2 focus:ring-[#009966]/20"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-[#62748E] transition-colors hover:bg-gray-50"
              >
                Salir
              </button>
              <button
                type="submit"
                disabled={filteredRecipes.length === 0 && !selectedRecipe}
                className="rounded-lg bg-[#009966] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#008055] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Aplicar
              </button>
            </div>
          </div>
        </form>

      </div>

    </div>
  );
}
