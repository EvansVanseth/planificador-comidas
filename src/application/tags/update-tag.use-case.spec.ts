import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateTagUseCase } from './update-tag.use-case';
import { InMemoryTagRepository } from '../../infrastructure/repositories/in-memory-tag.repository';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../shared/errors/app-error';
import { DomainError } from '@/domain/shared/errors/domain-error';

describe('UpdateTagUseCase', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';
  const otherTagId = '550e8400-e29b-41d4-a716-446655440001';
  const validUserId = '550e8400-e29b-41d4-a716-446655440002';

  let useCase: UpdateTagUseCase;
  let repo: InMemoryTagRepository;

  beforeEach(() => {
    repo = new InMemoryTagRepository();
    useCase = new UpdateTagUseCase(repo);

    const tag = Tag.create(validId, validUserId, 'Original', TagDimension.MOMENTO_DIA, true);
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

  it('debe actualizar la dimensión', () => {
    const userTagId = '550e8400-e29b-41d4-a716-446655440030';
    repo.save(Tag.create(userTagId, validUserId, 'Arroz', TagDimension.TIPO_PLATO, false));
    useCase.execute({ id: userTagId, dimension: TagDimension.MOMENTO_DIA });
    expect(repo.findById(userTagId)!.getDimension()).toBe(TagDimension.MOMENTO_DIA);
  });

  it('debe lanzar error si la etiqueta no existe', () => {
    expect(() => useCase.execute({ id: '550e8400-e29b-41d4-a716-446655449999', name: 'X' })).toThrow(AppError);
  });

  it('debe rechazar renombrar a un nombre duplicado en la misma dimensión', () => {
    repo.save(Tag.create(otherTagId, validUserId, 'Existente', TagDimension.MOMENTO_DIA, true));
    expect(() => useCase.execute({ id: validId, name: 'Existente' })).toThrow(AppError);
  });

  it('debe rechazar renombrar a un nombre duplicado ignorando mayúsculas', () => {
    repo.save(Tag.create(otherTagId, validUserId, 'Existente', TagDimension.MOMENTO_DIA, true));
    expect(() => useCase.execute({ id: validId, name: 'existente' })).toThrow(AppError);
  });

  it('debe permitir mantener el mismo nombre al actualizar', () => {
    useCase.execute({ id: validId, name: 'Original' });
    expect(repo.findById(validId)!.getName()).toBe('Original');
  });

  it('debe rechazar cambiar una etiqueta de usuario a FORMATO', () => {
    const userTagId = '550e8400-e29b-41d4-a716-446655440010';
    repo.save(Tag.create(userTagId, validUserId, 'Pasta', TagDimension.TIPO_PLATO, false));
    expect(() => useCase.execute({ id: userTagId, dimension: TagDimension.FORMATO })).toThrow(DomainError);
  });

  it('debe rechazar asignar userId a una etiqueta FORMATO', () => {
    const formatTagId = '550e8400-e29b-41d4-a716-446655440020';
    repo.save(Tag.create(formatTagId, validUserId, 'Caliente', TagDimension.FORMATO, true));
    expect(() => useCase.execute({ id: formatTagId, userId: validUserId })).toThrow(DomainError);
  });
});
