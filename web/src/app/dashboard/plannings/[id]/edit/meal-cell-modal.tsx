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
  allTags: { id: string; name: string; dimension: string }[];
  serviceExclusions: string[];
  servicePreferences: string[];
  currentRecipeId: string | null;
  currentCovers: number;
  currentIgnoreRestrictions: boolean;
  onClose: () => void;
  onPrevDay?: () => void;
  onNextDay?: () => void;
};

type ExpandState = { dimension: string; type: 'preference' | 'exclusion' } | null;

const dimensionLabel: Record<string, string> = {
  FORMATO: 'Formato',
  TIPO_PLATO: 'Tipo de plato',
  ESTILOS_VIDA: 'Estilos de vida',
  PROTEINA: 'Proteína',
  FRECUENCIA: 'Frecuencia',
  TEMPORADA: 'Temporada',
};

export default function MealCellModal({
  planningId,
  dayOrder,
  dateLabel,
  momentTagId,
  momentName,
  allRecipes,
  allTags,
  serviceExclusions: initialExclusions,
  servicePreferences: initialPreferences,
  currentRecipeId,
  currentCovers,
  currentIgnoreRestrictions,
  onClose,
  onPrevDay,
  onNextDay,
}: Props) {
  const [selectedRecipe, setSelectedRecipe] = useState(currentRecipeId ?? '');
  const [skipRestrictions, setSkipRestrictions] = useState(currentIgnoreRestrictions);
  const [exclusions, setExclusions] = useState<string[]>(initialExclusions);
  const [preferences, setPreferences] = useState<string[]>(initialPreferences);
  const [expanded, setExpanded] = useState<ExpandState>(null);

  const tagNameMap = useMemo(
    () => Object.fromEntries(allTags.map((t) => [t.id, t.name])),
    [allTags],
  );

  const filteredRecipes = useMemo(() => {
    if (skipRestrictions) {
      return [...allRecipes].sort((a, b) => a.name.localeCompare(b.name));
    }
    return allRecipes.filter((r) => {
      const momentTags = r.tags.filter((t) => t.dimension === 'MOMENTO_DIA');
      if (momentTags.length > 0 && !momentTags.some((t) => t.id === momentTagId)) {
        return false;
      }
      if (exclusions.some((ex) => r.tags.some((t) => t.id === ex))) {
        return false;
      }
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [allRecipes, momentTagId, exclusions, skipRestrictions]);

  const availableTags = useMemo(
    () => allTags.filter((t) => t.dimension !== 'MOMENTO_DIA' && t.dimension !== 'FORMATO'),
    [allTags],
  );

  const groupedTags = useMemo(() => {
    const groups: Record<string, { id: string; name: string }[]> = {};
    for (const t of availableTags) {
      if (!groups[t.dimension]) groups[t.dimension] = [];
      groups[t.dimension].push({ id: t.id, name: t.name });
    }
    return groups;
  }, [availableTags]);

  const [covers, setCovers] = useState(currentCovers);

  function addPreference(tagId: string) {
    setPreferences((prev) => (prev.includes(tagId) ? prev : [...prev, tagId]));
    setExclusions((prev) => prev.filter((id) => id !== tagId));
    setExpanded(null);
  }

  function addExclusion(tagId: string) {
    setExclusions((prev) => (prev.includes(tagId) ? prev : [...prev, tagId]));
    setPreferences((prev) => prev.filter((id) => id !== tagId));
    setExpanded(null);
  }

  function removeTag(tagId: string) {
    setExclusions((prev) => prev.filter((id) => id !== tagId));
    setPreferences((prev) => prev.filter((id) => id !== tagId));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#0F172B]">{momentName}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[#4F617B] transition-colors hover:bg-gray-100"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between text-sm text-[#4F617B]">
          <span>
            Día {dayOrder}{dateLabel ? ` — ${dateLabel}` : ''}
          </span>
          <div className="flex items-center gap-1">
            <button type="button" disabled={!onPrevDay} onClick={onPrevDay} className={`rounded-md p-1 transition-colors ${onPrevDay ? 'text-[#4F617B] hover:bg-gray-100' : 'text-gray-300'}`}><ChevronLeftIcon /></button>
            <button type="button" disabled={!onNextDay} onClick={onNextDay} className={`rounded-md p-1 transition-colors ${onNextDay ? 'text-[#4F617B] hover:bg-gray-100' : 'text-gray-300'}`}><ChevronRightIcon /></button>
          </div>
        </div>

        <form action={assignMeal} onSubmit={onClose} className="flex flex-1 flex-col gap-4 overflow-y-auto">
          <input type="hidden" name="planningId" value={planningId} />
          <input type="hidden" name="dayOrder" value={dayOrder} />
          <input type="hidden" name="momentTagId" value={momentTagId} />
          <input type="hidden" name="ignoreRestrictions" value={String(skipRestrictions)} />
          <input type="hidden" name="exclusions" value={JSON.stringify(exclusions)} />
          <input type="hidden" name="preferences" value={JSON.stringify(preferences)} />

          <div>
            <label className="mb-1 block text-sm font-medium text-[#0F172B]">Receta</label>
            <select
              name="recipeId"
              value={selectedRecipe}
              onChange={(e) => setSelectedRecipe(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#007A55] focus:outline-none focus:ring-2 focus:ring-[#007A55]/20"
            >
              <option value="">— Sin receta —</option>
              {filteredRecipes.length === 0 ? (
                <option value="" disabled>No hay recetas disponibles</option>
              ) : (
                filteredRecipes.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))
              )}
            </select>
            {filteredRecipes.length === 0 && !skipRestrictions && (
              <p className="mt-1 text-xs text-[#4F617B]">Ninguna receta coincide con {momentName.toLowerCase()} ni con las exclusiones del servicio.</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-[#4F617B]">
              <input type="checkbox" checked={skipRestrictions} onChange={(e) => setSkipRestrictions(e.target.checked)} className="rounded border-[#E2E8F0] text-[#007A55] focus:ring-[#007A55]/20" />
              Saltar restricciones
            </label>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#0F172B]">Comensales</label>
              <input type="number" name="covers" value={covers} onChange={(e) => setCovers(parseInt(e.target.value, 10) || 1)} min={1} max={99} className="w-20 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#007A55] focus:outline-none focus:ring-2 focus:ring-[#007A55]/20" />
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-[#0F172B]">Preferencias y exclusiones</h3>
            <div className="space-y-3">
              {Object.entries(groupedTags).map(([dimension, tags]) => (
                <div key={dimension} className="relative">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-[#4F617B]">
                      {dimensionLabel[dimension] ?? dimension.replace(/_/g, ' ')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpanded(expanded?.dimension === dimension && expanded?.type === 'preference' ? null : { dimension, type: 'preference' })}
                      className="rounded-md p-0.5 text-green-700 transition-colors hover:bg-green-50"
                      title="Añadir preferencia"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8l3 3 5-5" /></svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpanded(expanded?.dimension === dimension && expanded?.type === 'exclusion' ? null : { dimension, type: 'exclusion' })}
                      className="rounded-md p-0.5 text-red-500 transition-colors hover:bg-red-50"
                      title="Añadir exclusión"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4l8 8" /><path d="M12 4l-8 8" /></svg>
                    </button>
                  </div>

                  {expanded?.dimension === dimension && (
                    <div className="absolute left-0 z-10 mt-1 w-64 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((t) => {
                          const isPref = preferences.includes(t.id);
                          const isExc = exclusions.includes(t.id);
                          const disabled = isPref || isExc;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              disabled={disabled}
                              onClick={() => expanded.type === 'preference' ? addPreference(t.id) : addExclusion(t.id)}
                              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                                disabled
                                  ? 'cursor-not-allowed opacity-40'
                                  : expanded.type === 'preference'
                                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                              }`}
                            >
                              {t.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {preferences.filter((id) => tags.some((t) => t.id === id)).map((id) => (
                      <span key={id} className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        {tagNameMap[id] ?? id}
                        <button type="button" onClick={() => removeTag(id)} className="text-green-700 hover:text-green-800">&times;</button>
                      </span>
                    ))}
                    {exclusions.filter((id) => tags.some((t) => t.id === id)).map((id) => (
                      <span key={id} className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600">
                        {tagNameMap[id] ?? id}
                        <button type="button" onClick={() => removeTag(id)} className="text-red-600 hover:text-red-700">&times;</button>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div />
            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-[#4F617B] transition-colors hover:bg-gray-50">Salir</button>
              <button type="submit" disabled={filteredRecipes.length === 0 && !selectedRecipe} className="rounded-lg bg-[#007A55] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#008055] disabled:cursor-not-allowed disabled:opacity-50">Aplicar</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
