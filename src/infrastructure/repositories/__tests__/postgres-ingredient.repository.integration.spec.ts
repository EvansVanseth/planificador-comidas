import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PostgresIngredientRepository } from '../postgres-ingredient.repository';
import { Ingredient } from '@/domain/ingredients/aggregates/ingredient.aggregate';
import { testPrisma, cleanDb, connectTestDb, disconnectTestDb, seedTestUser, TEST_USER_ID } from './postgres-test-helper';

describe('PostgresIngredientRepository (integration)', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';
  const validUserId = TEST_USER_ID;

  let repo: PostgresIngredientRepository;

  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await cleanDb();
    await seedTestUser();
    repo = new PostgresIngredientRepository(testPrisma);
  });

  it('debe guardar y recuperar un ingrediente por id', async () => {
    const ingredient = Ingredient.create(validId, validUserId, 'Tomate');
    await repo.save(ingredient);
    const found = await repo.findById(validId);
    expect(found).not.toBeNull();
    expect(found!.getId()).toBe(validId);
    expect(found!.getName()).toBe('Tomate');
  });

  it('debe devolver null si no existe el ingrediente', async () => {
    const found = await repo.findById(validId);
    expect(found).toBeNull();
  });

  it('debe listar todos los ingredientes', async () => {
    const ing1 = Ingredient.create(validId, validUserId, 'Tomate');
    const ing2 = Ingredient.create('550e8400-e29b-41d4-a716-446655440002', validUserId, 'Cebolla');
    await repo.save(ing1);
    await repo.save(ing2);
    expect(await repo.findAll()).toHaveLength(2);
  });

  it('debe devolver lista vacía si no hay ingredientes', async () => {
    expect(await repo.findAll()).toHaveLength(0);
  });

  it('debe eliminar un ingrediente por id', async () => {
    const ingredient = Ingredient.create(validId, validUserId, 'Ajo');
    await repo.save(ingredient);
    await repo.delete(validId);
    expect(await repo.findById(validId)).toBeNull();
  });

  it('debe actualizar un ingrediente existente', async () => {
    const ingredient = Ingredient.create(validId, validUserId, 'Tomate');
    await repo.save(ingredient);
    ingredient.rename('Tomate Raf');
    await repo.save(ingredient);
    const found = await repo.findById(validId);
    expect(found!.getName()).toBe('Tomate Raf');
  });

  it('debe buscar por nombre ignorando mayúsculas', async () => {
    await repo.save(Ingredient.create(validId, validUserId, 'Pollo'));
    const found = await repo.findByName('pollo');
    expect(found).not.toBeNull();
    expect(found!.getId()).toBe(validId);
  });

  it('debe devolver null si no existe el nombre', async () => {
    const found = await repo.findByName('Inexistente');
    expect(found).toBeNull();
  });

  it('debe filtrar por userId', async () => {
    await repo.save(Ingredient.create(validId, validUserId, 'Suyo'));
    const otherUserId = '550e8400-e29b-41d4-a716-446655449999';
    await testPrisma.user.create({
      data: { id: otherUserId, name: 'Other', email: 'other@example.com' },
    });
    await repo.save(Ingredient.create('550e8400-e29b-41d4-a716-446655440002', otherUserId, 'Pollo'));
    const userIngredients = await repo.findAllByUserId(validUserId);
    expect(userIngredients).toHaveLength(1);
    expect(userIngredients[0]!.getId()).toBe(validId);
  });
});
