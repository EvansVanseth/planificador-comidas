const sk = 'animate-pulse rounded-[10px] bg-gradient-to-r from-[#007A55]/25 to-[#007A55]/10';

export default function NewPlanningLoading() {
  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F172B]">Nueva planificación</h1>
        <p className="mt-1 text-base text-[#4F617B]">
          Define el esqueleto de tu planificación semanal.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#0F172B]">
            Nombre <span className="font-normal text-[#4F617B]">(opcional)</span>
          </label>
          <div className={`${sk} h-10 w-full border border-[#E2E8F0]`} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#0F172B]">
            Semanas
          </label>
          <div className={`${sk} h-10 w-full border border-[#E2E8F0]`} />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[#0F172B]">
            <div className="h-4 w-4 animate-pulse rounded border border-[#E2E8F0] bg-gradient-to-r from-[#007A55]/25 to-[#007A55]/10" />
            Asignar fecha de inicio
          </label>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#0F172B]">
            Balance frío/caliente
          </label>
          <div className="h-6 w-full animate-pulse rounded bg-gradient-to-r from-[#007A55]/25 to-[#007A55]/10" />
          <div className="mt-1 flex justify-between text-xs text-[#4F617B]">
            <span>0% (todo frío)</span>
            <span>50% (mitad)</span>
            <span>100% (todo caliente)</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <div className="inline-flex h-10 items-center rounded-[10px] bg-[#007A55] px-5 text-sm font-medium text-white opacity-60">
          Crear planificación
        </div>
        <div className="inline-flex h-10 items-center rounded-[10px] border border-[#E2E8F0] bg-white px-5 text-sm font-medium text-[#0F172B] opacity-60">
          Cancelar
        </div>
      </div>
    </div>
  );
}
