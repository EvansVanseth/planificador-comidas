'use client';

import type { PlanningPrimitives } from '@/domain/planning/aggregates/planning.aggregate';
import type { NeededIngredientEntry } from '@/application/planning/get-needed-ingredients.use-case';
import { updatePantryItemCovers, markPantryItemAvailable } from '../../actions';

type Props = {
  planning: PlanningPrimitives;
  neededIngredients: NeededIngredientEntry[];
};

export default function PantryView({ planning, neededIngredients }: Props) {
  const pantryMap = new Map(
    planning.pantryItems.map((p) => [p.ingredientId, p]),
  );

  if (neededIngredients.length === 0) {
    return (
      <div className="rounded-xl border border-[#CBD5E1] bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-[#4F617B]">
          No hay ingredientes necesarios. Asigna recetas a los servicios para gestionar la despensa.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-[#CBD5E1] bg-white shadow-sm">
      <div className="shrink-0 border-b border-[#E2E8F0] px-6 py-4">
        <h2 className="text-lg font-semibold text-[#0F172B]">Despensa</h2>
        <p className="mt-1 text-sm text-[#4F617B]">
          Indica cuántos comensales cubres de cada ingrediente o márcalo como «tengo de todo».
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="sticky top-0 z-10 border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#475569]">
                Ingrediente
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#475569]">
                Cubres
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#475569]">
                Necesitas
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#475569]">
                Tengo de todo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#475569]">
                Recetas que lo necesitan
              </th>
            </tr>
          </thead>
          <tbody>
            {neededIngredients.map((ing) => {
              const pantryItem = pantryMap.get(ing.ingredientId);
              const isAvailable = pantryItem?.available ?? false;
              const currentCovers = pantryItem?.covers ?? 0;

              return (
                <tr
                  key={ing.ingredientId}
                  className="border-b border-[#E2E8F0] transition-colors last:border-0 hover:bg-[#F8FAFC]"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#0F172B]">
                        {ing.ingredientName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {isAvailable ? (
                      <div className="flex justify-center">
                        <span className="text-sm text-[#007A55]">—</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <form action={updatePantryItemCovers}>
                          <input type="hidden" name="planningId" value={planning.id} />
                          <input type="hidden" name="ingredientId" value={ing.ingredientId} />
                          <input type="hidden" name="ingredientName" value={ing.ingredientName} />
                          <input type="hidden" name="covers" value={Math.max(0, currentCovers - 1)} />
                          <button
                            type="submit"
                            disabled={currentCovers === 0}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#4F617B] transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <path d="M3 8h10" />
                            </svg>
                          </button>
                        </form>
                        <span className="mx-3 min-w-[1.5rem] text-center text-base font-semibold text-[#0F172B]">
                          {currentCovers}
                        </span>
                        <form action={updatePantryItemCovers}>
                          <input type="hidden" name="planningId" value={planning.id} />
                          <input type="hidden" name="ingredientId" value={ing.ingredientId} />
                          <input type="hidden" name="ingredientName" value={ing.ingredientName} />
                          <input type="hidden" name="covers" value={currentCovers + 1} />
                          <button
                            type="submit"
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#4F617B] transition-colors hover:bg-gray-100"
                          >
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <path d="M8 3v10" />
                              <path d="M3 8h10" />
                            </svg>
                          </button>
                        </form>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-[#4F617B]">
                      {ing.totalCovers}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isAvailable ? (
                      <form action={updatePantryItemCovers}>
                        <input type="hidden" name="planningId" value={planning.id} />
                        <input type="hidden" name="ingredientId" value={ing.ingredientId} />
                        <input type="hidden" name="ingredientName" value={ing.ingredientName} />
                        <input type="hidden" name="covers" value={1} />
                        <button
                          type="submit"
                          className="whitespace-nowrap rounded-lg border border-[#D1FAE5] bg-[#F0FDF4] px-4 py-2.5 text-sm font-medium text-[#007A55] transition-colors hover:bg-[#D1FAE5]"
                        >
                          Sí
                        </button>
                      </form>
                    ) : (
                      <form action={markPantryItemAvailable}>
                        <input type="hidden" name="planningId" value={planning.id} />
                        <input type="hidden" name="ingredientId" value={ing.ingredientId} />
                        <input type="hidden" name="ingredientName" value={ing.ingredientName} />
                        <button
                          type="submit"
                          className="whitespace-nowrap rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-medium text-[#4F617B] transition-colors hover:bg-gray-50"
                        >
                          No
                        </button>
                      </form>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-[#4F617B]">
                      {ing.recipeNames.join(', ')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
