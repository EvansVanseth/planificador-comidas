import { SpinnerIcon, MergeIcon, PencilIcon, TrashIcon } from '@/components/icons';

const ROWS = 5;

export default function IngredientsLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 space-y-4 border-b border-gray-200 pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172B]">Ingredientes</h1>
            <p className="mt-1 text-base text-[#4F617B]">
              Gestiona los ingredientes que usas en tus recetas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3.5 text-sm font-medium text-[#4F617B] opacity-50"
            >
              <MergeIcon />
              <span className="hidden md:inline">Fusionar</span>
            </button>

            <div className="flex flex-1 gap-2 md:flex-none">
              <div className="h-10 min-w-0 flex-1 animate-pulse rounded-lg border border-gray-200 bg-white md:w-48" />
              <button
                type="button"
                disabled
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-[10px] bg-[#007A55] px-5 text-sm font-medium text-white opacity-60"
              >
                + <span className="hidden md:inline">Añadir</span>
              </button>
            </div>
          </div>
        </div>

        <div className="h-10 w-full animate-pulse rounded-lg border border-gray-200 bg-white md:w-72" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {Array.from({ length: ROWS }, (_, i) => (
            <div
              key={i}
              className={`flex items-center justify-between gap-2 px-6 py-3 ${
                i < ROWS - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="flex flex-1 items-center gap-2">
                <SpinnerIcon size={14} />
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled
                  className="rounded-lg p-2 text-[#4F617B] opacity-40"
                >
                  <PencilIcon />
                </button>
                <button
                  type="button"
                  disabled
                  className="rounded-lg p-2 text-[#4F617B] opacity-40"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 border-t border-gray-200 pt-3 text-xs text-[#4F617B]">
        <SpinnerIcon size={12} />
        <span>cargando ingredientes...</span>
      </div>
    </div>
  );
}
