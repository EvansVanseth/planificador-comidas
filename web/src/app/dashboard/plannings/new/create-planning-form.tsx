'use client';

import { useState } from 'react';
import { createPlanning } from '../actions';

const inputClass =
  'h-10 w-full rounded-[10px] border border-[#E2E8F0] bg-white px-3.5 text-sm text-[#0F172B] placeholder:text-[#62748E] transition-colors focus:border-[#009966] focus:outline-none focus:ring-2 focus:ring-[#009966]/20';

export default function CreatePlanningForm({ userId }: { userId: string }) {
  const [weeks, setWeeks] = useState(2);
  const [balance, setBalance] = useState(50);
  const [hasDate, setHasDate] = useState(false);

  return (
    <form action={createPlanning} className="mx-auto max-w-lg">
      <input type="hidden" name="userId" value={userId} />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F172B]">Nueva planificación</h1>
        <p className="mt-1 text-base text-[#62748E]">
          Define el esqueleto de tu planificación semanal.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#0F172B]">
            Nombre <span className="text-[#62748E] font-normal">(opcional)</span>
          </label>
          <input
            name="name"
            placeholder="Ej: Menú de Invierno"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#0F172B]">
            Semanas
          </label>
          <input
            name="weeks"
            type="number"
            min={1}
            max={12}
            value={weeks}
            onChange={(e) => setWeeks(Number(e.target.value))}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[#0F172B]">
            <input
              type="checkbox"
              checked={hasDate}
              onChange={(e) => setHasDate(e.target.checked)}
              className="rounded border-[#E2E8F0] text-[#009966] focus:ring-[#009966]/20"
            />
            Asignar fecha de inicio
          </label>
          {hasDate && (
            <input
              name="startDate"
              type="date"
              className={inputClass}
              onChange={(e) => {
                const d = new Date(e.target.value + 'T00:00:00');
                if (d.getDay() !== 1) {
                  e.target.setCustomValidity('Debe ser lunes');
                } else {
                  e.target.setCustomValidity('');
                }
              }}
            />
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#0F172B]">
            Balance frío/caliente: {balance}% caliente
          </label>
          <input
            name="hotColdBalance"
            type="range"
            min={0}
            max={100}
            value={balance}
            onChange={(e) => setBalance(Number(e.target.value))}
            className="w-full accent-[#009966]"
          />
          <div className="flex justify-between text-xs text-[#62748E]">
            <span>0% (todo frío)</span>
            <span>50% (mitad)</span>
            <span>100% (todo caliente)</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <button
          type="submit"
          className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#009966] px-5 text-sm font-medium text-white transition-colors hover:bg-[#008055]"
        >
          Crear planificación
        </button>
        <a
          href="/dashboard/plannings"
          className="inline-flex h-10 items-center rounded-[10px] border border-[#E2E8F0] bg-white px-5 text-sm font-medium text-[#0F172B] transition-colors hover:bg-gray-50"
        >
          Cancelar
        </a>
      </div>
    </form>
  );
}
