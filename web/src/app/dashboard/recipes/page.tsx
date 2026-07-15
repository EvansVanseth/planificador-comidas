import { cookies } from 'next/headers';
import { getContainer } from '@/domain-container';
import Link from 'next/link';
import { PlusIcon } from '@/components/icons';
import RecipeCard from './recipe-card';
import { FilterToggle } from './filter-toggle';

const DIM_ORDER = ['MOMENTO_DIA', 'FORMATO', 'TIPO_PLATO', 'ESTILOS_VIDA'];

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: { q?: string; tag?: string };
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value ?? '';

  const c = getContainer();
  const allRecipes = c.listRecipes.execute(userId);
  const allTags = c.listTags.execute(userId).sort((a, b) => {
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
    <>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172B]">Mis Recetas</h1>
          <p className="mt-1 text-base text-[#4F617B]">
            Gestiona tu catálogo de recetas habituales.
          </p>
        </div>
        <Link
          href={`/dashboard/recipes/new?returnTo=${encodeURIComponent(returnTo)}`}
          className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#007A55] px-4 text-sm font-medium text-white transition-colors hover:bg-[#008055]"
        >
          <PlusIcon />
          Nueva Receta
        </Link>
      </div>

      <form className="mb-8 flex items-center gap-3">
        <div className="relative flex-1">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="#4F617B"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
          >
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5l3 3" />
          </svg>
          <input
            name="q"
            defaultValue={query}
            placeholder="Buscar recetas por nombre..."
            className="h-10 w-full rounded-[10px] border border-gray-200 bg-white pl-10 pr-3.5 text-sm text-[#0F172B] placeholder:text-[#4F617B] focus:border-[#007A55] focus:outline-none focus:ring-2 focus:ring-[#007A55]/20"
          />
        </div>
        <FilterToggle allTags={allTags} selectedTagIds={selectedTagIds} tagUrls={tagUrls} clearUrl={clearUrl} />
      </form>

      <p className="mb-3 text-sm text-[#4F617B]">
        Mostrando {recipes.length} receta{recipes.length !== 1 ? 's' : ''}
        {query || selectedTagIds.length > 0 ? ' filtradas' : ''}
      </p>

      {recipes.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-[#4F617B]">
            {query || selectedTagIds.length > 0
              ? 'No se encontraron recetas con esos filtros.'
              : 'No hay recetas todavía. ¡Creá la primera!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
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
    </>
  );
}
