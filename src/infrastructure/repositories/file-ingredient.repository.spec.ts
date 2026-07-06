import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { FileIngredientRepository } from './file-ingredient.repository';
import { Ingredient } from '@/domain/ingredients/aggregates/ingredient.aggregate';

describe('FileIngredientRepository', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';
  const otherUserId = '550e8400-e29b-41d4-a716-446655440099';
  const testDir = path.resolve(process.cwd(), 'file-persistence', '__test__');
  const testFile = path.join(testDir, 'test-ingredients.json');

  let repo: FileIngredientRepository;

  beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    repo = new FileIngredientRepository(testFile);
  });

  afterEach(() => {
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
  });

  it('debe guardar y recuperar un ingrediente por id', () => {
    const ingredient = Ingredient.create(validId, userId, 'Arroz');
    repo.save(ingredient);
    const found = repo.findById(validId);
    expect(found).not.toBeNull();
    expect(found!.getId()).toBe(validId);
  });

  it('debe devolver null si no existe el ingrediente', () => {
    const found = repo.findById(validId);
    expect(found).toBeNull();
  });

  it('debe listar todos los ingredientes', () => {
    const ing1 = Ingredient.create(validId, userId, 'Arroz');
    const ing2 = Ingredient.create('550e8400-e29b-41d4-a716-446655440002', userId, 'Frijoles');
    repo.save(ing1);
    repo.save(ing2);
    expect(repo.findAll()).toHaveLength(2);
  });

  it('debe devolver lista vacía si no hay ingredientes', () => {
    expect(repo.findAll()).toHaveLength(0);
  });

  it('debe eliminar un ingrediente por id', () => {
    const ingredient = Ingredient.create(validId, userId, 'Arroz');
    repo.save(ingredient);
    repo.delete(validId);
    expect(repo.findById(validId)).toBeNull();
  });

  it('debe actualizar un ingrediente existente al guardar con el mismo id', () => {
    const ingredient = Ingredient.create(validId, userId, 'Arroz');
    repo.save(ingredient);
    ingredient.rename('Arroz integral');
    repo.save(ingredient);
    const found = repo.findById(validId);
    expect(found!.getName()).toBe('Arroz integral');
  });

  it('debe filtrar ingredientes por userId', () => {
    const ing1 = Ingredient.create(validId, userId, 'Arroz');
    const ing2 = Ingredient.create('550e8400-e29b-41d4-a716-446655440002', otherUserId, 'Frijoles');
    repo.save(ing1);
    repo.save(ing2);

    const userIngredients = repo.findAllByUserId(userId);
    expect(userIngredients).toHaveLength(1);
    expect(userIngredients[0].getId()).toBe(validId);
  });
});
