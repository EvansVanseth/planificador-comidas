import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PostgresPlanningRepository } from '../postgres-planning.repository';
import { PostgresTagRepository } from '../postgres-tag.repository';
import { PostgresIngredientRepository } from '../postgres-ingredient.repository';
import { PostgresRecipeRepository } from '../postgres-recipe.repository';
import { PostgresPlanningFlatReadRepository } from '../read-models/postgres-planning-flat-read.repository';
import { PostgresRecipeFlatReadRepository } from '../read-models/postgres-recipe-flat-read.repository';
import { PostgresIngredientFlatReadRepository } from '../read-models/postgres-ingredient-flat-read.repository';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { Ingredient } from '@/domain/ingredients/aggregates/ingredient.aggregate';
import { Recipe } from '@/domain/recipes/aggregates/recipe.aggregate';
import { RecipeIngredient } from '@/domain/recipes/value-objects/recipe-ingredient.vo';
import { testPrisma, cleanDb, connectTestDb, disconnectTestDb, seedTestUser, TEST_USER_ID } from './postgres-test-helper';

describe('Postgres flat read repositories (integration)', () => {
  const userId = TEST_USER_ID;
  const planningId = '550e8400-e29b-41d4-a716-446655440010';
  const momentTagId = '550e8400-e29b-41d4-a716-446655440020';
  const formatoTagId = '550e8400-e29b-41d4-a716-446655440021';
  const tipoTagId = '550e8400-e29b-41d4-a716-446655440022';
  const ingredientId = '550e8400-e29b-41d4-a716-446655440030';
  const recipeId = '550e8400-e29b-41d4-a716-446655440040';
  const dayId = '550e8400-e29b-41d4-a716-446655440050';
  const pantryId = '550e8400-e29b-41d4-a716-446655440060';
  const shoppingId = '550e8400-e29b-41d4-a716-446655440070';

  let planningRepo: PostgresPlanningRepository;
  let planningFlat: PostgresPlanningFlatReadRepository;
  let recipeFlat: PostgresRecipeFlatReadRepository;
  let ingredientFlat: PostgresIngredientFlatReadRepository;

  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await cleanDb();
    await seedTestUser();
    planningRepo = new PostgresPlanningRepository(testPrisma);
    planningFlat = new PostgresPlanningFlatReadRepository(testPrisma);
    recipeFlat = new PostgresRecipeFlatReadRepository(testPrisma);
    ingredientFlat = new PostgresIngredientFlatReadRepository(testPrisma);

    const tagRepo = new PostgresTagRepository(testPrisma);
    await tagRepo.save(Tag.create(momentTagId, userId, 'Desayuno', TagDimension.MOMENTO_DIA, true));
    await tagRepo.save(Tag.create(formatoTagId, userId, 'Caliente', TagDimension.FORMATO, true));
    await tagRepo.save(Tag.create(tipoTagId, userId, 'Carnes', TagDimension.TIPO_PLATO, true));

    const ingredientRepo = new PostgresIngredientRepository(testPrisma);
    await ingredientRepo.save(Ingredient.create(ingredientId, userId, 'Pollo'));

    const recipeRepo = new PostgresRecipeRepository(testPrisma);
    await recipeRepo.save(Recipe.create(recipeId, userId, 'Pollo asado', 4, 45, null, [
      RecipeIngredient.create(ingredientId, '1 kg'),
    ], [
      { id: momentTagId, dimension: TagDimension.MOMENTO_DIA },
      { id: formatoTagId, dimension: TagDimension.FORMATO },
      { id: tipoTagId, dimension: TagDimension.TIPO_PLATO },
    ]));
  });

  it('debe devolver el snapshot plano del planning', async () => {
    const planning = Planning.create(planningId, userId, 'Semana 1', null, 1);
    planning.addDay(dayId, 1);
    planning.assignMealToDay(1, momentTagId, 4, recipeId);
    planning.addPantryItem(pantryId, ingredientId);
    planning.updatePantryItemCovers(ingredientId, 2);
    planning.addShoppingItem(shoppingId, ingredientId);
    await planningRepo.save(planning);

    const snapshot = await planningFlat.getSnapshot(planningId);
    expect(snapshot).not.toBeNull();
    expect(snapshot!.services).toEqual([{ recipeId, covers: 4 }]);
    expect(snapshot!.pantryItems).toEqual([{ ingredientId, available: false, covers: 2 }]);
    expect(snapshot!.shoppingItems).toEqual([{ ingredientId, completed: false }]);
  });

  it('debe devolver null si el planning no existe', async () => {
    expect(await planningFlat.getSnapshot(planningId)).toBeNull();
  });

  it('debe resolver ingredientes de recetas por ids', async () => {
    const result = await recipeFlat.getIngredientsByRecipeIds([recipeId]);
    expect(result).toEqual([
      { recipeId, recipeName: 'Pollo asado', ingredientId, quantityNote: '1 kg' },
    ]);
  });

  it('debe devolver lista vacia si no hay recipe ids', async () => {
    expect(await recipeFlat.getIngredientsByRecipeIds([])).toEqual([]);
  });

  it('debe resolver nombres de ingredientes por ids', async () => {
    const result = await ingredientFlat.findNamesByIds([ingredientId]);
    expect(result).toEqual([{ id: ingredientId, name: 'Pollo' }]);
  });

  it('debe devolver lista vacia si no hay ingredient ids', async () => {
    expect(await ingredientFlat.findNamesByIds([])).toEqual([]);
  });
});
