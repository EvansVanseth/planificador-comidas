'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, TrashIcon } from '@/components/icons';
import { createIngredientInline } from './actions';

type TagInfo = { id: string; name: string; dimension: string };
type IngredientInfo = { id: string; name: string };

const DIM_ORDER = ['MOMENTO_DIA', 'FORMATO', 'TIPO_PLATO', 'ESTILOS_VIDA'];
const DIM_LABELS: Record<string, string> = {
  MOMENTO_DIA: 'Momento del día',
  FORMATO: 'Formato',
  TIPO_PLATO: 'Tipo de plato',
  ESTILOS_VIDA: 'Estilo de vida',
};
const REQUIRED_DIMS = ['MOMENTO_DIA', 'FORMATO', 'TIPO_PLATO'];

type IngredientRow = {
  key: string;
  ingredientId: string;
  ingredientName: string;
  quantityNote: string;
};

let rowKeyCounter = 0;
function nextRowKey() {
  return `ing_${++rowKeyCounter}`;
}

function validateName(v: string): string {
  if (!v.trim()) return 'El nombre es obligatorio.';
  if (v.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres.';
  if (v.trim().length > 100) return 'El nombre no puede superar los 100 caracteres.';
  return '';
}

function validateServings(v: number): string {
  if (!v || v < 1) return 'Debe ser al menos 1.';
  if (v > 99) return 'No puede superar 99.';
  return '';
}

function validatePrepTime(v: number): string {
  if (!v || v < 1) return 'Debe ser al menos 1 minuto.';
  if (v > 1440) return 'No puede superar 1440 minutos (24 h).';
  return '';
}

type FieldErrors = {
  name?: string;
  baseServings?: string;
  prepTime?: string;
  tags?: string;
  general?: string;
};

export default function RecipeForm({
  userId,
  allTags,
  allIngredients,
  initialData,
  returnTo,
}: {
  userId: string;
  allTags: TagInfo[];
  allIngredients: IngredientInfo[];
  returnTo?: string;
  initialData?: {
    id: string;
    name: string;
    baseServings: number;
    prepTime: number;
    preparation: string | null;
    tags: { id: string; dimension: string }[];
    ingredients: { ingredientId: string; quantityNote: string | null }[];
  };
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [name, setName] = useState(initialData?.name ?? '');
  const [baseServings, setBaseServings] = useState(initialData?.baseServings ?? 4);
  const [prepTime, setPrepTime] = useState(initialData?.prepTime ?? 30);
  const [preparation, setPreparation] = useState(initialData?.preparation ?? '');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    () => initialData?.tags.map((t) => t.id) ?? [],
  );
  const [ingredients, setIngredients] = useState<IngredientRow[]>(
    () =>
      initialData?.ingredients.map((i) => ({
        key: nextRowKey(),
        ingredientId: i.ingredientId,
        ingredientName:
          allIngredients.find((ing) => ing.id === i.ingredientId)?.name ?? '',
        quantityNote: i.quantityNote ?? '',
      })) ?? [],
  );

  const ingredientMap = new Map(allIngredients.map((i) => [i.id, i]));

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  }

  function isTagSelected(tagId: string) {
    return selectedTagIds.includes(tagId);
  }

  function selectedTagForDim(dimension: string) {
    return selectedTagIds.find((id) => {
      const t = allTags.find((tag) => tag.id === id);
      return t?.dimension === dimension;
    });
  }

  function addIngredientRow() {
    setIngredients((prev) => [
      ...prev,
      { key: nextRowKey(), ingredientId: '', ingredientName: '', quantityNote: '' },
    ]);
  }

  function removeIngredientRow(key: string) {
    setIngredients((prev) => prev.filter((r) => r.key !== key));
  }

  function updateIngredient(key: string, field: keyof IngredientRow, value: string) {
    setIngredients((prev) =>
      prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)),
    );
  }

  function selectIngredient(key: string, ingredientId: string) {
    const ing = ingredientMap.get(ingredientId);
    if (!ing) return;
    setIngredients((prev) =>
      prev.map((r) =>
        r.key === key ? { ...r, ingredientId, ingredientName: ing.name } : r,
      ),
    );
  }

  const ingredientInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  function validate(): FieldErrors {
    const errs: FieldErrors = {};

    const nameErr = validateName(name);
    if (nameErr) errs.name = nameErr;

    const servingsErr = validateServings(baseServings);
    if (servingsErr) errs.baseServings = servingsErr;

    const prepErr = validatePrepTime(prepTime);
    if (prepErr) errs.prepTime = prepErr;

    for (const dim of REQUIRED_DIMS) {
      if (!selectedTagForDim(dim)) {
        errs.tags = `Selecciona al menos una etiqueta para "${DIM_LABELS[dim]}".`;
        break;
      }
    }

    return errs;
  }

  function clearFieldError(field: keyof FieldErrors) {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function setFieldError(field: keyof FieldErrors, err: string) {
    if (err) {
      setErrors((prev) => ({ ...prev, [field]: err }));
    } else {
      clearFieldError(field);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSaving(true);
    try {
      const body = {
        userId,
        name: name.trim(),
        baseServings,
        prepTime,
        preparation: preparation.trim() || null,
        tags: selectedTagIds.map((id) => ({
          id,
          dimension: allTags.find((t) => t.id === id)!.dimension,
        })),
        ingredients: ingredients
          .filter((r) => r.ingredientId)
          .map((r) => ({
            ingredientId: r.ingredientId,
            quantityNote: r.quantityNote.trim() || null,
          })),
      };

      const url = initialData
        ? `/dashboard/recipes/api/${initialData.id}`
        : '/dashboard/recipes/api/create';
      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        const msg: string = data.error ?? 'Error al guardar la receta';
        if (msg.toLowerCase().includes('ya existe') || msg.toLowerCase().includes('duplicate')) {
          setErrors({ name: msg });
        } else if (msg.toLowerCase().includes('nombre')) {
          setErrors({ name: msg, general: msg });
        } else {
          setErrors({ general: msg });
        }
        return;
      }

      router.push(returnTo ?? '/dashboard/recipes');
    } catch {
      setErrors({ general: 'Error inesperado. Inténtalo de nuevo.' });
    } finally {
      setSaving(false);
    }
  }

  const groupedTags = DIM_ORDER.map((dim) => ({
    dimension: dim,
    label: DIM_LABELS[dim] ?? dim,
    required: REQUIRED_DIMS.includes(dim),
    tags: allTags.filter((t) => t.dimension === dim),
  }));

  const DIM_CHIP_COLORS: Record<string, string> = {
    MOMENTO_DIA: 'border-blue-300 bg-blue-50 text-blue-700',
    FORMATO: 'border-amber-300 bg-amber-50 text-amber-700',
    TIPO_PLATO: 'border-purple-300 bg-purple-50 text-purple-700',
    ESTILOS_VIDA: 'border-gray-300 bg-gray-50 text-gray-600',
  };
  const DIM_CHIP_SELECTED: Record<string, string> = {
    MOMENTO_DIA: 'border-blue-600 bg-blue-600 text-white',
    FORMATO: 'border-amber-600 bg-amber-600 text-white',
    TIPO_PLATO: 'border-purple-600 bg-purple-600 text-white',
    ESTILOS_VIDA: 'border-gray-600 bg-gray-600 text-white',
  };

  const inputClass = (field: keyof FieldErrors) =>
    `h-10 w-full rounded-[10px] border bg-white px-3.5 text-sm text-[#0F172B] placeholder:text-[#62748E] transition-colors focus:outline-none focus:ring-2 ${
      errors[field]
        ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
        : 'border-[#E2E8F0] focus:border-[#009966] focus:ring-[#009966]/20'
    }`;

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl" noValidate>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172B]">
            {initialData ? 'Editar receta' : 'Nueva receta'}
          </h1>
          <p className="mt-1 text-base text-[#62748E]">
            {initialData
              ? 'Modifica los datos de la receta.'
              : 'Añade una receta a tu catálogo.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-10 items-center rounded-[10px] border border-[#E2E8F0] bg-white px-4 text-sm font-medium text-[#0F172B] transition-colors hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#009966] px-5 text-sm font-medium text-white transition-colors hover:bg-[#008055] disabled:opacity-50"
          >
            {saving ? 'Guardando…' : initialData ? 'Guardar cambios' : 'Crear receta'}
          </button>
        </div>
      </div>

      {errors.general && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors.general}
        </div>
      )}

      <div className="mb-8 space-y-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#0F172B]">
            Nombre de la receta <span className="text-red-500">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) clearFieldError('name');
            }}
            onBlur={() => setFieldError('name', validateName(name))}
            placeholder="Ej: Pollo al horno con arroz"
            className={inputClass('name')}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#0F172B]">
              Raciones <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={baseServings}
              onChange={(e) => {
                setBaseServings(Number(e.target.value));
                if (errors.baseServings) clearFieldError('baseServings');
              }}
              onBlur={() => setFieldError('baseServings', validateServings(baseServings))}
              className={inputClass('baseServings')}
            />
            {errors.baseServings && (
              <p className="mt-1 text-xs text-red-500">{errors.baseServings}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#0F172B]">
              Tiempo de preparación (min) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={prepTime}
              onChange={(e) => {
                setPrepTime(Number(e.target.value));
                if (errors.prepTime) clearFieldError('prepTime');
              }}
              onBlur={() => setFieldError('prepTime', validatePrepTime(prepTime))}
              className={inputClass('prepTime')}
            />
            {errors.prepTime && (
              <p className="mt-1 text-xs text-red-500">{errors.prepTime}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#0F172B]">
            Etiquetas <span className="text-red-500">*</span>
          </label>
          <p className="mb-3 text-sm text-[#62748E]">
            Categoriza la receta para poder filtrarla y planificarla.
          </p>
          <div
            className={`space-y-4 rounded-xl border p-5 transition-colors ${
              errors.tags ? 'border-red-300 bg-red-50' : 'border-[#E2E8F0] bg-white'
            }`}
          >
            {groupedTags.map((group) => (
              <div key={group.dimension}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#62748E]">
                  {group.label}
                  {group.required && ' *'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.tags.map((tag) => {
                    const selected = isTagSelected(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          selected
                            ? DIM_CHIP_SELECTED[group.dimension] ?? 'border-[#009966] bg-[#009966] text-white'
                            : DIM_CHIP_COLORS[group.dimension] ?? 'border-gray-200 bg-white text-[#0F172B] hover:bg-gray-50'
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {errors.tags && (
            <p className="mt-1 text-xs text-red-500">{errors.tags}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#0F172B]">
            Ingredientes
          </label>
          <p className="mb-3 text-sm text-[#62748E]">
            Lista los ingredientes necesarios y sus cantidades.
          </p>
          <div className="rounded-xl border border-[#E2E8F0] bg-white">
            {ingredients.length === 0 && (
              <p className="px-5 py-4 text-sm text-[#62748E]">
                No hay ingredientes todavía. Añade el primero.
              </p>
            )}
            {ingredients.map((row, idx) => (
              <IngredientRow
                key={row.key}
                row={row}
                idx={idx}
                allIngredients={allIngredients}
                usedIngredientIds={ingredients
                  .filter((r) => r.key !== row.key)
                  .map((r) => r.ingredientId)
                  .filter(Boolean)}
                userId={userId}
                onSelect={(ingredientId) => selectIngredient(row.key, ingredientId)}
                onChange={(field, value) => updateIngredient(row.key, field, value)}
                onRemove={() => removeIngredientRow(row.key)}
                inputRef={(el) => {
                  if (el) ingredientInputRefs.current.set(row.key, el);
                  else ingredientInputRefs.current.delete(row.key);
                }}
              />
            ))}
            <div className="border-t border-[#E2E8F0] px-5 py-3">
              <button
                type="button"
                onClick={addIngredientRow}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#009966] transition-colors hover:text-[#008055]"
              >
                <PlusIcon />
                Añadir ingrediente
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#0F172B]">
            Preparación
          </label>
          <textarea
            value={preparation}
            onChange={(e) => setPreparation(e.target.value)}
            placeholder="(Opcional) Describe el paso a paso de la receta..."
            rows={5}
            className="w-full resize-none rounded-[10px] border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172B] placeholder:text-[#62748E] focus:border-[#009966] focus:outline-none focus:ring-2 focus:ring-[#009966]/20"
          />
        </div>
      </div>
    </form>
  );
}

function IngredientRow({
  row,
  idx,
  allIngredients,
  userId,
  usedIngredientIds,
  onSelect,
  onChange,
  onRemove,
  inputRef,
}: {
  row: IngredientRow;
  idx: number;
  allIngredients: IngredientInfo[];
  userId: string;
  usedIngredientIds: string[];
  onSelect: (ingredientId: string) => void;
  onChange: (field: keyof IngredientRow, value: string) => void;
  onRemove: () => void;
  inputRef: (el: HTMLInputElement | null) => void;
}) {
  const [search, setSearch] = useState(row.ingredientName);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const trimmed = search.trim();
  const filtered = trimmed
    ? allIngredients.filter(
        (i) =>
          i.name.toLowerCase().includes(search.toLowerCase()) &&
          !usedIngredientIds.includes(i.id),
      )
    : [];

  const canCreate =
    trimmed &&
    !allIngredients.some((i) => i.name.toLowerCase() === trimmed.toLowerCase());

  async function handleCreate() {
    setCreating(true);
    try {
      const ing = await createIngredientInline(userId, trimmed);
      setSearch(ing.name);
      onChange('ingredientName', ing.name);
      onChange('ingredientId', ing.id);
      setOpen(false);
    } catch {
      // silently fail
    } finally {
      setCreating(false);
    }
  }

  function handleSelect(ing: IngredientInfo) {
    setSearch(ing.name);
    onChange('ingredientName', ing.name);
    onSelect(ing.id);
    setOpen(false);
  }

  return (
    <div className="flex items-start gap-3 border-b border-[#E2E8F0] px-5 py-3 last:border-b-0">
      <span className="mt-2.5 text-xs font-medium text-[#62748E] min-w-5">
        {idx + 1}.
      </span>

      <div className="relative flex-1">
        <input
          ref={inputRef}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            onChange('ingredientName', e.target.value);
            onChange('ingredientId', '');
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar ingrediente..."
          className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#0F172B] placeholder:text-[#62748E] focus:border-[#009966] focus:outline-none focus:ring-2 focus:ring-[#009966]/20"
        />
        {open && (filtered.length > 0 || canCreate) && (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-[#E2E8F0] bg-white shadow-lg">
            {filtered.map((ing) => (
              <button
                key={ing.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(ing);
                }}
                className="w-full px-3 py-2 text-left text-sm text-[#0F172B] transition-colors hover:bg-[#F1F5F9]"
              >
                {ing.name}
              </button>
            ))}
            {canCreate && (
              <button
                type="button"
                disabled={creating}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleCreate();
                }}
                className="flex w-full items-center gap-2 border-t border-[#E2E8F0] px-3 py-2.5 text-left text-sm font-medium text-[#009966] transition-colors hover:bg-[#ECFDF5] disabled:opacity-50"
              >
                <PlusIcon />
                {creating ? 'Creando…' : `Crear "${trimmed}"`}
              </button>
            )}
          </div>
        )}
      </div>

      <input
        value={row.quantityNote}
        onChange={(e) => onChange('quantityNote', e.target.value)}
        placeholder="1 taza, 500g..."
        className="h-10 w-28 shrink-0 rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#0F172B] placeholder:text-[#62748E] focus:border-[#009966] focus:outline-none focus:ring-2 focus:ring-[#009966]/20"
      />

      <button
        type="button"
        onClick={onRemove}
        className="mt-1.5 shrink-0 rounded-lg p-1.5 text-[#62748E] transition-colors hover:bg-red-50 hover:text-red-500"
      >
        <TrashIcon />
      </button>
    </div>
  );
}
