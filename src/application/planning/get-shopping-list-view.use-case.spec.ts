import { describe, it, expect, beforeEach } from 'vitest';
import { GetShoppingListViewUseCase } from './get-shopping-list-view.use-case';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { InMemoryRecipeRepository } from '../../infrastructure/repositories/in-memory-recipe.repository';
import { InMemoryIngredientRepository } from '../../infrastructure/repositories/in-memory-ingredient.repository';
import { InMemoryPlanningFlatReadRepository } from '../../infrastructure/repositories/read-models/in-memory-planning-flat-read.repository';
import { InMemoryRecipeFlatReadRepository } from '../../infrastructure/repositories/read-models/in-memory-recipe-flat-read.repository';
import { InMemoryIngredientFlatReadRepository } from '../../infrastructure/repositories/read-models/in-memory-ingredient-flat-read.repository';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { Recipe } from '@/domain/recipes/aggregates/recipe.aggregate';
import { Ingredient } from '@/domain/ingredients/aggregates/ingredient.aggregate';
import { RecipeIngredient } from '@/domain/recipes/value-objects/recipe-ingredient.vo';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../shared/errors/app-error';
import { randomUUID } from 'crypto';

describe('GetShoppingListViewUseCase', () => {
  const planningId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';
  const recipeId = '550e8400-e29b-41d4-a716-446655440010';
  const ingId1 = '550e8400-e29b-41d4-a716-446655440020';
  const breakfastTagId = '550e8400-e29b-41d4-a716-446655440030';

  let useCase: GetShoppingListViewUseCase;
  let planningRepo: InMemoryPlanningRepository;

  beforeEach(() => {
    planningRepo = new InMemoryPlanningRepository();
    useCase = new GetShoppingListViewUseCase(
      new InMemoryPlanningFlatReadRepository(planningRepo),
      new InMemoryRecipeFlatReadRepository(new InMemoryRecipeRepository()),
      new InMemoryIngredientFlatReadRepository(new InMemoryIngredientRepository()),
    );
  });

  const defaultTags = () => [
    { id: randomUUID(), dimension: TagDimension.MOMENTO_DIA },
    { id: randomUUID(), dimension: TagDimension.FORMATO },
    { id: randomUUID(), dimension: TagDimension.TIPO_PLATO },
  ];

  async function seedRecipeAndIngredient(): Promise<void> {
    const ingredientRepo = new InMemoryIngredientRepository();
    await ingredientRepo.save(Ingredient.create(ingId1, userId, 'Tomate'));
    const recipeRepo = new InMemoryRecipeRepository();
    await recipeRepo.save(Recipe.create(recipeId, userId, 'Salsa', 2, 10, null, [
      RecipeIngredient.create(ingId1),
    ], defaultTags()));
    useCase = new GetShoppingListViewUseCase(
      new InMemoryPlanningFlatReadRepository(planningRepo),
      new InMemoryRecipeFlatReadRepository(recipeRepo),
      new InMemoryIngredientFlatReadRepository(ingredientRepo),
    );
  }

  it('debe calcular neededAfterPantry restando pantryCovers', async () => {
    await seedRecipeAndIngredient();

    const planning = Planning.create(planningId, userId, 'Mi plan', null, 1);
    planning.addDay(randomUUID(), 1);
    planning.assignMealToDay(1, breakfastTagId, 10, recipeId);
    planning.addPantryItem(randomUUID(), ingId1);
    planning.updatePantryItemCovers(ingId1, 4);
    await planningRepo.save(planning);

    const result = await useCase.execute(planningId);
    expect(result).toHaveLength(1);
    expect(result[0].totalCovers).toBe(10);
    expect(result[0].pantryCovers).toBe(4);
    expect(result[0].pantryAvailable).toBe(false);
    expect(result[0].neededAfterPantry).toBe(6);
  });

  it('debe dar 0 si pantryAvailable es true', async () => {
    await seedRecipeAndIngredient();

    const planning = Planning.create(planningId, userId, 'Mi plan', null, 1);
    planning.addDay(randomUUID(), 1);
    planning.assignMealToDay(1, breakfastTagId, 10, recipeId);
    planning.addPantryItem(randomUUID(), ingId1);
    planning.markPantryItemAsAvailable(ingId1);
    await planningRepo.save(planning);

    const result = await useCase.execute(planningId);
    expect(result[0].pantryAvailable).toBe(true);
    expect(result[0].neededAfterPantry).toBe(0);
  });

  it('debe dar neededAfterPantry = totalCovers si no hay pantry', async () => {
    await seedRecipeAndIngredient();

    const planning = Planning.create(planningId, userId, 'Mi plan', null, 1);
    planning.addDay(randomUUID(), 1);
    planning.assignMealToDay(1, breakfastTagId, 5, recipeId);
    await planningRepo.save(planning);

    const result = await useCase.execute(planningId);
    expect(result[0].neededAfterPantry).toBe(5);
  });

  it('debe reflejar estado completed de la lista de la compra', async () => {
    await seedRecipeAndIngredient();

    const planning = Planning.create(planningId, userId, 'Mi plan', null, 1);
    planning.addDay(randomUUID(), 1);
    planning.assignMealToDay(1, breakfastTagId, 3, recipeId);
    planning.addShoppingItem(randomUUID(), ingId1);
    planning.markShoppingItemAsCompleted(ingId1);
    await planningRepo.save(planning);

    const result = await useCase.execute(planningId);
    expect(result[0].inShoppingList).toBe(true);
    expect(result[0].shoppingCompleted).toBe(true);
  });

  it('debe fallar si el planning no existe', async () => {
    await expect(useCase.execute(planningId)).rejects.toThrow(AppError);
  });
});
