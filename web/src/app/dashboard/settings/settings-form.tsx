'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState } from 'react';
import { logout } from '@/app/dashboard/actions';
import { updateName, changePassword, deleteAccount } from './actions';
import { LogoutIcon } from '@/components/icons';

function SubmitButton({ label, busyLabel }: { label: string; busyLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-10 rounded-[10px] bg-[#007A55] px-5 text-sm font-medium text-white transition-colors hover:bg-[#008055] disabled:opacity-50"
    >
      {pending ? busyLabel : label}
    </button>
  );
}

const initialState = { error: '' };

export function SettingsForm({ name, email }: { name: string; email: string }) {
  const [nameState, nameAction] = useFormState(updateName, initialState);
  const [passwordState, passwordAction] = useFormState(changePassword, initialState);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <>
      <form action={nameAction} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#314158]">Nombre</label>
          <input
            type="text"
            name="name"
            defaultValue={name}
            className="h-10 w-full max-w-sm rounded-lg border border-gray-200 bg-white px-3.5 text-sm text-[#0A0A0A] transition-colors focus:border-[#007A55] focus:outline-none focus:ring-2 focus:ring-[#007A55]/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#314158]">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="h-10 w-full max-w-sm cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-3.5 text-sm text-[#45556C]"
          />
        </div>

        {nameState?.error && (
          <p className="text-sm text-red-500">{nameState.error}</p>
        )}

        <SubmitButton label="Guardar cambios" busyLabel="Guardando..." />
      </form>

      <hr className="my-8 border-t border-gray-200" />

      <h3 className="mb-4 text-base font-semibold text-[#0F172B]">Cambiar contraseña</h3>

      <form action={passwordAction} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#314158]">Contraseña actual</label>
          <input
            type="password"
            name="currentPassword"
            placeholder="••••••••"
            className="h-10 w-full max-w-sm rounded-lg border border-gray-200 bg-white px-3.5 text-sm text-[#0A0A0A] transition-colors focus:border-[#007A55] focus:outline-none focus:ring-2 focus:ring-[#007A55]/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#314158]">Nueva contraseña</label>
          <input
            type="password"
            name="newPassword"
            placeholder="Mínimo 6 caracteres"
            className="h-10 w-full max-w-sm rounded-lg border border-gray-200 bg-white px-3.5 text-sm text-[#0A0A0A] transition-colors focus:border-[#007A55] focus:outline-none focus:ring-2 focus:ring-[#007A55]/20"
          />
        </div>

        {passwordState?.error && (
          <p className="text-sm text-red-500">{passwordState.error}</p>
        )}

        <SubmitButton label="Cambiar contraseña" busyLabel="Cambiando..." />
      </form>

      <hr className="my-8 border-t border-gray-200" />

      <h3 className="mb-4 text-base font-semibold text-[#DC2626]">Eliminar cuenta</h3>
      <p className="mb-5 text-sm text-[#45556C]">
        Esta acción eliminará todos tus datos (recetas, planificaciones, ingredientes, etiquetas). No se puede deshacer.
      </p>

      {!showDeleteConfirm ? (
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="h-10 rounded-[10px] border border-red-200 bg-white px-5 text-sm font-medium text-[#DC2626] transition-colors hover:bg-red-50"
        >
          Eliminar mi cuenta
        </button>
      ) : (
        <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-[#DC2626]">
            ¿Estás seguro? Esta acción eliminará permanentemente tu cuenta y todos tus datos.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="h-10 rounded-[10px] border border-gray-200 bg-white px-5 text-sm font-medium text-[#4F617B] transition-colors hover:bg-gray-50"
            >
              Cancelar
            </button>
            <form action={deleteAccount}>
              <button
                type="submit"
                className="h-10 rounded-[10px] bg-[#DC2626] px-5 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                Sí, eliminar mi cuenta
              </button>
            </form>
          </div>
        </div>
      )}

      <hr className="my-8 border-t border-gray-200 md:hidden" />

      <form action={logout} className="md:hidden">
        <button
          type="submit"
          className="flex h-10 w-full items-center justify-center gap-2 rounded-[10px] border border-gray-200 bg-white px-5 text-sm font-medium text-[#4F617B] transition-colors hover:bg-gray-50"
        >
          <LogoutIcon />
          Cerrar sesión
        </button>
      </form>
    </>
  );
}
