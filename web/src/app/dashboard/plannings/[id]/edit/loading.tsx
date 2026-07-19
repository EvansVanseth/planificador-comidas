import { SpinnerIcon, CloseIcon } from '@/components/icons';

const sk = 'animate-pulse rounded bg-gradient-to-r from-[#007A55]/25 to-[#007A55]/10';

export default function EditPlanningLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 space-y-4 border-b border-gray-200 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className={`${sk} h-7 w-48`} />
            <div className={`${sk} h-4 w-64`} />
          </div>
          <div className="rounded-md p-2 text-[#4F617B]">
            <CloseIcon />
          </div>
        </div>

        <nav className="flex gap-1 border-b border-[#E2E8F0]">
          {['Cuadrícula', 'Despensa', 'Lista de la compra'].map((label) => (
            <div
              key={label}
              className="px-4 py-2.5 text-sm font-medium text-[#4F617B]"
            >
              {label}
            </div>
          ))}
        </nav>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-sm text-[#4F617B]">
          <SpinnerIcon size={24} />
          <p>Cargando planificación...</p>
        </div>
      </div>
    </div>
  );
}
