import { describe, it, expect, beforeEach } from 'vitest';
import { GetShoppingListUseCase } from './get-shopping-list.use-case';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { InMemoryRecipeRepository } from '../../infrastructure/repositories/in-memory-recipe.repository';
import { InMemoryIngredientRepository } from '../../infrastructure/repositories/in-memory-ingredient.repository';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { Recipe } from '@/domain/recipes/aggregates/recipe.aggregate';
import { Ingredient } from '@/domain/ingredients/aggregates/ingredient.aggregate';
import { RecipeIngredient } from '@/domain/recipes/value-objects/recipe-ingredient.vo';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../shared/errors/app-error';
import { randomUUID } from 'crypto';

describe('GetShoppingListUseCase', () => {
  const planningId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';
  const recipeId = '550e8400-e29b-41d4-a716-446655440010';
  const ingId1 = '550e8400-e29b-41d4-a716-446655440020';
  const breakfastTagId = '550e8400-e29b-41d4-a716-446655440030';

  let useCase: GetShoppingListUseCase;
  let planningRepo: InMemoryPlanningRepository;
  let recipeRepo: InMemoryRecipeRepository;
  let ingredientRepo: InMemoryIngredientRepository;

  beforeEach(() => {
    planningRepo = new InMemoryPlanningRepository();
    recipeRepo = new InMemoryRecipeRepository();
    ingredientRepo = new InMemoryIngredientRepository();
    useCase = new GetShoppingListUseCase(planningRepo, recipeRepo, ingredientRepo);
  });

  const defaultTags = () => [
    { id: randomUUID(), dimension: TagDimension.MOMENTO_DIA },
    { id: randomUUID(), dimension: TagDimension.FORMATO },
    { id: randomUUID(), dimension: TagDimension.TIPO_PLATO },
  ];

  it('debe calcular neededAfterPantry restando pantryCovers', () => {
    ingredientRepo.save(Ingredient.create(ingId1, userId, 'Tomate'));
    recipeRepo.save(Recipe.create(recipeId, userId, 'Salsa', 2, 10, null, [
      RecipeIngredient.create(ingId1),
    ], defaultTags()));

    const planning = Planning.create(planningId, userId, 'Mi plan', null, 1);
    planning.addDay(randomUUID(), 1);
    planning.assignMealToDay(1, breakfastTagId, 10, recipeId);
    planning.addPantryItem(randomUUID(), ingId1);
    planning.updatePantryItemCovers(ingId1, 4);
    planningRepo.save(planning);

    const result = useCase.execute(planningId);
    expect(result).toHaveLength(1);
    expect(result[0].totalCovers).toBe(10);
    expect(result[0].pantryCovers).toBe(4);
    expect(result[0].pantryAvailable).toBe(false);
    expect(result[0].neededAfterPantry).toBe(6);
  });

  it('debe dar 0 si pantryAvailable es true', () => {
    ingredientRepo.save(Ingredient.create(ingId1, userId, 'Tomate'));
    recipeRepo.save(Recipe.create(recipeId, userId, 'Salsa', 2, 10, null, [
      RecipeIngredient.create(ingId1),
    ], defaultTags()));

    const planning = Planning.create(planningId, userId, 'Mi plan', null, 1);
    planning.addDay(randomUUID(), 1);
    planning.assignMealToDay(1, breakfastTagId, 10, recipeId);
    planning.addPantryItem(randomUUID(), ingId1);
    planning.markPantryItemAsAvailable(ingId1);
    planningRepo.save(planning);

    const result = useCase.execute(planningId);
    expect(result[0].pantryAvailable).toBe(true);
    expect(result[0].neededAfterPantry).toBe(0);
  });

  it('debe dar neededAfterPantry = totalCovers si no hay pantry', () => {
    ingredientRepo.save(Ingredient.create(ingId1, userId, 'Tomate'));
    recipeRepo.save(Recipe.create(recipeId, userId, 'Salsa', 2, 10, null, [
      RecipeIngredient.create(ingId1),
    ], defaultTags()));

    const planning = Planning.create(planningId, userId, 'Mi plan', null, 1);
    planning.addDay(randomUUID(), 1);
    planning.assignMealToDay(1, breakfastTagId, 5, recipeId);
    planningRepo.save(planning);

    const result = useCase.execute(planningId);
    expect(result[0].neededAfterPantry).toBe(5);
  });

  it('debe fallar si el planning no existe', () => {
    expect(() => useCase.execute(planningId)).toThrow(AppError);
  });
});
