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

  beforeEach(async () => {
    repo = new InMemoryTagRepository();
    useCase = new UpdateTagUseCase(repo);

    const tag = Tag.create(validId, validUserId, 'Original', TagDimension.MOMENTO_DIA, true);
    await repo.save(tag);
  });

  it('debe actualizar el nombre', async () => {
    await useCase.execute({ id: validId, name: 'Renombrado' });
    const saved = await repo.findById(validId);
    expect(saved!.getName()).toBe('Renombrado');
  });

  it('debe actualizar el userId', async () => {
    await useCase.execute({ id: validId, userId: validUserId });
    const saved = await repo.findById(validId);
    expect(saved!.getUserId()).toBe(validUserId);
  });

  it('debe actualizar la dimensión', async () => {
    const userTagId = '550e8400-e29b-41d4-a716-446655440030';
    await repo.save(Tag.create(userTagId, validUserId, 'Arroz', TagDimension.TIPO_PLATO, false));
    await useCase.execute({ id: userTagId, dimension: TagDimension.MOMENTO_DIA });
    const saved = await repo.findById(userTagId);
    expect(saved!.getDimension()).toBe(TagDimension.MOMENTO_DIA);
  });

  it('debe lanzar error si la etiqueta no existe', async () => {
    await expect(useCase.execute({ id: '550e8400-e29b-41d4-a716-446655449999', name: 'X' })).rejects.toThrow(AppError);
  });

  it('debe rechazar renombrar a un nombre duplicado en la misma dimensión', async () => {
    await repo.save(Tag.create(otherTagId, validUserId, 'Existente', TagDimension.MOMENTO_DIA, true));
    await expect(useCase.execute({ id: validId, name: 'Existente' })).rejects.toThrow(AppError);
  });

  it('debe rechazar renombrar a un nombre duplicado ignorando mayúsculas', async () => {
    await repo.save(Tag.create(otherTagId, validUserId, 'Existente', TagDimension.MOMENTO_DIA, true));
    await expect(useCase.execute({ id: validId, name: 'existente' })).rejects.toThrow(AppError);
  });

  it('debe permitir mantener el mismo nombre al actualizar', async () => {
    await useCase.execute({ id: validId, name: 'Original' });
    const saved = await repo.findById(validId);
    expect(saved!.getName()).toBe('Original');
  });

  it('debe rechazar cambiar una etiqueta de usuario a FORMATO', async () => {
    const userTagId = '550e8400-e29b-41d4-a716-446655440010';
    await repo.save(Tag.create(userTagId, validUserId, 'Pasta', TagDimension.TIPO_PLATO, false));
    await expect(useCase.execute({ id: userTagId, dimension: TagDimension.FORMATO })).rejects.toThrow(DomainError);
  });

  it('debe rechazar asignar userId a una etiqueta FORMATO', async () => {
    const formatTagId = '550e8400-e29b-41d4-a716-446655440020';
    await repo.save(Tag.create(formatTagId, validUserId, 'Caliente', TagDimension.FORMATO, true));
    await expect(useCase.execute({ id: formatTagId, userId: validUserId })).rejects.toThrow(DomainError);
  });
});
