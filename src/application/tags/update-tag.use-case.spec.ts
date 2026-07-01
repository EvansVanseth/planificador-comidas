import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateTagUseCase } from './update-tag.use-case';
import { InMemoryTagRepository } from '../../infrastructure/repositories/in-memory-tag.repository';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../shared/errors/app-error';

describe('UpdateTagUseCase', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';
  const validUserId = '550e8400-e29b-41d4-a716-446655440001';

  let useCase: UpdateTagUseCase;
  let repo: InMemoryTagRepository;

  beforeEach(() => {
    repo = new InMemoryTagRepository();
    useCase = new UpdateTagUseCase(repo);

    const tag = Tag.create(validId, null, 'Original', TagDimension.MOMENTO_DIA);
    repo.save(tag);
  });

  it('debe actualizar el nombre', () => {
    useCase.execute({ id: validId, name: 'Renombrado' });
    expect(repo.findById(validId)!.getName()).toBe('Renombrado');
  });

  it('debe actualizar el userId', () => {
    useCase.execute({ id: validId, userId: validUserId });
    expect(repo.findById(validId)!.getUserId()).toBe(validUserId);
  });

  it('debe actualizar el userId a null', () => {
    useCase.execute({ id: validId, userId: null });
    expect(repo.findById(validId)!.getUserId()).toBeNull();
  });

  it('debe actualizar la dimensión', () => {
    useCase.execute({ id: validId, dimension: TagDimension.FORMATO });
    expect(repo.findById(validId)!.getDimension()).toBe(TagDimension.FORMATO);
  });

  it('debe lanzar error si la etiqueta no existe', () => {
    expect(() => useCase.execute({ id: '550e8400-e29b-41d4-a716-446655449999', name: 'X' })).toThrow(AppError);
  });
});
