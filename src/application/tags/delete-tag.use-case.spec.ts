import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteTagUseCase } from './delete-tag.use-case';
import { InMemoryTagRepository } from '../../infrastructure/repositories/in-memory-tag.repository';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../shared/errors/app-error';

describe('DeleteTagUseCase', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';

  let useCase: DeleteTagUseCase;
  let repo: InMemoryTagRepository;

  beforeEach(() => {
    repo = new InMemoryTagRepository();
    useCase = new DeleteTagUseCase(repo);
  });

  it('debe eliminar una etiqueta existente', () => {
    const tag = Tag.create(validId, null, 'Test', TagDimension.MOMENTO_DIA);
    repo.save(tag);
    useCase.execute(validId);
    expect(repo.findById(validId)).toBeNull();
  });

  it('debe lanzar error si la etiqueta no existe', () => {
    expect(() => useCase.execute(validId)).toThrow(AppError);
  });
});
