import { describe, it, expect, beforeEach } from 'vitest';
import { GetNeededIngredientsUseCase } from './get-needed-ingredients.use-case';
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

describe('GetNeededIngredientsUseCase', () => {
  const planningId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';
  const recipeId = '550e8400-e29b-41d4-a716-446655440010';
  const ingId1 = '550e8400-e29b-41d4-a716-446655440020';
  const ingId2 = '550e8400-e29b-41d4-a716-446655440021';
  const breakfastTagId = '550e8400-e29b-41d4-a716-446655440030';
  const lunchTagId = '550e8400-e29b-41d4-a716-446655440031';

  let useCase: GetNeededIngredientsUseCase;
  let planningRepo: InMemoryPlanningRepository;
  let recipeRepo: InMemoryRecipeRepository;
  let ingredientRepo: InMemoryIngredientRepository;

  beforeEach(() => {
    planningRepo = new InMemoryPlanningRepository();
    recipeRepo = new InMemoryRecipeRepository();
    ingredientRepo = new InMemoryIngredientRepository();
    useCase = new GetNeededIngredientsUseCase(planningRepo, recipeRepo, ingredientRepo);
  });

  const defaultTags = () => [
    { id: randomUUID(), dimension: TagDimension.MOMENTO_DIA },
    { id: randomUUID(), dimension: TagDimension.FORMATO },
    { id: randomUUID(), dimension: TagDimension.TIPO_PLATO },
  ];

  it('debe sumar covers de un ingrediente usado en una receta', () => {
    ingredientRepo.save(Ingredient.create(ingId1, userId, 'Tomate'));
    recipeRepo.save(Recipe.create(recipeId, userId, 'Salsa', 2, 10, null, [
      RecipeIngredient.create(ingId1, '2 unidades'),
    ], defaultTags()));

    const planning = Planning.create(planningId, userId, 'Mi plan', null, 1);
    planning.addDay(randomUUID(), 1);
    planning.assignMealToDay(1, breakfastTagId, 4, recipeId);
    planningRepo.save(planning);

    const result = useCase.execute(planningId);
    expect(result).toHaveLength(1);
    expect(result[0].totalCovers).toBe(4);
    expect(result[0].ingredientName).toBe('Tomate');
    expect(result[0].quantityNote).toBe('2 unidades');
    expect(result[0].recipeNames).toEqual(['Salsa']);
  });

  it('debe acumular covers de un ingrediente usado en varias recetas', () => {
    ingredientRepo.save(Ingredient.create(ingId1, userId, 'Tomate'));

    recipeRepo.save(Recipe.create(recipeId, userId, 'Salsa', 2, 10, null, [
      RecipeIngredient.create(ingId1, '2 unidades'),
    ], defaultTags()));

    const recipe2Id = '550e8400-e29b-41d4-a716-446655440011';
    recipeRepo.save(Recipe.create(recipe2Id, userId, 'Ensalada', 1, 5, null, [
      RecipeIngredient.create(ingId1),
    ], defaultTags()));

    const planning = Planning.create(planningId, userId, 'Mi plan', null, 1);
    planning.addDay(randomUUID(), 1);
    planning.assignMealToDay(1, breakfastTagId, 4, recipeId);
    planning.addDay(randomUUID(), 2);
    planning.assignMealToDay(2, lunchTagId, 2, recipe2Id);
    planningRepo.save(planning);

    const result = useCase.execute(planningId);
    expect(result).toHaveLength(1);
    expect(result[0].totalCovers).toBe(6);
    expect(result[0].recipeNames).toContain('Salsa');
    expect(result[0].recipeNames).toContain('Ensalada');
  });

  it('debe ordenar por nombre de ingrediente', () => {
    ingredientRepo.save(Ingredient.create(ingId2, userId, 'Cebolla'));
    ingredientRepo.save(Ingredient.create(ingId1, userId, 'Tomate'));

    recipeRepo.save(Recipe.create(recipeId, userId, 'Salsa', 2, 10, null, [
      RecipeIngredient.create(ingId1),
      RecipeIngredient.create(ingId2),
    ], defaultTags()));

    const planning = Planning.create(planningId, userId, 'Mi plan', null, 1);
    planning.addDay(randomUUID(), 1);
    planning.assignMealToDay(1, breakfastTagId, 2, recipeId);
    planningRepo.save(planning);

    const result = useCase.execute(planningId);
    expect(result.map(i => i.ingredientName)).toEqual(['Cebolla', 'Tomate']);
  });

  it('debe fallar si el planning no existe', () => {
    expect(() => useCase.execute(planningId)).toThrow(AppError);
  });

  it('debe devolver lista vacia si no hay recetas', () => {
    const planning = Planning.create(planningId, userId, 'Mi plan', null, 1);
    planning.addDay(randomUUID(), 1);
    planningRepo.save(planning);
    expect(useCase.execute(planningId)).toHaveLength(0);
  });
});
