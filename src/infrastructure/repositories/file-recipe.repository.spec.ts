import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { FileRecipeRepository } from './file-recipe.repository';
import { Recipe } from '@/domain/recipes/aggregates/recipe.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';

describe('FileRecipeRepository', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';
  const otherUserId = '550e8400-e29b-41d4-a716-446655440099';
  const defaultTags = [
    { id: '550e8400-e29b-41d4-a716-446655440010', dimension: TagDimension.MOMENTO_DIA },
    { id: '550e8400-e29b-41d4-a716-446655440011', dimension: TagDimension.FORMATO },
    { id: '550e8400-e29b-41d4-a716-446655440012', dimension: TagDimension.TIPO_PLATO },
  ];
  const testDir = path.resolve(process.cwd(), 'file-persistence', '__test__');
  const testFile = path.join(testDir, 'test-recipes.json');

  let repo: FileRecipeRepository;

  beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    repo = new FileRecipeRepository(testFile);
  });

  afterEach(() => {
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
  });

  it('debe guardar y recuperar una receta por id', () => {
    const recipe = Recipe.create(validId, userId, 'Pasta', 2, 20, null, [], defaultTags);
    repo.save(recipe);
    const found = repo.findById(validId);
    expect(found).not.toBeNull();
    expect(found!.getId()).toBe(validId);
  });

  it('debe devolver null si no existe la receta', () => {
    const found = repo.findById(validId);
    expect(found).toBeNull();
  });

  it('debe listar todas las recetas', () => {
    const r1 = Recipe.create(validId, userId, 'Pasta', 2, 20, null, [], defaultTags);
    const r2 = Recipe.create('550e8400-e29b-41d4-a716-446655440002', userId, 'Ensalada', 1, 10, null, [], defaultTags);
    repo.save(r1);
    repo.save(r2);
    expect(repo.findAll()).toHaveLength(2);
  });

  it('debe devolver lista vacía si no hay recetas', () => {
    expect(repo.findAll()).toHaveLength(0);
  });

  it('debe eliminar una receta por id', () => {
    const recipe = Recipe.create(validId, userId, 'Pasta', 2, 20, null, [], defaultTags);
    repo.save(recipe);
    repo.delete(validId);
    expect(repo.findById(validId)).toBeNull();
  });

  it('debe actualizar una receta existente al guardar con el mismo id', () => {
    const recipe = Recipe.create(validId, userId, 'Pasta', 2, 20, null, [], defaultTags);
    repo.save(recipe);
    recipe.rename('Pasta carbonara');
    repo.save(recipe);
    const found = repo.findById(validId);
    expect(found!.getName()).toBe('Pasta carbonara');
  });

  it('debe filtrar recetas por userId', () => {
    const r1 = Recipe.create(validId, userId, 'Pasta', 2, 20, null, [], defaultTags);
    const r2 = Recipe.create('550e8400-e29b-41d4-a716-446655440002', otherUserId, 'Ensalada', 1, 10, null, [], defaultTags);
    repo.save(r1);
    repo.save(r2);

    const userRecipes = repo.findAllByUserId(userId);
    expect(userRecipes).toHaveLength(1);
    expect(userRecipes[0].getId()).toBe(validId);
  });

  it('debe preservar ingredientes y tags tras guardar y recuperar', () => {
    const recipe = Recipe.create(validId, userId, 'Pasta', 2, 20, 'Cocinar la pasta', [], defaultTags);
    repo.save(recipe);

    const found = repo.findById(validId)!;
    expect(found.getName()).toBe('Pasta');
    expect(found.getPreparation()).toBe('Cocinar la pasta');
    expect(found.getTagIds().length).toBe(3);
  });
});
