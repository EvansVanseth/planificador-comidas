'use client';

import { useState } from 'react';

type IngredientDisplay = {
  name: string;
  quantityNote: string | null;
};

type MealCardClientProps = {
  timeName: string;
  recipeName: string | null;
  covers: number;
  baseServings: number | null;
  prepTime: number | null;
  preparation: string | null;
  ingredients: IngredientDisplay[];
};

export function MealCardClient({
  timeName,
  recipeName,
  covers,
  baseServings,
  prepTime,
  preparation,
  ingredients,
}: MealCardClientProps) {
  const [open, setOpen] = useState(false);

  const hasDetails = recipeName != null;

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <button
        type="button"
        onClick={() => hasDetails && setOpen(!open)}
        className={`flex w-full items-center justify-between px-4 py-3 text-left ${hasDetails ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-[#4F617B]">
            {timeName}
          </p>
          <p className={`truncate text-sm font-medium ${recipeName ? 'text-[#0F172B]' : 'italic text-[#4F617B]'}`}>
            {recipeName ?? 'Sin asignar'}
            <span className="ml-2 text-xs font-normal text-[#4F617B]">
              {covers} {covers === 1 ? 'comensal' : 'comensales'}
            </span>
          </p>
        </div>
        {hasDetails && (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`shrink-0 text-[#4F617B] transition-transform ${open ? 'rotate-180' : ''}`}
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
        )}
      </button>

      {open && hasDetails && (
        <div className="border-t border-gray-100 px-4 py-3 text-sm text-[#0F172B]">
          {prepTime != null && (
            <p className="mb-2 text-xs text-[#4F617B]">
              Preparación: {prepTime} min · Raciones base: {baseServings}
            </p>
          )}

          {ingredients.length > 0 && (
            <div className="mb-2">
              <p className="mb-1 text-xs font-medium text-[#4F617B]">Ingredientes:</p>
              <ul className="ml-3 list-disc space-y-0.5 text-xs text-[#45556C]">
                {ingredients.map((ing, i) => (
                  <li key={i}>
                    {ing.name}
                    {ing.quantityNote ? ` (${ing.quantityNote})` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {preparation && (
            <div>
              <p className="mb-1 text-xs font-medium text-[#4F617B]">Preparación:</p>
              <p className="whitespace-pre-wrap text-xs text-[#45556C]">{preparation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
