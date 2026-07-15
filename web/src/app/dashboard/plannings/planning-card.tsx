'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { PencilIcon, TrashIcon, DuplicateIcon } from '@/components/icons';
import { ConfirmModal } from '@/components/confirm-modal';
import { duplicatePlanning, deletePlanning } from './actions';
import type { PlanningPrimitives } from '@/domain/planning/aggregates/planning.aggregate';

function formatDate(iso: string | null): string {
  if (!iso) return 'Sin fecha';
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
  });
}

function countMeals(days: PlanningPrimitives['days']): number {
  return days.reduce((sum, d) => sum + d.services.filter((s) => s.recipeId).length, 0);
}

export default function PlanningCard({
  planning,
  userId,
}: {
  planning: PlanningPrimitives;
  userId: string;
}) {
  const [showDelete, setShowDelete] = useState(false);
  const duplicateFormRef = useRef<HTMLFormElement>(null);
  const deleteFormRef = useRef<HTMLFormElement>(null);

  const totalDays = planning.days.length;
  const assignedMeals = countMeals(planning.days);
  const balance = planning.hotColdBalance ?? 50;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#E2E8F0] bg-white px-6 py-4 shadow-[0_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-[#0F172B]">
            {planning.name}
          </h3>
          {planning.startdate && (
            <span className="rounded-full bg-[#ECFDF5] px-2 py-0.5 text-xs font-medium text-[#007A55]">
              Activa
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-3 text-sm text-[#4F617B]">
          <span>{planning.weeks} {planning.weeks === 1 ? 'semana' : 'semanas'}</span>
          <span>·</span>
          <span>{totalDays} días</span>
          <span>·</span>
          <span>{assignedMeals} comidas</span>
          <span>·</span>
          <span>{formatDate(planning.startdate)}</span>
          {balance !== 50 && (
            <>
              <span>·</span>
              <span>{balance}% caliente</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={`/dashboard/plannings/${planning.id}/edit`}
          className="rounded-lg p-2 text-[#4F617B] transition-colors hover:bg-[#F1F5F9] hover:text-[#007A55]"
          title="Editar planificación"
        >
          <PencilIcon />
        </Link>

        <form ref={duplicateFormRef} action={duplicatePlanning} className="inline">
          <input type="hidden" name="id" value={planning.id} />
          <input type="hidden" name="userId" value={userId} />
          <button
            type="submit"
            className="rounded-lg p-2 text-[#4F617B] transition-colors hover:bg-[#F1F5F9] hover:text-[#007A55]"
            title="Duplicar planificación"
          >
            <DuplicateIcon />
          </button>
        </form>

        <button
          type="button"
          onClick={() => setShowDelete(true)}
          className="rounded-lg p-2 text-[#4F617B] transition-colors hover:bg-red-50 hover:text-red-500"
          title="Eliminar planificación"
        >
          <TrashIcon />
        </button>
      </div>

      <form ref={deleteFormRef} action={deletePlanning} aria-hidden="true" className="hidden">
        <input type="hidden" name="id" value={planning.id} />
      </form>

      {showDelete && (
        <ConfirmModal
          title="Eliminar planificación"
          confirmLabel="Eliminar"
          danger
          onConfirm={() => deleteFormRef.current?.requestSubmit()}
          onCancel={() => setShowDelete(false)}
        >
          <p className="mb-4">
            Esta acción es irreversible. Se eliminará la planificación
            completa incluyendo su configuración de días, el stock de
            despensa local y el checklist de compras.
          </p>
        </ConfirmModal>
      )}
    </div>
  );
}
