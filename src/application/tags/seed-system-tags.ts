import { randomUUID } from 'node:crypto'
import { TagRepository } from '@/infrastructure/repositories/tag-repository.interface'
import { Tag } from '@/domain/tags/aggregates/tag.aggregate'
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum'

interface SystemTagSeed {
  name: string;
  dimension: TagDimension;
}

const SYSTEM_TAG_SEEDS: SystemTagSeed[] = [
  // MOMENTO_DIA — seed + personalizables
  { name: 'Desayuno', dimension: TagDimension.MOMENTO_DIA },
  { name: 'Comida', dimension: TagDimension.MOMENTO_DIA },
  { name: 'Cena', dimension: TagDimension.MOMENTO_DIA },
  // FORMATO — fijas de sistema
  { name: 'Caliente', dimension: TagDimension.FORMATO },
  { name: 'Frio', dimension: TagDimension.FORMATO },
  // TIPO_PLATO — seed + personalizables
  { name: 'Carne', dimension: TagDimension.TIPO_PLATO },
  { name: 'Pescado', dimension: TagDimension.TIPO_PLATO },
  { name: 'Legumbres', dimension: TagDimension.TIPO_PLATO },
  { name: 'Pasta', dimension: TagDimension.TIPO_PLATO },
  { name: 'Ensalada', dimension: TagDimension.TIPO_PLATO },
  { name: 'Arroz', dimension: TagDimension.TIPO_PLATO },
  { name: 'Dulce', dimension: TagDimension.TIPO_PLATO },
  // ESTILOS_VIDA — seed + personalizables
  { name: 'Bajo en calorías', dimension: TagDimension.ESTILOS_VIDA },
  { name: 'Vegetariano', dimension: TagDimension.ESTILOS_VIDA },
  { name: 'Vegano', dimension: TagDimension.ESTILOS_VIDA },
];

export function seedSystemTags(tagRepository: TagRepository): void {
  const existing = tagRepository.findAll();
  const hasSystemTags = existing.some(t => t.getUserId() === null);

  if (hasSystemTags) return;

  for (const seed of SYSTEM_TAG_SEEDS) {
    const tag = Tag.create(randomUUID(), null, seed.name, seed.dimension);
    tagRepository.save(tag);
  }
}
