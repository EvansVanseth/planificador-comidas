import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteRecipeUseCase } from './delete-recipe.use-case';
import { InMemoryRecipeRepository } from '../../infrastructure/repositories/in-memory-recipe.repository';
import { Recipe } from '@/domain/recipes/aggregates/recipe.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../shared/errors/app-error';

describe('DeleteRecipeUseCase', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';
  const validUserId = '550e8400-e29b-41d4-a716-446655440001';
  const defaultTags = [
    { id: '550e8400-e29b-41d4-a716-446655440010', dimension: TagDimension.MOMENTO_DIA },
    { id: '550e8400-e29b-41d4-a716-446655440011', dimension: TagDimension.FORMATO },
    { id: '550e8400-e29b-41d4-a716-446655440012', dimension: TagDimension.TIPO_PLATO },
  ];

  let useCase: DeleteRecipeUseCase;
  let repo: InMemoryRecipeRepository;

  beforeEach(() => {
    repo = new InMemoryRecipeRepository();
    useCase = new DeleteRecipeUseCase(repo);
  });

  it('debe eliminar una receta existente', () => {
    repo.save(Recipe.create(validId, validUserId, 'Test', 2, 10, null, [], defaultTags));
    useCase.execute(validId);
    expect(repo.findById(validId)).toBeNull();
  });

  it('debe lanzar error si la receta no existe', () => {
    expect(() => useCase.execute(validId)).toThrow(AppError);
  });
});
