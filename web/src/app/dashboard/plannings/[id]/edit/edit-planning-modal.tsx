'use client';

import { useState } from 'react';
import { CloseIcon } from '@/components/icons';
import { updatePlanning } from '../../actions';

const inputClass =
  'h-10 w-full rounded-[10px] border border-[#E2E8F0] bg-white px-3.5 text-sm text-[#0F172B] placeholder:text-[#4F617B] transition-colors focus:border-[#007A55] focus:outline-none focus:ring-2 focus:ring-[#007A55]/20';

type Props = {
  planningId: string;
  initialName: string;
  initialWeeks: number;
  initialStartDate: string | null;
  initialBalance: number;
  onClose: () => void;
};

export default function EditPlanningModal({
  planningId,
  initialName,
  initialWeeks,
  initialStartDate,
  initialBalance,
  onClose,
}: Props) {
  const [weeks, setWeeks] = useState(initialWeeks);
  const [balance, setBalance] = useState(initialBalance);
  const [hasDate, setHasDate] = useState(!!initialStartDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <form action={updatePlanning}>
          <input type="hidden" name="id" value={planningId} />

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#0F172B]">Editar planificación</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-[#4F617B] transition-colors hover:bg-gray-100"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#0F172B]">
                Nombre <span className="font-normal text-[#4F617B]">(opcional)</span>
              </label>
              <input
                name="name"
                defaultValue={initialName}
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
                  className="rounded border-[#E2E8F0] text-[#007A55] focus:ring-[#007A55]/20"
                />
                Asignar fecha de inicio
              </label>
              {hasDate && (
                <input
                  name="startDate"
                  type="date"
                  defaultValue={initialStartDate ? initialStartDate.split('T')[0] : ''}
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
                className="w-full accent-[#007A55]"
              />
              <div className="flex justify-between text-xs text-[#4F617B]">
                <span>0% (todo frío)</span>
                <span>50% (mitad)</span>
                <span>100% (todo caliente)</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#007A55] px-5 text-sm font-medium text-white transition-colors hover:bg-[#008055]"
            >
              Guardar cambios
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center rounded-[10px] border border-[#E2E8F0] bg-white px-5 text-sm font-medium text-[#0F172B] transition-colors hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
