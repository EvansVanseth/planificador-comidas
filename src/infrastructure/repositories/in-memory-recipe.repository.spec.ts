import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryRecipeRepository } from './in-memory-recipe.repository';
import { Recipe } from '@/domain/recipes/aggregates/recipe.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';

describe('InMemoryRecipeRepository', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';
  const validUserId = '550e8400-e29b-41d4-a716-446655440001';
  const defaultTags = [
    { id: '550e8400-e29b-41d4-a716-446655440010', dimension: TagDimension.MOMENTO_DIA },
    { id: '550e8400-e29b-41d4-a716-446655440011', dimension: TagDimension.FORMATO },
    { id: '550e8400-e29b-41d4-a716-446655440012', dimension: TagDimension.TIPO_PLATO },
  ];

  let repo: InMemoryRecipeRepository;

  beforeEach(() => {
    repo = new InMemoryRecipeRepository();
  });

  it('debe guardar y recuperar una receta por id', async () => {
    const recipe = Recipe.create(validId, validUserId, 'Arroz con Pollo', 4, 30, null, [], defaultTags);
    await repo.save(recipe);
    const found = await repo.findById(validId);
    expect(found).not.toBeNull();
    expect(found!.getId()).toBe(validId);
  });

  it('debe devolver null si no existe', async () => {
    expect(await repo.findById(validId)).toBeNull();
  });

  it('debe listar todas las recetas', async () => {
    await repo.save(Recipe.create(validId, validUserId, 'Receta 1', 2, 10, null, [], defaultTags));
    const id2 = '550e8400-e29b-41d4-a716-446655440002';
    await repo.save(Recipe.create(id2, validUserId, 'Receta 2', 4, 20, null, [], defaultTags));
    expect(await repo.findAll()).toHaveLength(2);
  });

  it('debe devolver lista vacía si no hay recetas', async () => {
    expect(await repo.findAll()).toHaveLength(0);
  });

  it('debe eliminar una receta por id', async () => {
    await repo.save(Recipe.create(validId, validUserId, 'Test', 2, 10, null, [], defaultTags));
    await repo.delete(validId);
    expect(await repo.findById(validId)).toBeNull();
  });
});
