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

  it('debe crear una etiqueta de sistema y devolver un id', () => {
    const id = useCase.execute(systemUserId, 'Desayuno', TagDimension.MOMENTO_DIA, true);
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
    const saved = repo.findById(id);
    expect(saved).not.toBeNull();
    expect(saved!.getName()).toBe('Desayuno');
    expect(saved!.isSystemTag()).toBe(true);
  });

  it('debe crear una etiqueta de usuario y devolver un id', () => {
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    const id = useCase.execute(userId, 'Vegano', TagDimension.ESTILOS_VIDA);
    const saved = repo.findById(id);
    expect(saved!.getUserId()).toBe(userId);
  });

  it('debe rechazar nombre duplicado en la misma dimensión', () => {
    useCase.execute(systemUserId, 'Pasta', TagDimension.TIPO_PLATO, true);
    expect(() => useCase.execute(systemUserId, 'Pasta', TagDimension.TIPO_PLATO, true)).toThrow(AppError);
  });

  it('debe rechazar nombre duplicado ignorando mayúsculas', () => {
    useCase.execute(systemUserId, 'Pasta', TagDimension.TIPO_PLATO, true);
    expect(() => useCase.execute(systemUserId, 'pasta', TagDimension.TIPO_PLATO, true)).toThrow(AppError);
  });

  it('debe permitir mismo nombre en distinta dimensión', () => {
    useCase.execute(systemUserId, 'Pasta', TagDimension.TIPO_PLATO, true);
    expect(() => useCase.execute(systemUserId, 'Pasta', TagDimension.MOMENTO_DIA, true)).not.toThrow();
  });

  it('debe rechazar crear etiqueta FORMATO que no sea de sistema', () => {
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    expect(() => useCase.execute(userId, 'Caliente', TagDimension.FORMATO, false)).toThrow(DomainError);
  });
});
