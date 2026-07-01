import { describe, it, expect, beforeEach } from 'vitest';
import { ListTagsUseCase } from './list-tags.use-case';
import { InMemoryTagRepository } from '../../infrastructure/repositories/in-memory-tag.repository';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';

describe('ListTagsUseCase', () => {
  let useCase: ListTagsUseCase;
  let repo: InMemoryTagRepository;

  beforeEach(() => {
    repo = new InMemoryTagRepository();
    useCase = new ListTagsUseCase(repo);
  });

  it('debe devolver lista vacía si no hay etiquetas', () => {
    expect(useCase.execute()).toEqual([]);
  });

  it('debe devolver todas las etiquetas como primitivas', () => {
    const systemUserId = '550e8400-e29b-41d4-a716-446655449999';
    const tag1 = Tag.create('550e8400-e29b-41d4-a716-446655440001', systemUserId, 'Desayuno', TagDimension.MOMENTO_DIA, true);
    const tag2 = Tag.create('550e8400-e29b-41d4-a716-446655440002', systemUserId, 'Cena', TagDimension.MOMENTO_DIA, true);
    repo.save(tag1);
    repo.save(tag2);

    const result = useCase.execute();
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(tag1.toPrimitives());
    expect(result[1]).toEqual(tag2.toPrimitives());
  });
});
