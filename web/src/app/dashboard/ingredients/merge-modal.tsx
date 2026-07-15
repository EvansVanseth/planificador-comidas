'use client';

import { useState } from 'react';
import { getMergePreview, mergeIngredients } from './actions';
import { CloseIcon, MergeIcon } from '@/components/icons';

export default function MergeModal({
  ingredients,
  userId,
  onClose,
}: {
  ingredients: { id: string; name: string }[];
  userId: string;
  onClose: () => void;
}) {
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [preview, setPreview] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  const targetOptions = ingredients.filter((i) => i.id !== sourceId);
  const source = ingredients.find((i) => i.id === sourceId);
  const target = ingredients.find((i) => i.id === targetId);

  async function handleTargetChange(id: string) {
    setTargetId(id);
    if (sourceId && id) {
      setLoading(true);
      const result = await getMergePreview(sourceId, userId);
      setPreview(result.recipesAffected);
      setLoading(false);
    } else {
      setPreview(null);
    }
  }

  const canSubmit = sourceId && targetId && sourceId !== targetId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#0F172B]">Fusionar ingredientes</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-[#4F617B] transition-colors hover:bg-gray-100"
          >
            <CloseIcon />
          </button>
        </div>

        <label className="mb-1 block text-sm font-medium text-[#0F172B]">Origen</label>
        <select
          value={sourceId}
          onChange={(e) => {
            setSourceId(e.target.value);
            setTargetId('');
            setPreview(null);
          }}
          className="mb-4 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm transition-colors focus:border-[#007A55] focus:outline-none focus:ring-2 focus:ring-[#007A55]/20"
        >
          <option value="">Seleccionar origen...</option>
          {ingredients.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>

        <label className="mb-1 block text-sm font-medium text-[#0F172B]">Destino</label>
        <select
          value={targetId}
          onChange={(e) => handleTargetChange(e.target.value)}
          disabled={!sourceId}
          className="mb-4 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm transition-colors focus:border-[#007A55] focus:outline-none focus:ring-2 focus:ring-[#007A55]/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Seleccionar destino...</option>
          {targetOptions.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>

        {loading && (
          <div className="mb-4 rounded-lg bg-gray-50 p-3 text-sm text-[#4F617B]">
            Verificando recetas...
          </div>
        )}

        {preview !== null && !loading && (
          <div className="mb-4 rounded-lg bg-gray-50 p-3">
            {preview.length === 0 ? (
              <p className="text-sm text-[#4F617B]">
                Ninguna receta usa <strong>{source?.name}</strong>. Solo se eliminará el ingrediente.
              </p>
            ) : (
              <>
                <p className="mb-2 text-sm font-medium text-[#0F172B]">
                  {preview.length} receta{preview.length !== 1 ? 's' : ''} afectada
                  {preview.length !== 1 ? 's' : ''}:
                </p>
                <ul className="max-h-32 space-y-1 overflow-y-auto">
                  {preview.map((name) => (
                    <li key={name} className="text-sm text-[#4F617B]">
                      • {name}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-[#4F617B]">
                  Se reemplazará <strong>{source?.name}</strong> por{' '}
                  <strong>{target?.name}</strong> en las recetas afectadas.
                </p>
              </>
            )}
          </div>
        )}

        {sourceId && targetId && sourceId !== targetId && !loading && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Esta acción no se puede deshacer. El ingrediente <strong>{source?.name}</strong> se
            eliminará del sistema.
            {preview && preview.length > 0
              ? ' Las recetas se actualizarán automáticamente.'
              : ''}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-[#4F617B] transition-colors hover:bg-gray-50"
          >
            Cancelar
          </button>
          <form action={mergeIngredients}>
            <input type="hidden" name="userId" value={userId} />
            <input type="hidden" name="sourceId" value={sourceId} />
            <input type="hidden" name="targetId" value={targetId} />
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-lg bg-[#007A55] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#008055] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Fusionar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function MergeButton({
  ingredients,
  userId,
}: {
  ingredients: { id: string; name: string }[];
  userId: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3.5 text-sm font-medium text-[#4F617B] transition-colors hover:bg-gray-50"
      >
        <MergeIcon />
        Fusionar
      </button>
      {open && (
        <MergeModal
          ingredients={ingredients}
          userId={userId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
