import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteTagUseCase } from './delete-tag.use-case';
import { InMemoryTagRepository } from '../../infrastructure/repositories/in-memory-tag.repository';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../shared/errors/app-error';

describe('DeleteTagUseCase', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';
  const validUserId = '550e8400-e29b-41d4-a716-446655440001';

  let useCase: DeleteTagUseCase;
  let repo: InMemoryTagRepository;

  beforeEach(() => {
    repo = new InMemoryTagRepository();
    useCase = new DeleteTagUseCase(repo);
  });

  it('debe eliminar una etiqueta de usuario existente', () => {
    const tag = Tag.create(validId, validUserId, 'Test', TagDimension.MOMENTO_DIA, false);
    repo.save(tag);
    useCase.execute(validId);
    expect(repo.findById(validId)).toBeNull();
  });

  it('debe lanzar error si la etiqueta no existe', () => {
    expect(() => useCase.execute(validId)).toThrow(AppError);
  });

  it('debe rechazar eliminar una etiqueta del sistema', () => {
    const tag = Tag.create(validId, validUserId, 'Desayuno', TagDimension.MOMENTO_DIA, true);
    repo.save(tag);
    expect(() => useCase.execute(validId)).toThrow(AppError);
    expect(repo.findById(validId)).not.toBeNull();
  });
});
