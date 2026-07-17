import { describe, it, expect, beforeEach } from 'vitest';
import { CreateTagUseCase } from './create-tag.use-case';
import { InMemoryTagRepository } from '../../infrastructure/repositories/in-memory-tag.repository';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../shared/errors/app-error';
import { DomainError } from '@/domain/shared/errors/domain-error';

describe('CreateTagUseCase', () => {
  const systemUserId = '550e8400-e29b-41d4-a716-446655449999';

  let useCase: CreateTagUseCase;
  let repo: InMemoryTagRepository;

  beforeEach(() => {
    repo = new InMemoryTagRepository();
    useCase = new CreateTagUseCase(repo);
  });

  it('debe crear una etiqueta de sistema y devolver un id', async () => {
    const id = await useCase.execute(systemUserId, 'Desayuno', TagDimension.MOMENTO_DIA, true);
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
    const saved = await repo.findById(id);
    expect(saved).not.toBeNull();
    expect(saved!.getName()).toBe('Desayuno');
    expect(saved!.isSystemTag()).toBe(true);
  });

  it('debe crear una etiqueta de usuario y devolver un id', async () => {
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    const id = await useCase.execute(userId, 'Vegano', TagDimension.ESTILOS_VIDA);
    const saved = await repo.findById(id);
    expect(saved!.getUserId()).toBe(userId);
  });

  it('debe rechazar nombre duplicado en la misma dimensión', async () => {
    await useCase.execute(systemUserId, 'Pasta', TagDimension.TIPO_PLATO, true);
    await expect(useCase.execute(systemUserId, 'Pasta', TagDimension.TIPO_PLATO, true)).rejects.toThrow(AppError);
  });

  it('debe rechazar nombre duplicado ignorando mayúsculas', async () => {
    await useCase.execute(systemUserId, 'Pasta', TagDimension.TIPO_PLATO, true);
    await expect(useCase.execute(systemUserId, 'pasta', TagDimension.TIPO_PLATO, true)).rejects.toThrow(AppError);
  });

  it('debe permitir mismo nombre en distinta dimensión', async () => {
    await useCase.execute(systemUserId, 'Pasta', TagDimension.TIPO_PLATO, true);
    await expect(useCase.execute(systemUserId, 'Pasta', TagDimension.MOMENTO_DIA, true)).resolves.not.toThrow();
  });

  it('debe rechazar crear etiqueta FORMATO que no sea de sistema', async () => {
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    await expect(useCase.execute(userId, 'Caliente', TagDimension.FORMATO, false)).rejects.toThrow(DomainError);
  });
});
