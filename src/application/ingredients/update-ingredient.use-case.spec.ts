import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateIngredientUseCase } from './update-ingredient.use-case';
import { InMemoryIngredientRepository } from '../../infrastructure/repositories/in-memory-ingredient.repository';
import { Ingredient } from '@/domain/ingredients/aggregates/ingredient.aggregate';
import { AppError } from '../shared/errors/app-error';

describe('UpdateIngredientUseCase', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';
  const validUserId = '550e8400-e29b-41d4-a716-446655440001';

  let useCase: UpdateIngredientUseCase;
  let repo: InMemoryIngredientRepository;

  beforeEach(() => {
    repo = new InMemoryIngredientRepository();
    useCase = new UpdateIngredientUseCase(repo);

    repo.save(Ingredient.create(validId, validUserId, 'Original'));
  });

  it('debe actualizar el nombre', () => {
    useCase.execute({ id: validId, name: 'Renombrado' });
    expect(repo.findById(validId)!.getName()).toBe('Renombrado');
  });

  it('debe actualizar el userId', () => {
    const newUserId = '550e8400-e29b-41d4-a716-446655440002';
    useCase.execute({ id: validId, userId: newUserId });
    expect(repo.findById(validId)!.getUserId()).toBe(newUserId);
  });

  it('debe lanzar error si el ingrediente no existe', () => {
    expect(() => useCase.execute({ id: '550e8400-e29b-41d4-a716-446655449999', name: 'X' })).toThrow(AppError);
  });
});
