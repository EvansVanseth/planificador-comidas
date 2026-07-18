import { getUserId } from '@/lib/auth';
import { getContainer } from '@/domain-container';
import Link from 'next/link';
import { PlusIcon } from '@/components/icons';
import RecipeCard from './recipe-card';
import { FilterToggle } from './filter-toggle';
import DebouncedSearch from '@/components/debounced-search';

const DIM_ORDER = ['MOMENTO_DIA', 'FORMATO', 'TIPO_PLATO', 'ESTILOS_VIDA'];

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: { q?: string; tag?: string };
}) {
  const userId = await getUserId();

  const c = getContainer();
  const allRecipes = await c.listRecipes.execute(userId);
  const allTags = (await c.listTags.execute(userId)).sort((a, b) => {
    const dimDiff = DIM_ORDER.indexOf(a.dimension) - DIM_ORDER.indexOf(b.dimension);
    if (dimDiff !== 0) return dimDiff;
    return a.name.localeCompare(b.name);
  });

  const query = searchParams.q?.toLowerCase().trim() ?? '';
  const selectedTagIds = searchParams.tag?.split(',').filter(Boolean) ?? [];

  const filtersParam = new URLSearchParams();
  if (query) filtersParam.set('q', query);
  if (selectedTagIds.length > 0) filtersParam.set('tag', selectedTagIds.join(','));
  const filtersQuery = filtersParam.toString();
  const returnTo = filtersQuery ? `/dashboard/recipes?${filtersQuery}` : '/dashboard/recipes';

  const currentSearchStr = filtersParam.toString();

  let recipes = allRecipes;
  if (query) {
    recipes = recipes.filter((r) => r.name.toLowerCase().includes(query));
  }
  if (selectedTagIds.length > 0) {
    recipes = recipes.filter((r) =>
      selectedTagIds.every((tagId) => r.tags.some((t) => t.id === tagId)),
    );
  }

  const tagUrls = allTags.map((tag) => {
    const isSelected = selectedTagIds.includes(tag.id);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    const next = isSelected
      ? selectedTagIds.filter((id) => id !== tag.id)
      : [...selectedTagIds, tag.id];
    if (next.length > 0) params.set('tag', next.join(','));
    const qs = params.toString();
    return {
      tagId: tag.id,
      url: `/dashboard/recipes${qs ? `?${qs}` : ''}`,
    };
  });

  const clearUrl = `/dashboard/recipes${query ? `?q=${encodeURIComponent(query)}` : ''}`;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 space-y-4 border-b border-gray-200 pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172B]">Mis Recetas</h1>
            <p className="mt-1 text-base text-[#4F617B]">
              Gestiona tu catálogo de recetas habituales.
            </p>
          </div>
          <Link
            href={`/dashboard/recipes/new?returnTo=${encodeURIComponent(returnTo)}`}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[#007A55] px-4 text-sm font-medium text-white transition-colors hover:bg-[#008055] md:inline-flex md:w-auto"
          >
            <PlusIcon />
            Nueva Receta
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <DebouncedSearch
            className="flex-1"
            defaultValue={query}
            placeholder="Buscar recetas por nombre..."
            paramName="q"
            currentSearch={currentSearchStr}
          />
          <FilterToggle allTags={allTags} selectedTagIds={selectedTagIds} tagUrls={tagUrls} clearUrl={clearUrl} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {recipes.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-sm text-[#4F617B]">
              {query || selectedTagIds.length > 0
                ? 'No se encontraron recetas con esos filtros.'
                : 'No hay recetas todavía. ¡Crea la primera!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                tags={allTags}
                userId={userId}
                returnTo={returnTo}
              />
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-gray-200 pt-3 text-xs text-[#4F617B]">
        Mostrando {recipes.length} receta{recipes.length !== 1 ? 's' : ''}
        {query || selectedTagIds.length > 0 ? ' filtradas' : ''}
      </div>
    </div>
  );
}
