'use client';

import type { PlanningPrimitives } from '@/domain/planning/aggregates/planning.aggregate';
import type { ShoppingListEntry } from '@/application/planning/get-shopping-list.use-case';
import { toggleShoppingItem } from '../../actions';

type Props = {
  planning: PlanningPrimitives;
  shoppingList: ShoppingListEntry[];
};

export default function ShoppingView({ planning, shoppingList }: Props) {
  const visibleItems = shoppingList.filter((item) => item.neededAfterPantry > 0);
  if (visibleItems.length === 0) {
    return (
      <div className="rounded-xl border border-[#CBD5E1] bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-[#4F617B]">
          No hay ingredientes necesarios. Asigna recetas a los servicios para generar la lista de la compra.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-[#CBD5E1] bg-white shadow-sm">
      <div className="shrink-0 border-b border-[#E2E8F0] px-6 py-4">
        <h2 className="text-lg font-semibold text-[#0F172B]">Lista de la compra</h2>
        <p className="mt-1 text-sm text-[#4F617B]">
          Marca los ingredientes que has comprado.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="sticky top-0 z-10 border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <th className="w-8 px-2 py-3" />
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#475569]">
                Ingrediente
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#475569]">
                Necesitas
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#475569]">
                Recetas
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((item) => {
              const bought = item.inShoppingList && item.shoppingCompleted;
              return (
                <tr
                  key={item.ingredientId}
                  className={`border-b border-[#E2E8F0] transition-colors last:border-0 hover:bg-[#F8FAFC] ${bought ? 'bg-[#F0FDF4]' : ''}`}
                >
                  <td className="px-2 py-3">
                    <form action={toggleShoppingItem}>
                      <input type="hidden" name="planningId" value={planning.id} />
                      <input type="hidden" name="ingredientId" value={item.ingredientId} />
                      <input type="hidden" name="ingredientName" value={item.ingredientName} />
                      <input type="hidden" name="completed" value={String(!bought)} />
                      <button
                        type="submit"
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                          bought
                            ? 'border-[#007A55] bg-[#007A55] text-white'
                            : 'border-[#CBD5E1] bg-white hover:border-[#007A55]'
                        }`}
                      >
                        {bought && (
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 8l3 3 5-5" />
                          </svg>
                        )}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm font-medium ${
                        bought ? 'text-[#94A3B8] line-through' : 'text-[#0F172B]'
                      }`}
                    >
                      {item.ingredientName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm ${bought ? 'text-[#94A3B8]' : 'text-[#4F617B]'}`}>
                      {item.neededAfterPantry}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm ${bought ? 'text-[#94A3B8]' : 'text-[#4F617B]'}`}>
                      {item.recipeNames.join(', ')}
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
