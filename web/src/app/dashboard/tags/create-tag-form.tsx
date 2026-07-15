'use client';

import { useRef } from 'react';
import { createTag } from './actions';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';

export function CreateTagForm({
  userId,
  dimension,
}: {
  userId: string;
  dimension: TagDimension;
}) {
  const ref = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={ref}
      action={createTag}
      onSubmit={() => setTimeout(() => ref.current?.reset(), 100)}
      className="flex gap-2"
    >
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="dimension" value={dimension} />
      <input
        name="name"
        placeholder="Nueva etiqueta..."
        className="h-8 w-40 rounded-md border border-gray-200 px-2.5 text-sm transition-colors focus:border-[#007A55] focus:outline-none focus:ring-2 focus:ring-[#007A55]/20"
      />
      <button
        type="submit"
        className="inline-flex h-8 items-center rounded-md bg-[#007A55] px-3 text-xs font-medium text-white transition-colors hover:bg-[#008055]"
      >
        + <span className="hidden md:inline">Añadir</span>
      </button>
    </form>
  );
}
