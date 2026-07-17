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

  beforeEach(async () => {
    repo = new InMemoryIngredientRepository();
    useCase = new UpdateIngredientUseCase(repo);

    await repo.save(Ingredient.create(validId, validUserId, 'Original'));
  });

  it('debe actualizar el nombre', async () => {
    await useCase.execute({ id: validId, name: 'Renombrado' });
    expect((await repo.findById(validId))!.getName()).toBe('Renombrado');
  });

  it('debe actualizar el userId', async () => {
    const newUserId = '550e8400-e29b-41d4-a716-446655440002';
    await useCase.execute({ id: validId, userId: newUserId });
    expect((await repo.findById(validId))!.getUserId()).toBe(newUserId);
  });

  it('debe lanzar error si el ingrediente no existe', async () => {
    await expect(useCase.execute({ id: '550e8400-e29b-41d4-a716-446655449999', name: 'X' })).rejects.toThrow(AppError);
  });

  it('debe rechazar renombrar a un nombre duplicado', async () => {
    const otherId = '550e8400-e29b-41d4-a716-446655440010';
    await repo.save(Ingredient.create(otherId, validUserId, 'Existente'));
    await expect(useCase.execute({ id: validId, name: 'Existente' })).rejects.toThrow(AppError);
  });

  it('debe rechazar renombrar a un nombre duplicado ignorando mayúsculas', async () => {
    const otherId = '550e8400-e29b-41d4-a716-446655440010';
    await repo.save(Ingredient.create(otherId, validUserId, 'Existente'));
    await expect(useCase.execute({ id: validId, name: 'existente' })).rejects.toThrow(AppError);
  });

  it('debe permitir mantener el mismo nombre al actualizar', async () => {
    await useCase.execute({ id: validId, name: 'Original' });
    expect((await repo.findById(validId))!.getName()).toBe('Original');
  });
});
