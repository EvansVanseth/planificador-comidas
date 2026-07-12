'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { FilterIcon } from '@/components/icons';

type TagInfo = { id: string; name: string; dimension: string };

const DIM_COLORS: Record<string, string> = {
  MOMENTO_DIA: 'bg-blue-100 text-blue-700',
  FORMATO: 'bg-amber-100 text-amber-700',
  TIPO_PLATO: 'bg-purple-100 text-purple-700',
  ESTILOS_VIDA: 'bg-gray-100 text-gray-600',
};

const DIM_SELECTED: Record<string, string> = {
  MOMENTO_DIA: 'bg-blue-600 text-white',
  FORMATO: 'bg-amber-600 text-white',
  TIPO_PLATO: 'bg-purple-600 text-white',
  ESTILOS_VIDA: 'bg-gray-600 text-white',
};

function pillClass(dimension: string, selected: boolean): string {
  if (selected) return DIM_SELECTED[dimension] ?? 'bg-[#009966] text-white';
  return DIM_COLORS[dimension] ?? 'bg-gray-100 text-gray-600';
}

export function FilterToggle({
  allTags,
  selectedTagIds,
  tagUrls,
  clearUrl,
}: {
  allTags: TagInfo[];
  selectedTagIds: string[];
  tagUrls: { tagId: string; url: string }[];
  clearUrl?: string;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`inline-flex h-10 items-center gap-2 rounded-[10px] border px-4 text-sm font-medium transition-colors ${
          open || selectedTagIds.length > 0
            ? 'border-[#009966] bg-[#ECFDF5] text-[#009966]'
            : 'border-[#E2E8F0] bg-white text-[#0F172B] hover:bg-gray-50'
        }`}
      >
        <FilterIcon />
        Filtros
        {selectedTagIds.length > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#009966] text-xs font-bold text-white">
            {selectedTagIds.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-72 rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-[#0F172B]">
              Filtrar por etiquetas
            </p>
            {selectedTagIds.length > 0 && (
              <Link
                href={clearUrl ?? '/dashboard/recipes'}
                className="text-xs font-medium text-[#62748E] hover:text-[#009966]"
              >
                Limpiar
              </Link>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => {
              const selected = selectedTagIds.includes(tag.id);
              const tagUrl = tagUrls.find((u) => u.tagId === tag.id)?.url ?? '/dashboard/recipes';
              return (
                <Link
                  key={tag.id}
                  href={tagUrl}
                  onClick={() => setOpen(false)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${pillClass(tag.dimension, selected)}`}
                >
                  {tag.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
