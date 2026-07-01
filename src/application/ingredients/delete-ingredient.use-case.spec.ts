import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteIngredientUseCase } from './delete-ingredient.use-case';
import { InMemoryIngredientRepository } from '../../infrastructure/repositories/in-memory-ingredient.repository';
import { Ingredient } from '@/domain/ingredients/aggregates/ingredient.aggregate';
import { AppError } from '../shared/errors/app-error';

describe('DeleteIngredientUseCase', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';
  const validUserId = '550e8400-e29b-41d4-a716-446655440001';

  let useCase: DeleteIngredientUseCase;
  let repo: InMemoryIngredientRepository;

  beforeEach(() => {
    repo = new InMemoryIngredientRepository();
    useCase = new DeleteIngredientUseCase(repo);
  });

  it('debe eliminar un ingrediente existente', () => {
    repo.save(Ingredient.create(validId, validUserId, 'Test'));
    useCase.execute(validId);
    expect(repo.findById(validId)).toBeNull();
  });

  it('debe lanzar error si el ingrediente no existe', () => {
    expect(() => useCase.execute(validId)).toThrow(AppError);
  });
});
