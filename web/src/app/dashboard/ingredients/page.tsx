import { cookies } from 'next/headers';
import { getContainer } from '@/domain-container';
import { createIngredient } from './actions';
import IngredientRow from './ingredient-row';

export default async function IngredientsPage({
  searchParams,
}: {
  searchParams: { q?: string; error?: string };
}) {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('userId');
  const userId = cookie?.value ?? '';

  const c = getContainer();
  const ingredients = c.listIngredients.execute(userId);

  const query = searchParams.q?.toLowerCase().trim() ?? '';
  const filtered = query
    ? ingredients.filter((i) => i.name.toLowerCase().includes(query))
    : ingredients;

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0F172B]">Ingredientes</h1>

        <form action={createIngredient} className="flex gap-2">
          <input type="hidden" name="userId" value={userId} />
          <input
            name="name"
            placeholder="Nuevo ingrediente..."
            className="h-10 w-48 rounded-lg border border-gray-200 bg-white px-3.5 text-sm transition-colors focus:border-[#009966] focus:outline-none focus:ring-2 focus:ring-[#009966]/20"
          />
          <button
            type="submit"
            className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#009966] px-5 text-sm font-medium text-white transition-colors hover:bg-[#008055]"
          >
            + Añadir
          </button>
        </form>
      </div>

      {searchParams.error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {searchParams.error}
        </div>
      )}

      <form className="mb-6">
        <input
          name="q"
          defaultValue={query}
          placeholder="Buscar ingrediente..."
          className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm transition-colors focus:border-[#009966] focus:outline-none focus:ring-2 focus:ring-[#009966]/20"
        />
      </form>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-[#62748E]">
            {query
              ? `No se encontraron ingredientes para "${query}".`
              : 'No hay ingredientes todavía. ¡Añadí el primero!'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {filtered.map((ingredient, index) => (
            <IngredientRow
              key={ingredient.id}
              id={ingredient.id}
              name={ingredient.name}
              isLast={index === filtered.length - 1}
            />
          ))}
        </div>
      )}
    </>
  );
}
