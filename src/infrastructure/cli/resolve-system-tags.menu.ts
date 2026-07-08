import prompts from 'prompts';
import { IContainer } from '../container';
import { SYSTEM_TAG_SEEDS } from '@/application/tags/seed-system-tags';
import { TagPrimitives } from '@/domain/tags/aggregates/tag.aggregate';

const ON_CANCEL = () => {};

function getResolvedKeys(tags: TagPrimitives[]): Set<string> {
  return new Set(tags.filter(t => t.systemKey).map(t => t.systemKey!));
}

export async function resolveSystemTagsMenu(container: IContainer, userId: string): Promise<void> {
  const allTags = container.listTags.execute(userId);
  const unresolved = allTags.filter(t => t.isSystem && !t.systemKey);

  if (unresolved.length === 0) return;

  console.log('\n--- Migración de etiquetas del sistema ---');
  console.log('Se detectaron etiquetas del sistema sin identificar.');
  console.log('Por favor, ayúdanos a reconocerlas para que el autoplanificador funcione correctamente.\n');

  const resolvedKeys = getResolvedKeys(allTags);

  // Group seeds by dimension, filtering out already resolved keys
  const seedsByDimension = new Map<string, typeof SYSTEM_TAG_SEEDS>();
  for (const seed of SYSTEM_TAG_SEEDS) {
    if (resolvedKeys.has(seed.systemKey)) continue;
    const existing = seedsByDimension.get(seed.dimension) ?? [];
    existing.push(seed);
    seedsByDimension.set(seed.dimension, existing);
  }

  // Group unresolved tags by dimension
  const unresolvedByDimension = new Map<string, TagPrimitives[]>();
  for (const tag of unresolved) {
    const existing = unresolvedByDimension.get(tag.dimension) ?? [];
    existing.push(tag);
    unresolvedByDimension.set(tag.dimension, existing);
  }

  for (const [dimension, seeds] of seedsByDimension) {
    const candidates = unresolvedByDimension.get(dimension);
    if (!candidates || candidates.length === 0) continue;

    for (const seed of seeds) {
      if (candidates.length === 0) break;

      const choices = candidates.map(c => ({
        title: c.name,
        value: c.id,
      }));

      const response = await prompts({
        type: 'select',
        name: 'tagId',
        message: `¿Cuál de tus etiquetas "${dimension}" corresponde a "${seed.name}"?`,
        choices,
      }, { onCancel: ON_CANCEL });

      if (!response?.tagId) continue;

      container.setSystemKey(response.tagId, seed.systemKey);

      // Remove from remaining candidates
      const idx = candidates.findIndex(c => c.id === response.tagId);
      if (idx !== -1) candidates.splice(idx, 1);
    }
  }

  console.log('Migración de etiquetas completada.\n');
}
