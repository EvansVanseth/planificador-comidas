import { describe, it, expect, beforeEach } from 'vitest';
import { CreateTagUseCase } from './create-tag.use-case';
import { InMemoryTagRepository } from '../../infrastructure/repositories/in-memory-tag.repository';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../shared/errors/app-error';
import { DomainError } from '@/domain/shared/errors/domain-error';

describe('CreateTagUseCase', () => {
  let useCase: CreateTagUseCase;
  let repo: InMemoryTagRepository;

  beforeEach(() => {
    repo = new InMemoryTagRepository();
    useCase = new CreateTagUseCase(repo);
  });

  it('debe crear una etiqueta de sistema y devolver un id', () => {
    const id = useCase.execute(null, 'Desayuno', TagDimension.MOMENTO_DIA);
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
    const saved = repo.findById(id);
    expect(saved).not.toBeNull();
    expect(saved!.getName()).toBe('Desayuno');
    expect(saved!.getUserId()).toBeNull();
  });

  it('debe crear una etiqueta de usuario y devolver un id', () => {
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    const id = useCase.execute(userId, 'Vegano', TagDimension.ESTILOS_VIDA);
    const saved = repo.findById(id);
    expect(saved!.getUserId()).toBe(userId);
  });

  it('debe rechazar nombre duplicado en la misma dimensión', () => {
    useCase.execute(null, 'Pasta', TagDimension.TIPO_PLATO);
    expect(() => useCase.execute(null, 'Pasta', TagDimension.TIPO_PLATO)).toThrow(AppError);
  });

  it('debe rechazar nombre duplicado ignorando mayúsculas', () => {
    useCase.execute(null, 'Pasta', TagDimension.TIPO_PLATO);
    expect(() => useCase.execute(null, 'pasta', TagDimension.TIPO_PLATO)).toThrow(AppError);
  });

  it('debe permitir mismo nombre en distinta dimensión', () => {
    useCase.execute(null, 'Pasta', TagDimension.TIPO_PLATO);
    expect(() => useCase.execute(null, 'Pasta', TagDimension.MOMENTO_DIA)).not.toThrow();
  });

  it('debe rechazar crear etiqueta FORMATO con userId', () => {
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    expect(() => useCase.execute(userId, 'Caliente', TagDimension.FORMATO)).toThrow(DomainError);
  });
});
