import { cookies } from 'next/headers';
import { getContainer } from '@/domain-container';
import { createIngredient } from './actions';
import IngredientRow from './ingredient-row';
import SimilarNameWarning from './similar-name-modal';
import { MergeButton } from './merge-modal';
import DebouncedSearch from '@/components/debounced-search';

export default async function IngredientsPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    similar?: string;
    name?: string;
  };
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

  const similarParam = searchParams.similar;
  const similarNames = similarParam
    ? similarParam.split(',').map((s) => s.trim())
    : [];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {similarNames.length > 0 && searchParams.name && (
        <SimilarNameWarning
          similarNames={similarNames}
          proposedName={searchParams.name}
          userId={userId}
        />
      )}

      <div className="shrink-0 space-y-4 border-b border-gray-200 pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172B]">Ingredientes</h1>
            <p className="mt-1 text-base text-[#4F617B]">
              Gestiona los ingredientes que usas en tus recetas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {ingredients.length >= 2 && (
              <MergeButton ingredients={ingredients} userId={userId} />
            )}

            <form action={createIngredient} className="flex flex-1 gap-2 md:flex-none">
              <input type="hidden" name="userId" value={userId} />
              <input
                name="name"
                placeholder="Nuevo ingrediente..."
                className="h-10 min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3.5 text-sm transition-colors focus:border-[#007A55] focus:outline-none focus:ring-2 focus:ring-[#007A55]/20"
              />
              <button
                type="submit"
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-[10px] bg-[#007A55] px-5 text-sm font-medium text-white transition-colors hover:bg-[#008055]"
              >
                + <span className="hidden md:inline">Añadir</span>
              </button>
            </form>
          </div>
        </div>

        <DebouncedSearch
          defaultValue={query}
          placeholder="Buscar ingrediente..."
          paramName="q"
          currentSearch={searchParams.q ? `q=${encodeURIComponent(searchParams.q)}` : ''}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-sm text-[#4F617B]">
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
                userId={userId}
                isLast={index === filtered.length - 1}
              />
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-gray-200 pt-3 text-xs text-[#4F617B]">
        Mostrando {filtered.length} ingrediente{filtered.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
