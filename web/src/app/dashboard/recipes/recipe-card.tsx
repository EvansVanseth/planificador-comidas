'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ClockIcon, PeopleIcon, TrashIcon } from '@/components/icons';
import { ConfirmModal } from '@/components/confirm-modal';
import { deleteRecipe, getDeleteImpact } from './actions';

type TagInfo = { id: string; dimension: string };
type RecipeData = {
  id: string;
  name: string;
  prepTime: number;
  baseServings: number;
  tags: TagInfo[];
  ingredients: unknown[];
};
type TagFull = { id: string; name: string; dimension: string };

const DIM_PILLS: Record<string, string> = {
  MOMENTO_DIA: 'bg-[#D0FAC5] text-[#006045]',
  FORMATO: 'bg-[#F1F5F9] text-[#0F172B]',
  TIPO_PLATO: 'bg-[#F1F5F9] text-[#0F172B]',
  ESTILOS_VIDA: 'bg-[#F1F5F9] text-[#0F172B]',
};

function formatMinutes(m: number): string {
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest > 0 ? `${h}h ${rest}min` : `${h}h`;
}

export default function RecipeCard({
  recipe,
  tags,
  userId,
}: {
  recipe: RecipeData;
  tags: TagFull[];
  userId: string;
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planningsAffected, setPlanningsAffected] = useState<number | null>(null);
  const [loadingImpact, setLoadingImpact] = useState(false);
  const deleteFormRef = useRef<HTMLFormElement>(null);

  const tagMap = new Map(tags.map((t) => [t.id, t]));

  function openDeleteModal() {
    setPlanningsAffected(null);
    setShowDeleteModal(true);
  }

  async function loadImpact() {
    if (loadingImpact || planningsAffected !== null) return;
    setLoadingImpact(true);
    try {
      const data = await getDeleteImpact(recipe.id, userId);
      setPlanningsAffected(data.planningsAffected);
    } finally {
      setLoadingImpact(false);
    }
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-[0_1px_2px_-1px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.1)]">
      <div className="flex flex-1 flex-col gap-3 px-5 pb-4 pt-5">
        <h3 className="text-lg font-bold text-[#0F172B]">{recipe.name}</h3>

        <div className="flex items-center gap-3 text-sm text-[#62748E]">
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon />
            {formatMinutes(recipe.prepTime)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <PeopleIcon />
            {recipe.baseServings} pax
          </span>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-1.5">
          {recipe.tags.map((t) => {
            const full = tagMap.get(t.id);
            if (!full) return null;
            return (
              <span
                key={t.id}
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${DIM_PILLS[t.dimension] ?? 'bg-[#F1F5F9] text-[#0F172B]'}`}
              >
                {full.name}
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between bg-[#F8FAFC] px-5 py-3">
        <Link
          href={`/dashboard/recipes/${recipe.id}/edit`}
          className="text-sm font-medium text-[#009966] transition-colors hover:text-[#008055]"
        >
          Editar receta
        </Link>
        <button
          type="button"
          onClick={openDeleteModal}
          title="Eliminar receta"
          className="rounded-lg p-1.5 text-[#62748E] transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <TrashIcon />
        </button>
      </div>

      <form ref={deleteFormRef} action={deleteRecipe} aria-hidden="true" className="hidden">
        <input type="hidden" name="id" value={recipe.id} />
      </form>

      {showDeleteModal && (
        <ConfirmModal
          title="Eliminar receta"
          confirmLabel="Eliminar"
          danger
          onConfirm={() => deleteFormRef.current?.requestSubmit()}
          onCancel={() => setShowDeleteModal(false)}
        >
          <p className="mb-4">
            Esta acción es irreversible. Se eliminará la receta del catálogo
            {planningsAffected !== null && planningsAffected > 0
              ? ' y se removerá de las planificaciones que la contengan.'
              : '.'}
          </p>
          {planningsAffected === null && !loadingImpact && (
            <button
              type="button"
              onClick={loadImpact}
              className="text-sm text-[#009966] hover:underline"
            >
              Ver impacto en planificaciones
            </button>
          )}
          {loadingImpact && (
            <p className="text-sm text-[#62748E]">Calculando impacto...</p>
          )}
          {planningsAffected !== null && (
            <div className="space-y-1 text-sm text-[#0F172B]">
              <p>
                Planificaciones afectadas:{' '}
                <strong>{planningsAffected}</strong>
              </p>
            </div>
          )}
        </ConfirmModal>
      )}
    </div>
  );
}
