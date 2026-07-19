import { SpinnerIcon, PencilIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon } from '@/components/icons';

const DIMENSIONS = [
  { label: 'Momento del día', description: '', canCreate: true, rowCount: 4, momentOrder: true },
  { label: 'Formato', description: 'Etiquetas de sistema para indicar la temperatura del plato. No se pueden crear nuevas.', canCreate: false, rowCount: 2, momentOrder: false },
  { label: 'Tipo de plato', description: '', canCreate: true, rowCount: 3, momentOrder: false },
  { label: 'Estilo de vida', description: '', canCreate: true, rowCount: 2, momentOrder: false },
];

export default function TagsLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-[#0F172B]">Etiquetas</h1>
        <p className="mt-1 text-base text-[#4F617B]">
          Categoriza tus recetas para filtrarlas y organizarlas.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-8">
          {DIMENSIONS.map((dim) => (
            <div
              key={dim.label}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white"
            >
              {/* Section header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <div>
                  <h2 className="text-base font-semibold text-[#0F172B]">
                    {dim.label}
                  </h2>
                  {dim.description && (
                    <p className="mt-0.5 text-xs text-[#4F617B]">
                      {dim.description}
                    </p>
                  )}
                </div>
                {dim.canCreate && (
                  <div className="flex gap-2">
                    <div className="h-8 w-40 animate-pulse rounded-md border border-gray-200 bg-white" />
                    <button
                      type="button"
                      disabled
                      className="inline-flex h-8 items-center rounded-md bg-[#007A55] px-3 text-xs font-medium text-white opacity-60"
                    >
                      + <span className="hidden md:inline">Añadir</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Tag rows */}
              {Array.from({ length: dim.rowCount }, (_, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-6 py-3 ${
                    i < dim.rowCount - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <SpinnerIcon size={14} />
                  </div>
                  <div className="flex items-center gap-1">
                    {dim.momentOrder && (
                      <>
                        <button type="button" disabled className="rounded-md p-1.5 text-gray-300">
                          <ChevronUpIcon />
                        </button>
                        <button type="button" disabled className="rounded-md p-1.5 text-gray-300">
                          <ChevronDownIcon />
                        </button>
                      </>
                    )}
                    <button type="button" disabled className="rounded-lg p-2 text-[#4F617B] opacity-40">
                      <PencilIcon />
                    </button>
                    <button type="button" disabled className="rounded-lg p-2 text-[#4F617B] opacity-40">
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
