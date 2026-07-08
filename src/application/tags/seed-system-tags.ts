import { randomUUID } from 'node:crypto'
import { TagRepository } from '@/infrastructure/repositories/tag-repository.interface'
import { Tag } from '@/domain/tags/aggregates/tag.aggregate'
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum'

export interface SystemTagSeed {
  name: string;
  dimension: TagDimension;
  systemKey: string;
}

export const SYSTEM_TAG_SEEDS: SystemTagSeed[] = [
  { name: 'Desayuno', dimension: TagDimension.MOMENTO_DIA, systemKey: 'DESAYUNO' },
  { name: 'Comida', dimension: TagDimension.MOMENTO_DIA, systemKey: 'COMIDA' },
  { name: 'Cena', dimension: TagDimension.MOMENTO_DIA, systemKey: 'CENA' },
  { name: 'Caliente', dimension: TagDimension.FORMATO, systemKey: 'CALIENTE' },
  { name: 'Frio', dimension: TagDimension.FORMATO, systemKey: 'FRIO' },
  { name: 'Carne', dimension: TagDimension.TIPO_PLATO, systemKey: 'CARNE' },
  { name: 'Pescado', dimension: TagDimension.TIPO_PLATO, systemKey: 'PESCADO' },
  { name: 'Legumbres', dimension: TagDimension.TIPO_PLATO, systemKey: 'LEGUMBRES' },
  { name: 'Pasta', dimension: TagDimension.TIPO_PLATO, systemKey: 'PASTA' },
  { name: 'Ensalada', dimension: TagDimension.TIPO_PLATO, systemKey: 'ENSALADA' },
  { name: 'Arroz', dimension: TagDimension.TIPO_PLATO, systemKey: 'ARROZ' },
  { name: 'Dulce', dimension: TagDimension.TIPO_PLATO, systemKey: 'DULCE' },
  { name: 'Bajo en calorías', dimension: TagDimension.ESTILOS_VIDA, systemKey: 'BAJO_CALORIAS' },
  { name: 'Vegetariano', dimension: TagDimension.ESTILOS_VIDA, systemKey: 'VEGETARIANO' },
  { name: 'Vegano', dimension: TagDimension.ESTILOS_VIDA, systemKey: 'VEGANO' },
];

export function seedSystemTags(tagRepository: TagRepository, userId: string): void {
  const existing = tagRepository.findAll();

  // Create missing system tags
  const hasSystemTags = existing.some(t => t.getUserId() === userId && t.isSystemTag());
  if (!hasSystemTags) {
    for (const seed of SYSTEM_TAG_SEEDS) {
      const tag = Tag.create(randomUUID(), userId, seed.name, seed.dimension, true, seed.systemKey);
      tagRepository.save(tag);
    }
    return;
  }

  // Migrate: patch existing system tags that are missing systemKey
  const userSystemTags = existing.filter(t => t.getUserId() === userId && t.isSystemTag());
  for (const tag of userSystemTags) {
    if (tag.getSystemKey() !== null) continue;

    const match = SYSTEM_TAG_SEEDS.find(
      s => s.name.toLowerCase() === tag.getName().toLowerCase()
        && s.dimension === tag.getDimension()
    );
    if (match) {
      // Re-create the tag with systemKey set
      const migrated = Tag.create(tag.getId(), tag.getUserId(), tag.getName(), tag.getDimension(), true, match.systemKey);
      tagRepository.save(migrated);
    }
  }
}
