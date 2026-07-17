import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryIngredientRepository } from './in-memory-ingredient.repository';
import { Ingredient } from '@/domain/ingredients/aggregates/ingredient.aggregate';

describe('InMemoryIngredientRepository', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';
  const validUserId = '550e8400-e29b-41d4-a716-446655440001';

  let repo: InMemoryIngredientRepository;

  beforeEach(() => {
    repo = new InMemoryIngredientRepository();
  });

  it('debe guardar y recuperar un ingrediente por id', async () => {
    const ingredient = Ingredient.create(validId, validUserId, 'Arroz');
    await repo.save(ingredient);
    const found = await repo.findById(validId);
    expect(found).not.toBeNull();
    expect(found!.getId()).toBe(validId);
  });

  it('debe devolver null si no existe', async () => {
    expect(await repo.findById(validId)).toBeNull();
  });

  it('debe listar todos los ingredientes', async () => {
    await repo.save(Ingredient.create(validId, validUserId, 'Arroz'));
    await repo.save(Ingredient.create('550e8400-e29b-41d4-a716-446655440002', validUserId, 'Frijoles'));
    expect(await repo.findAll()).toHaveLength(2);
  });

  it('debe devolver lista vacía si no hay ingredientes', async () => {
    expect(await repo.findAll()).toHaveLength(0);
  });

  it('debe eliminar un ingrediente por id', async () => {
    await repo.save(Ingredient.create(validId, validUserId, 'Arroz'));
    await repo.delete(validId);
    expect(await repo.findById(validId)).toBeNull();
  });
});
