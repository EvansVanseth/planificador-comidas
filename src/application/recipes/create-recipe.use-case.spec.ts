import { describe, it, expect, beforeEach } from 'vitest';
import { CreateRecipeUseCase } from './create-recipe.use-case';
import { InMemoryRecipeRepository } from '../../infrastructure/repositories/in-memory-recipe.repository';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../shared/errors/app-error';

describe('CreateRecipeUseCase', () => {
  const validUserId = '550e8400-e29b-41d4-a716-446655440001';
  const defaultTags = [
    { id: '550e8400-e29b-41d4-a716-446655440010', dimension: TagDimension.MOMENTO_DIA },
    { id: '550e8400-e29b-41d4-a716-446655440011', dimension: TagDimension.FORMATO },
    { id: '550e8400-e29b-41d4-a716-446655440012', dimension: TagDimension.TIPO_PLATO },
  ];

  let useCase: CreateRecipeUseCase;
  let repo: InMemoryRecipeRepository;

  beforeEach(() => {
    repo = new InMemoryRecipeRepository();
    useCase = new CreateRecipeUseCase(repo);
  });

  it('debe crear una receta y devolver un id', () => {
    const id = useCase.execute(validUserId, 'Milanesas', 2, 20, null, [], defaultTags);
    expect(id).toBeDefined();
    const saved = repo.findById(id);
    expect(saved).not.toBeNull();
    expect(saved!.getName()).toBe('Milanesas');
  });

  it('debe rechazar nombre duplicado', () => {
    useCase.execute(validUserId, 'Milanesas', 2, 20, null, [], defaultTags);
    expect(() => useCase.execute(validUserId, 'Milanesas', 2, 20, null, [], defaultTags)).toThrow(AppError);
  });

  it('debe rechazar nombre duplicado ignorando mayúsculas', () => {
    useCase.execute(validUserId, 'Milanesas', 2, 20, null, [], defaultTags);
    expect(() => useCase.execute(validUserId, 'milanesas', 2, 20, null, [], defaultTags)).toThrow(AppError);
  });
});
