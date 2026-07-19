import { SpinnerIcon, PlusIcon, PencilIcon, DuplicateIcon, TrashIcon, CatalogIcon, CartIcon } from '@/components/icons';

const CARDS = 3;

export default function PlanningsLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-gray-200 pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172B]">Planificaciones</h1>
            <p className="mt-1 text-base text-[#4F617B]">
              Historial de planificaciones semanales.
            </p>
          </div>
          <div className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[#007A55] px-4 text-sm font-medium text-white opacity-60 md:w-auto">
            <PlusIcon />
            Nueva planificación
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-3">
          {Array.from({ length: CARDS }, (_, i) => (
            <PlanningCardSkeleton key={i} />
          ))}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 border-t border-gray-200 pt-3 text-xs text-[#4F617B]">
        <SpinnerIcon size={12} />
        <span>cargando planificaciones...</span>
      </div>
    </div>
  );
}

function PlanningCardSkeleton() {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white px-6 py-4 shadow-[0_1px_2px_-1px_rgba(0,0,0,0.1)]">
      {/* Desktop layout */}
      <div className="hidden items-center gap-4 md:flex">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <SpinnerIcon size={16} />
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-[#4F617B]">
            <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
            <span>·</span>
            <div className="h-3 w-12 animate-pulse rounded bg-gray-200" />
            <span>·</span>
            <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
            <span>·</span>
            <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-lg p-2 text-[#4F617B] opacity-40">
            <PencilIcon />
          </div>
          <div className="rounded-lg p-2 text-[#4F617B] opacity-40">
            <DuplicateIcon />
          </div>
          <div className="rounded-lg p-2 text-[#4F617B] opacity-40">
            <TrashIcon />
          </div>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="flex flex-col gap-3 md:hidden">
        <div className="flex items-start justify-between">
          <SpinnerIcon size={16} />
          <div className="flex items-center gap-1">
            <div className="rounded-lg p-1.5 text-[#4F617B] opacity-40">
              <DuplicateIcon />
            </div>
            <div className="rounded-lg p-1.5 text-[#4F617B] opacity-40">
              <TrashIcon />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#4F617B]">
          <div className="h-3 w-14 animate-pulse rounded bg-gray-200" />
          <span>·</span>
          <div className="h-3 w-10 animate-pulse rounded bg-gray-200" />
          <span>·</span>
          <div className="h-3 w-14 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="flex items-center gap-2 text-xs text-[#4F617B]">
          <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-medium text-[#4F617B] opacity-40">
            <PencilIcon /> Editar
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-medium text-[#4F617B] opacity-40">
            <CatalogIcon /> Despensa
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-medium text-[#4F617B] opacity-40">
            <CartIcon /> Lista
          </div>
        </div>
      </div>
    </div>
  );
}
