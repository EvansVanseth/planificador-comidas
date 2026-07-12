'use client';

import { useState, useEffect, useRef } from 'react';
import { updateTag, deleteTag, getDeleteImpact } from './actions';
import { PencilIcon, TrashIcon, CloseIcon } from '@/components/icons';

export default function TagRow({
  id,
  name,
  isSystem,
  userId,
  isLast,
}: {
  id: string;
  name: string;
  isSystem: boolean;
  userId: string;
  isLast: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [showDelete, setShowDelete] = useState(false);
  const [impact, setImpact] = useState<{
    recipesAffected: string[];
    planningsAffected: number;
  } | null>(null);
  const [loadingImpact, setLoadingImpact] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function startEdit() {
    setEditName(name);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
  }

  useEffect(() => {
    if (showDelete) {
      setLoadingImpact(true);
      getDeleteImpact(id, userId).then((result) => {
        setImpact(result);
        setLoadingImpact(false);
      });
    } else {
      setImpact(null);
    }
  }, [showDelete, id, userId]);

  return (
    <>
      <div
        className={`flex items-center justify-between px-6 py-3 ${
          !isLast ? 'border-b border-gray-100' : ''
        }`}
      >
        {editing ? (
          <form
            action={updateTag}
            onSubmit={() => setTimeout(() => setEditing(false), 100)}
            className="flex flex-1 items-center gap-2"
          >
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="previousName" value={name} />
            <input
              name="name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              autoFocus
              className="h-8 flex-1 rounded-md border border-gray-200 px-2 text-sm focus:border-[#009966] focus:outline-none focus:ring-2 focus:ring-[#009966]/20"
            />
            <button
              type="submit"
              className="rounded-md bg-[#009966] px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-[#008055]"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-md p-1 text-[#62748E] transition-colors hover:bg-gray-100"
            >
              <CloseIcon />
            </button>
          </form>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#0F172B]">{name}</span>
              {isSystem && (
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#62748E]">
                  sistema
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={startEdit}
                className="rounded-md p-1.5 text-[#62748E] transition-colors hover:bg-gray-100"
              >
                <PencilIcon />
              </button>
              {!isSystem && (
                <button
                  type="button"
                  onClick={() => setShowDelete(true)}
                  className="rounded-md p-1.5 text-[#62748E] transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <TrashIcon />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowDelete(false)}
          />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-lg font-semibold text-[#0F172B]">
              Eliminar etiqueta
            </h2>
            <p className="mb-4 text-sm text-[#62748E]">
              ¿Estás seguro de que querés eliminar <strong>{name}</strong>?
            </p>

            {loadingImpact && (
              <div className="mb-4 rounded-lg bg-gray-50 p-3 text-sm text-[#62748E]">
                Verificando impacto...
              </div>
            )}

            {impact && !loadingImpact && (
              <div className="mb-4 rounded-lg bg-gray-50 p-3">
                {impact.recipesAffected.length === 0 &&
                impact.planningsAffected === 0 ? (
                  <p className="text-sm text-[#62748E]">
                    Ninguna receta o planificación usa esta etiqueta.
                  </p>
                ) : (
                  <>
                    {impact.recipesAffected.length > 0 && (
                      <>
                        <p className="mb-1 text-sm font-medium text-[#0F172B]">
                          {impact.recipesAffected.length} receta
                          {impact.recipesAffected.length !== 1 ? 's' : ''}{' '}
                          afectada{impact.recipesAffected.length !== 1 ? 's' : ''}:
                        </p>
                        <ul className="mb-3 max-h-32 space-y-1 overflow-y-auto">
                          {impact.recipesAffected.map((r) => (
                            <li key={r} className="text-sm text-[#62748E]">
                              • {r}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    {impact.planningsAffected > 0 && (
                      <p className="text-sm text-[#62748E]">
                        Referenciada en servicios de{' '}
                        {impact.planningsAffected} planificación
                        {impact.planningsAffected !== 1 ? 'es' : ''}.
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDelete(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-[#62748E] transition-colors hover:bg-gray-50"
              >
                Cancelar
              </button>
              <form ref={formRef} action={deleteTag}>
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="tagName" value={name} />
                <button
                  type="submit"
                  className="rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#B91C1C]"
                >
                  Eliminar
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
