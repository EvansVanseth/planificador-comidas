'use client';

import { useState, useRef, useEffect } from 'react';
import { PencilIcon, TrashIcon } from '@/components/icons';
import { ConfirmModal } from '@/components/confirm-modal';
import { renameIngredient, deleteIngredient, getDeleteImpact } from './actions';

type DeleteImpact = {
  recipesAffected: number;
  planningsAffected: number;
};

export default function IngredientRow({
  id,
  name,
  userId,
  isLast,
}: {
  id: string;
  name: string;
  userId: string;
  isLast: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteImpact, setDeleteImpact] = useState<DeleteImpact | null>(null);
  const [loadingImpact, setLoadingImpact] = useState(false);
  const deleteFormRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    if (showDeleteModal && !deleteImpact && !loadingImpact) {
      setLoadingImpact(true);
      getDeleteImpact(id, userId)
        .then(setDeleteImpact)
        .finally(() => setLoadingImpact(false));
    }
  }, [showDeleteModal, id, userId, deleteImpact, loadingImpact]);

  function openDeleteModal() {
    setDeleteImpact(null);
    setShowDeleteModal(true);
  }

  function closeDeleteModal() {
    setShowDeleteModal(false);
    setDeleteImpact(null);
  }

  return (
    <>
      <div
        className={`flex items-center justify-between gap-2 px-6 py-3 ${
          isLast ? '' : 'border-b border-gray-100'
        }`}
      >
        {editing ? (
          <form
            action={async (formData) => {
              setEditing(false);
              await renameIngredient(formData);
            }}
            className="flex flex-1 items-center gap-2"
          >
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="previousName" value={name} />
            <input
              ref={inputRef}
              name="name"
              defaultValue={name}
              className="h-8 flex-1 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-[#007A55] focus:outline-none focus:ring-2 focus:ring-[#007A55]/20"
              onKeyDown={(e) => {
                if (e.key === 'Escape') setEditing(false);
              }}
            />
            <button
              type="submit"
              className="rounded-md bg-[#007A55] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#008055]"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-[#4F617B] hover:bg-gray-50"
            >
              Cancelar
            </button>
          </form>
        ) : (
          <>
            <span className="flex-1 text-sm font-medium text-[#0F172B]">
              {name}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setEditing(true)}
                title="Renombrar ingrediente"
                className="rounded-lg p-2 text-[#4F617B] transition-colors hover:bg-gray-100 hover:text-[#0F172B]"
              >
                <PencilIcon />
              </button>
              <button
                type="button"
                onClick={openDeleteModal}
                title="Eliminar ingrediente"
                className="rounded-lg p-2 text-[#4F617B] transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <TrashIcon />
              </button>
            </div>
          </>
        )}
      </div>

      <form ref={deleteFormRef} action={deleteIngredient} aria-hidden="true">
        <input type="hidden" name="id" value={id} />
      </form>

      {showDeleteModal && (
        <ConfirmModal
          title="Eliminar ingrediente"
          confirmLabel="Eliminar"
          danger
          onConfirm={() => deleteFormRef.current?.requestSubmit()}
          onCancel={closeDeleteModal}
        >
          <p className="mb-4">
            Esta acción es irreversible. Se eliminará el ingrediente de todas las
            recetas y planificaciones que lo contengan.
          </p>
          {loadingImpact ? (
            <p className="text-sm text-[#4F617B]">Calculando impacto...</p>
          ) : deleteImpact ? (
            <div className="space-y-1 text-sm text-[#0F172B]">
              <p>
                Recetas afectadas: <strong>{deleteImpact.recipesAffected}</strong>
              </p>
              <p>
                Planificaciones afectadas:{' '}
                <strong>{deleteImpact.planningsAffected}</strong>
              </p>
            </div>
          ) : null}
        </ConfirmModal>
      )}
    </>
  );
}
