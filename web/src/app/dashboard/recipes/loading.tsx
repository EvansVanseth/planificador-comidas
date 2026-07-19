import { SpinnerIcon, PlusIcon, ClockIcon, PeopleIcon, FilterIcon, TrashIcon } from '@/components/icons';

export default function RecipesLoading() {
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
          <div className="flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[#007A55] px-4 text-sm font-medium text-white opacity-60 md:inline-flex md:w-auto">
            <PlusIcon />
            Nueva Receta
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-10 flex-1 animate-pulse rounded-lg border border-gray-200 bg-white" />
          <button
            type="button"
            disabled
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3.5 text-sm font-medium text-[#4F617B] opacity-50"
          >
            <FilterIcon />
            Filtrar
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 border-t border-gray-200 pt-3 text-xs text-[#4F617B]">
        <SpinnerIcon size={12} />
        <span>cargando recetas...</span>
      </div>
    </div>
  );
}

function RecipeCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-[0_1px_2px_-1px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.1)]">
      <div className="flex flex-1 flex-col gap-3 px-5 pb-4 pt-5">
        {/* Name */}
        <div className="flex items-center gap-2">
          <SpinnerIcon size={16} />
        </div>

        {/* Clock + People */}
        <div className="flex items-center gap-3 text-sm text-[#4F617B]">
          <span className="inline-flex items-center gap-1.5 opacity-40">
            <ClockIcon />
            <div className="h-3 w-12 animate-pulse rounded bg-gray-200" />
          </span>
          <span className="inline-flex items-center gap-1.5 opacity-40">
            <PeopleIcon />
            <div className="h-3 w-14 animate-pulse rounded bg-gray-200" />
          </span>
        </div>

        {/* Tag pills */}
        <div className="mt-auto flex flex-wrap items-center gap-1.5">
          <div className="h-5 w-16 animate-pulse rounded-full bg-blue-100" />
          <div className="h-5 w-14 animate-pulse rounded-full bg-amber-100" />
          <div className="h-5 w-12 animate-pulse rounded-full bg-purple-100" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between bg-[#F8FAFC] px-5 py-3">
        <span className="text-sm font-medium text-[#007A55] opacity-50">
          Editar receta
        </span>
        <button type="button" disabled className="rounded-lg p-1.5 text-[#4F617B] opacity-40">
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
