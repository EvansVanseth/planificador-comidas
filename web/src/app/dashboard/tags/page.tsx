import { getUserId } from '@/lib/auth';
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
  const userId = await getUserId();

  const c = getContainer();
  const tags = await c.listTags.execute(userId);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-[#0F172B]">Etiquetas</h1>
        <p className="mt-1 text-base text-[#4F617B]">
          Categoriza tus recetas para filtrarlas y organizarlas.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-8">
          {DIMENSIONS.map((dim) => {
            let dimensionTags = tags.filter((t) => t.dimension === dim.key);

            if (dim.key === TagDimension.MOMENTO_DIA) {
              dimensionTags = dimensionTags.sort(
                (a, b) => (a.order ?? 0) - (b.order ?? 0),
              );
            } else {
              dimensionTags = dimensionTags.sort((a, b) =>
                a.name.localeCompare(b.name),
              );
            }

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
                      <p className="mt-0.5 text-xs text-[#4F617B]">
                        {dim.description}
                      </p>
                    )}
                  </div>
                  {dim.canCreate && (
                    <CreateTagForm userId={userId} dimension={dim.key} />
                  )}
                </div>

                {dimensionTags.length === 0 ? (
                  <div className="px-6 py-4 text-sm text-[#4F617B]">
                    No hay etiquetas en esta dimensión.
                  </div>
                ) : (
                  dimensionTags.map((tag, index) => {
                    const isMoment = dim.key === TagDimension.MOMENTO_DIA;
                    return (
                      <TagRow
                        key={tag.id}
                        id={tag.id}
                        name={tag.name}
                        isSystem={tag.isSystem}
                        userId={userId}
                        isLast={index === dimensionTags.length - 1}
                        {...(isMoment
                          ? {
                              canMoveUp: index > 0,
                              canMoveDown:
                                index < dimensionTags.length - 1,
                            }
                          : {})}
                      />
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
