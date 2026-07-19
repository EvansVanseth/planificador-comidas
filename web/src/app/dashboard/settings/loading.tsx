import { SpinnerIcon, LogoutIcon } from '@/components/icons';

export default function SettingsLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-[#0F172B]">Mi cuenta</h1>
        <p className="mt-1 text-base text-[#4F617B]">
          Gestiona tu información personal y configuración de la cuenta.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pt-6">
        <div className="mx-auto max-w-2xl space-y-8">
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            {/* Name + email form */}
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#314158]">Nombre</label>
                <div className="h-10 w-full max-w-sm animate-pulse rounded-lg border border-gray-200 bg-white" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#314158]">Email</label>
                <div className="h-10 w-full max-w-sm animate-pulse rounded-lg border border-gray-200 bg-gray-50" />
              </div>

              <div className="h-10 w-36 animate-pulse rounded-[10px] bg-[#007A55]/30" />
            </div>

            <div className="my-8 border-t border-gray-200" />

            {/* Change password section */}
            <h3 className="mb-4 text-base font-semibold text-[#0F172B]">Cambiar contraseña</h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#314158]">Contraseña actual</label>
                <div className="h-10 w-full max-w-sm animate-pulse rounded-lg border border-gray-200 bg-white" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#314158]">Nueva contraseña</label>
                <div className="h-10 w-full max-w-sm animate-pulse rounded-lg border border-gray-200 bg-white" />
              </div>

              <div className="h-10 w-44 animate-pulse rounded-[10px] bg-[#007A55]/30" />
            </div>

            <div className="my-8 border-t border-gray-200" />

            {/* Delete account section */}
            <h3 className="mb-4 text-base font-semibold text-[#DC2626]">Eliminar cuenta</h3>
            <p className="mb-5 text-sm text-[#45556C]">
              Esta acción eliminará todos tus datos (recetas, planificaciones, ingredientes, etiquetas). No se puede deshacer.
            </p>

            <div className="flex items-center gap-2">
              <SpinnerIcon size={14} />
              <span className="text-sm text-[#4F617B]">cargando datos de la cuenta...</span>
            </div>

            <div className="my-8 border-t border-gray-200 md:hidden" />

            {/* Mobile logout */}
            <div className="flex h-10 w-full items-center justify-center gap-2 rounded-[10px] border border-gray-200 bg-white px-5 text-sm font-medium text-[#4F617B] opacity-50 md:hidden">
              <LogoutIcon />
              Cerrar sesión
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
