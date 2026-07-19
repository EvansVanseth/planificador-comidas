import { SpinnerIcon } from '@/components/icons';

export default function EditRecipeLoading() {
  return (
    <form className="mx-auto flex w-full max-w-2xl flex-1 flex-col min-h-0" noValidate>
      <div className="shrink-0 space-y-4 border-b border-gray-200 pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172B]">Editar receta</h1>
            <p className="mt-1 text-base text-[#4F617B]">
              Modifica los datos de la receta.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-24 items-center justify-center rounded-[10px] border border-[#E2E8F0] bg-white text-sm font-medium text-[#0F172B] opacity-60">
              Cancelar
            </div>
            <div className="inline-flex h-10 items-center rounded-[10px] bg-[#007A55] px-5 text-sm font-medium text-white opacity-60">
              Guardar cambios
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#0F172B]">
              Nombre de la receta <span className="text-red-500">*</span>
            </label>
            <div className="h-10 w-full animate-pulse rounded-[10px] border border-[#E2E8F0] bg-white" />
          </div>

          {/* Raciones + Prep time */}
          <div className="grid grid-cols-3 gap-4 md:grid-cols-2">
            <div className="md:col-span-1">
              <label className="mb-1.5 block text-sm font-medium text-[#0F172B]">
                Raciones <span className="text-red-500">*</span>
              </label>
              <div className="h-10 w-full animate-pulse rounded-[10px] border border-[#E2E8F0] bg-white" />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="mb-1.5 block text-sm font-medium text-[#0F172B]">
                Tiempo de preparación (min) <span className="text-red-500">*</span>
              </label>
              <div className="h-10 w-full animate-pulse rounded-[10px] border border-[#E2E8F0] bg-white" />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#0F172B]">
              Etiquetas <span className="text-red-500">*</span>
            </label>
            <p className="mb-3 text-sm text-[#4F617B]">
              Categoriza la receta para poder filtrarla y planificarla.
            </p>
            <div className="space-y-4 rounded-xl border border-[#E2E8F0] bg-white p-5">
              {['MOMENTO_DIA', 'FORMATO', 'TIPO_PLATO', 'ESTILOS_VIDA'].map((dim) => (
                <div key={dim}>
                  <div className="mb-2 h-3 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="flex flex-wrap gap-2">
                    <div className="h-7 w-20 animate-pulse rounded-full border bg-blue-50" />
                    <div className="h-7 w-24 animate-pulse rounded-full border bg-blue-50" />
                    <div className="h-7 w-16 animate-pulse rounded-full border bg-blue-50" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#0F172B]">
              Ingredientes
            </label>
            <p className="mb-3 text-sm text-[#4F617B]">
              Lista los ingredientes necesarios y sus cantidades.
            </p>
            <div className="rounded-xl border border-[#E2E8F0] bg-white">
              <div className="flex items-center justify-center gap-2 px-5 py-8">
                <SpinnerIcon size={16} />
                <span className="text-sm text-[#4F617B]">Cargando receta...</span>
              </div>
            </div>
          </div>

          {/* Preparation */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#0F172B]">
              Preparación
            </label>
            <div className="h-32 w-full animate-pulse rounded-[10px] border border-[#E2E8F0] bg-white" />
          </div>
        </div>
      </div>
    </form>
  );
}
