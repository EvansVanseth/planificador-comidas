import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PostgresRecipeRepository } from '../postgres-recipe.repository';
import { PostgresIngredientRepository } from '../postgres-ingredient.repository';
import { PostgresTagRepository } from '../postgres-tag.repository';
import { Recipe } from '@/domain/recipes/aggregates/recipe.aggregate';
import { RecipeIngredient } from '@/domain/recipes/value-objects/recipe-ingredient.vo';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { Ingredient } from '@/domain/ingredients/aggregates/ingredient.aggregate';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { testPrisma, cleanDb, connectTestDb, disconnectTestDb, seedTestUser, TEST_USER_ID } from './postgres-test-helper';

describe('PostgresRecipeRepository (integration)', () => {
  const userId = TEST_USER_ID;
  const recipeId = '550e8400-e29b-41d4-a716-446655440010';
  const ingredientId = '550e8400-e29b-41d4-a716-446655440020';
  const tagMomentoId = '550e8400-e29b-41d4-a716-446655440030';
  const tagFormatoId = '550e8400-e29b-41d4-a716-446655440031';
  const tagTipoId = '550e8400-e29b-41d4-a716-446655440032';

  let repo: PostgresRecipeRepository;
  let ingredientRepo: PostgresIngredientRepository;
  let tagRepo: PostgresTagRepository;

  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await cleanDb();
    await seedTestUser();
    repo = new PostgresRecipeRepository(testPrisma);
    ingredientRepo = new PostgresIngredientRepository(testPrisma);
    tagRepo = new PostgresTagRepository(testPrisma);

    await ingredientRepo.save(Ingredient.create(ingredientId, userId, 'Pollo'));
    await tagRepo.save(Tag.create(tagMomentoId, userId, 'Desayuno', TagDimension.MOMENTO_DIA, true));
    await tagRepo.save(Tag.create(tagFormatoId, userId, 'Caliente', TagDimension.FORMATO, true));
    await tagRepo.save(Tag.create(tagTipoId, userId, 'Carnes', TagDimension.TIPO_PLATO, true));
  });

  const defaultTags = () => [
    { id: tagMomentoId, dimension: TagDimension.MOMENTO_DIA },
    { id: tagFormatoId, dimension: TagDimension.FORMATO },
    { id: tagTipoId, dimension: TagDimension.TIPO_PLATO },
  ];

  it('debe guardar y recuperar una receta por id', async () => {
    const recipe = Recipe.create(recipeId, userId, 'Pollo al horno', 4, 45, null, [], defaultTags());
    await repo.save(recipe);
    const found = await repo.findById(recipeId);
    expect(found).not.toBeNull();
    expect(found!.getId()).toBe(recipeId);
    expect(found!.getName()).toBe('Pollo al horno');
  });

  it('debe devolver null si no existe la receta', async () => {
    const found = await repo.findById(recipeId);
    expect(found).toBeNull();
  });

  it('debe listar todas las recetas', async () => {
    await repo.save(Recipe.create(recipeId, userId, 'Receta 1', 2, 10, null, [], defaultTags()));
    const id2 = '550e8400-e29b-41d4-a716-446655440002';
    await repo.save(Recipe.create(id2, userId, 'Receta 2', 4, 20, null, [], defaultTags()));
    expect(await repo.findAll()).toHaveLength(2);
  });

  it('debe devolver lista vacía si no hay recetas', async () => {
    expect(await repo.findAll()).toHaveLength(0);
  });

  it('debe eliminar una receta por id', async () => {
    await repo.save(Recipe.create(recipeId, userId, 'Test', 2, 10, null, [], defaultTags()));
    await repo.delete(recipeId);
    expect(await repo.findById(recipeId)).toBeNull();
  });

  it('debe actualizar una receta existente', async () => {
    const recipe = Recipe.create(recipeId, userId, 'Original', 2, 10, null, [], defaultTags());
    await repo.save(recipe);
    recipe.rename('Actualizado');
    await repo.save(recipe);
    const found = await repo.findById(recipeId);
    expect(found!.getName()).toBe('Actualizado');
  });

  it('debe guardar y recuperar ingredientes de receta', async () => {
    const recipe = Recipe.create(recipeId, userId, 'Pollo al horno', 4, 45, null,
      [RecipeIngredient.create(ingredientId, '2 unidades')],
      defaultTags(),
    );
    await repo.save(recipe);
    const found = await repo.findById(recipeId);
    const ingredients = found!.getIngredients();
    expect(ingredients).toHaveLength(1);
    expect(ingredients[0].ingredientId).toBe(ingredientId);
    expect(ingredients[0].quantityNote).toBe('2 unidades');
  });

  it('debe guardar y recuperar tags de receta', async () => {
    const recipe = Recipe.create(recipeId, userId, 'Pollo al horno', 4, 45, null, [], defaultTags());
    await repo.save(recipe);
    const found = await repo.findById(recipeId);
    const tagIds = found!.getTagIds();
    expect(tagIds).toHaveLength(3);
    expect(tagIds).toContain(tagMomentoId);
    expect(tagIds).toContain(tagFormatoId);
    expect(tagIds).toContain(tagTipoId);
  });

  it('debe filtrar por userId', async () => {
    await repo.save(Recipe.create(recipeId, userId, 'Mi receta', 2, 10, null, [], defaultTags()));
    const otherUserId = '550e8400-e29b-41d4-a716-446655449999';
    await testPrisma.user.create({
      data: { id: otherUserId, name: 'Other', email: 'other@example.com' },
    });
    await repo.save(Recipe.create('550e8400-e29b-41d4-a716-446655440002', otherUserId, 'Otra', 2, 10, null, [], defaultTags()));
    const userRecipes = await repo.findAllByUserId(userId);
    expect(userRecipes).toHaveLength(1);
    expect(userRecipes[0]!.getId()).toBe(recipeId);
  });

  it('debe buscar por nombre ignorando mayúsculas', async () => {
    await repo.save(Recipe.create(recipeId, userId, 'Pollo al Horno', 2, 10, null, [], defaultTags()));
    const found = await repo.findByName('pollo al horno');
    expect(found).not.toBeNull();
    expect(found!.getId()).toBe(recipeId);
  });
});
