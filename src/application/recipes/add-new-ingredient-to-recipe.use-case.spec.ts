import { describe, it, expect, beforeEach } from 'vitest';
import { AddNewIngredientToRecipeUseCase } from './add-new-ingredient-to-recipe.use-case';
import { InMemoryRecipeRepository } from '../../infrastructure/repositories/in-memory-recipe.repository';
import { InMemoryIngredientRepository } from '../../infrastructure/repositories/in-memory-ingredient.repository';
import { Recipe } from '@/domain/recipes/aggregates/recipe.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../shared/errors/app-error';

describe('AddNewIngredientToRecipeUseCase', () => {
  const recipeId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';
  const defaultTags = [
    { id: '550e8400-e29b-41d4-a716-446655440010', dimension: TagDimension.MOMENTO_DIA },
    { id: '550e8400-e29b-41d4-a716-446655440011', dimension: TagDimension.FORMATO },
    { id: '550e8400-e29b-41d4-a716-446655440012', dimension: TagDimension.TIPO_PLATO },
  ];

  let useCase: AddNewIngredientToRecipeUseCase;
  let recipeRepo: InMemoryRecipeRepository;
  let ingredientRepo: InMemoryIngredientRepository;

  beforeEach(() => {
    recipeRepo = new InMemoryRecipeRepository();
    ingredientRepo = new InMemoryIngredientRepository();
    useCase = new AddNewIngredientToRecipeUseCase(recipeRepo, ingredientRepo);
  });

  it('debe crear un ingrediente y añadirlo a la receta', () => {
    const recipe = Recipe.create(recipeId, userId, 'Pasta', 2, 20, null, [], defaultTags);
    recipeRepo.save(recipe);

    const ingredientId = useCase.execute(userId, recipeId, 'Tomate', '2 unidades');

    const savedIngredient = ingredientRepo.findById(ingredientId);
    expect(savedIngredient).not.toBeNull();
    expect(savedIngredient!.getName()).toBe('Tomate');

    const savedRecipe = recipeRepo.findById(recipeId)!;
    const ingredients = savedRecipe.getIngredients();
    expect(ingredients).toHaveLength(1);
    expect(ingredients[0].ingredientId).toBe(ingredientId);
    expect(ingredients[0].quantityNote).toBe('2 unidades');
  });

  it('debe crear un ingrediente sin quantityNote', () => {
    const recipe = Recipe.create(recipeId, userId, 'Pasta', 2, 20, null, [], defaultTags);
    recipeRepo.save(recipe);

    const ingredientId = useCase.execute(userId, recipeId, 'Sal');

    const savedRecipe = recipeRepo.findById(recipeId)!;
    expect(savedRecipe.getIngredients()[0].quantityNote).toBeNull();
  });

  it('debe lanzar error si la receta no existe', () => {
    expect(() => useCase.execute(userId, recipeId, 'Tomate')).toThrow(AppError);
  });
});
