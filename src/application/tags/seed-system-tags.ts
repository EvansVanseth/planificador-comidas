import { randomUUID } from 'node:crypto'
import { TagRepository } from '@/domain/tags/repositories/tag-repository.interface'
import { Tag } from '@/domain/tags/aggregates/tag.aggregate'
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum'

export interface SystemTagSeed {
  name: string;
  dimension: TagDimension;
  systemKey: string;
  order?: number;
}

export const SYSTEM_TAG_SEEDS: SystemTagSeed[] = [
  { name: 'Desayuno', dimension: TagDimension.MOMENTO_DIA, systemKey: 'DESAYUNO', order: 1 },
  { name: 'Comida', dimension: TagDimension.MOMENTO_DIA, systemKey: 'COMIDA', order: 2 },
  { name: 'Cena', dimension: TagDimension.MOMENTO_DIA, systemKey: 'CENA', order: 3 },
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

export async function seedSystemTags(tagRepository: TagRepository, userId: string): Promise<void> {
  const existing = await tagRepository.findAll();

  // Create missing system tags
  const hasSystemTags = existing.some(t => t.getUserId() === userId && t.isSystemTag());
  if (!hasSystemTags) {
    for (const seed of SYSTEM_TAG_SEEDS) {
      const tag = Tag.create(randomUUID(), userId, seed.name, seed.dimension, true, seed.systemKey, seed.order ?? 0);
      await tagRepository.save(tag);
    }
    return;
  }

  // Migrate: patch existing system tags that are missing systemKey or order
  const userSystemTags = existing.filter(t => t.getUserId() === userId && t.isSystemTag());
  for (const tag of userSystemTags) {
    const match = SYSTEM_TAG_SEEDS.find(
      s => s.name.toLowerCase() === tag.getName().toLowerCase()
        && s.dimension === tag.getDimension()
    );
    if (!match) continue;

    if (tag.getSystemKey() !== null && tag.getOrder() === (match.order ?? 0)) continue;

    const migrated = Tag.create(tag.getId(), tag.getUserId(), match.name, tag.getDimension(), true, match.systemKey, match.order ?? 0);
    await tagRepository.save(migrated);
  }

  // Migrate MOMENTO_DIA tags with order === 0 to a contiguous sequence
  // (old data, user-created tags, etc.)
  await migrateMomentTagOrders(tagRepository, userId);
}

async function migrateMomentTagOrders(tagRepository: TagRepository, userId: string): Promise<void> {
  const allTags = await tagRepository.findAllByUserId(userId);
  const momentTags = allTags.filter(t => t.getDimension() === TagDimension.MOMENTO_DIA);

  const needsMigration = momentTags.some(t => t.getOrder() === 0);
  if (!needsMigration) return;

  const systemTag = (key: string) => momentTags.find(t => t.getSystemKey() === key);
  const otherSystem = momentTags.filter(t => t.isSystemTag() && !['DESAYUNO', 'COMIDA', 'CENA'].includes(t.getSystemKey() ?? ''));
  const userTags = momentTags.filter(t => !t.isSystemTag());

  let order = 0;
  const toUpdate: Tag[] = [];

  for (const tag of [systemTag('DESAYUNO'), systemTag('COMIDA'), systemTag('CENA')].filter(Boolean) as Tag[]) {
    order++;
    if (tag.getOrder() !== order) {
      tag.changeOrder(order);
      toUpdate.push(tag);
    }
  }

  for (const tag of otherSystem) {
    order++;
    if (tag.getOrder() !== order) {
      tag.changeOrder(order);
      toUpdate.push(tag);
    }
  }

  for (const tag of userTags) {
    order++;
    if (tag.getOrder() !== order) {
      tag.changeOrder(order);
      toUpdate.push(tag);
    }
  }

  for (const tag of toUpdate) {
    await tagRepository.save(tag);
  }
}
