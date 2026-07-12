import { cookies } from 'next/headers';
import { getContainer } from '@/domain-container';
import { CreateTagForm } from './create-tag-form';
import TagRow from './tag-row';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';

const DIMENSIONS: {
  key: TagDimension;
  label: string;
  description: string;
  canCreate: boolean;
}[] = [
  {
    key: TagDimension.MOMENTO_DIA,
    label: 'Momento del día',
    description: '',
    canCreate: true,
  },
  {
    key: TagDimension.FORMATO,
    label: 'Formato',
    description:
      'Etiquetas de sistema para indicar la temperatura del plato. No se pueden crear nuevas.',
    canCreate: false,
  },
  {
    key: TagDimension.TIPO_PLATO,
    label: 'Tipo de plato',
    description: '',
    canCreate: true,
  },
  {
    key: TagDimension.ESTILOS_VIDA,
    label: 'Estilo de vida',
    description: '',
    canCreate: true,
  },
];

export default async function TagsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value ?? '';

  const c = getContainer();
  const tags = c.listTags.execute(userId);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F172B]">Etiquetas</h1>
        <p className="mt-1 text-base text-[#62748E]">
          Categoriza tus recetas para filtrarlas y organizarlas.
        </p>
      </div>

      <div className="space-y-8">
        {DIMENSIONS.map((dim) => {
          const dimensionTags = tags.filter((t) => t.dimension === dim.key);

          return (
            <div
              key={dim.key}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <div>
                  <h2 className="text-base font-semibold text-[#0F172B]">
                    {dim.label}
                  </h2>
                  {dim.description && (
                    <p className="mt-0.5 text-xs text-[#62748E]">
                      {dim.description}
                    </p>
                  )}
                </div>
                {dim.canCreate && (
                  <CreateTagForm userId={userId} dimension={dim.key} />
                )}
              </div>

              {dimensionTags.length === 0 ? (
                <div className="px-6 py-4 text-sm text-[#62748E]">
                  No hay etiquetas en esta dimensión.
                </div>
              ) : (
                dimensionTags.map((tag, index) => (
                  <TagRow
                    key={tag.id}
                    id={tag.id}
                    name={tag.name}
                    isSystem={tag.isSystem}
                    userId={userId}
                    isLast={index === dimensionTags.length - 1}
                  />
                ))
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
