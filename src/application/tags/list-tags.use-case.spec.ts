import { describe, it, expect, beforeEach } from 'vitest';
import { ListTagsUseCase } from './list-tags.use-case';
import { InMemoryTagRepository } from '../../infrastructure/repositories/in-memory-tag.repository';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';

describe('ListTagsUseCase', () => {
  const userId = '550e8400-e29b-41d4-a716-446655449999';
  const otherUserId = '550e8400-e29b-41d4-a716-446655440099';

  let useCase: ListTagsUseCase;
  let repo: InMemoryTagRepository;

  beforeEach(() => {
    repo = new InMemoryTagRepository();
    useCase = new ListTagsUseCase(repo);
  });

  it('debe devolver lista vacía si no hay etiquetas', () => {
    expect(useCase.execute(userId)).toEqual([]);
  });

  it('debe devolver solo las etiquetas del usuario', () => {
    const tag1 = Tag.create('550e8400-e29b-41d4-a716-446655440001', userId, 'Desayuno', TagDimension.MOMENTO_DIA, true);
    const tag2 = Tag.create('550e8400-e29b-41d4-a716-446655440002', userId, 'Cena', TagDimension.MOMENTO_DIA, true);
    repo.save(tag1);
    repo.save(tag2);

    const result = useCase.execute(userId);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(tag1.toPrimitives());
    expect(result[1]).toEqual(tag2.toPrimitives());
  });

  it('no debe devolver etiquetas de otro usuario', () => {
    const tag = Tag.create('550e8400-e29b-41d4-a716-446655440001', otherUserId, 'Desayuno', TagDimension.MOMENTO_DIA, true);
    repo.save(tag);

    const result = useCase.execute(userId);
    expect(result).toHaveLength(0);
  });
});
