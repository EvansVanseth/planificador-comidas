'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { forceCreateIngredient } from './actions';

export default function SimilarNameWarning({
  similarNames,
  proposedName,
  userId,
}: {
  similarNames: string[];
  proposedName: string;
  userId: string;
}) {
  const [open, setOpen] = useState(true);
  const router = useRouter();

  function cancel() {
    setOpen(false);
    const params = new URLSearchParams(window.location.search);
    params.delete('similar');
    params.delete('name');
    const qs = params.toString();
    router.replace('/dashboard/ingredients' + (qs ? `?${qs}` : ''));
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={cancel} />
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <h2 className="mb-4 text-lg font-semibold text-[#0F172B]">
          Ingrediente similar encontrado
        </h2>
        <p className="mb-3 text-sm text-[#62748E]">
          Ya existe uno o más ingredientes con nombres similares:
        </p>
        <ul className="mb-6 max-h-40 space-y-1 overflow-y-auto">
          {similarNames.map((n) => (
            <li key={n} className="text-sm text-[#0F172B]">
              • {n}
            </li>
          ))}
        </ul>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={cancel}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-[#62748E] transition-colors hover:bg-gray-50"
          >
            Cancelar
          </button>
          <form action={forceCreateIngredient}>
            <input type="hidden" name="userId" value={userId} />
            <input type="hidden" name="name" value={proposedName} />
            <button
              type="submit"
              className="rounded-lg bg-[#009966] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#008055]"
            >
              Agregar de todas formas
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
