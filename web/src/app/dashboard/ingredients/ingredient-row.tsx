'use client';

import { useState, useRef, useEffect } from 'react';
import { PencilIcon, TrashIcon } from '@/components/icons';
import { renameIngredient, deleteIngredient } from './actions';

export default function IngredientRow({
  id,
  name,
  isLast,
}: {
  id: string;
  name: string;
  isLast: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  return (
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
          <input
            ref={inputRef}
            name="name"
            defaultValue={name}
            className="h-8 flex-1 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-[#009966] focus:outline-none focus:ring-2 focus:ring-[#009966]/20"
            onKeyDown={(e) => {
              if (e.key === 'Escape') setEditing(false);
            }}
          />
          <button
            type="submit"
            className="rounded-md bg-[#009966] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#008055]"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-[#62748E] hover:bg-gray-50"
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
              className="rounded-lg p-2 text-[#62748E] transition-colors hover:bg-gray-100 hover:text-[#0F172B]"
            >
              <PencilIcon />
            </button>
            <form action={deleteIngredient}>
              <input type="hidden" name="id" value={id} />
              <button
                type="submit"
                title="Eliminar ingrediente"
                className="rounded-lg p-2 text-[#62748E] transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <TrashIcon />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
