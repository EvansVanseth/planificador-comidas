import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteIngredientUseCase } from './delete-ingredient.use-case';
import { InMemoryIngredientRepository } from '../../infrastructure/repositories/in-memory-ingredient.repository';
import { InMemoryRecipeRepository } from '../../infrastructure/repositories/in-memory-recipe.repository';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { Ingredient } from '@/domain/ingredients/aggregates/ingredient.aggregate';
import { Recipe, TagPrimitive } from '@/domain/recipes/aggregates/recipe.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { RecipeIngredient } from '@/domain/recipes/value-objects/recipe-ingredient.vo';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { AppError } from '../shared/errors/app-error';

const defaultTags: TagPrimitive[] = [
  { id: '550e8400-e29b-41d4-a716-446655440100', dimension: TagDimension.MOMENTO_DIA },
  { id: '550e8400-e29b-41d4-a716-446655440101', dimension: TagDimension.FORMATO },
  { id: '550e8400-e29b-41d4-a716-446655440102', dimension: TagDimension.TIPO_PLATO },
];

describe('DeleteIngredientUseCase', () => {
  const ingredientId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';

  let useCase: DeleteIngredientUseCase;
  let ingredientRepo: InMemoryIngredientRepository;
  let recipeRepo: InMemoryRecipeRepository;
  let planningRepo: InMemoryPlanningRepository;

  beforeEach(() => {
    ingredientRepo = new InMemoryIngredientRepository();
    recipeRepo = new InMemoryRecipeRepository();
    planningRepo = new InMemoryPlanningRepository();
    useCase = new DeleteIngredientUseCase(ingredientRepo, recipeRepo, planningRepo);
    ingredientRepo.save(Ingredient.create(ingredientId, userId, 'Test'));
  });

  it('debe eliminar un ingrediente existente', () => {
    const result = useCase.execute(ingredientId);

    expect(ingredientRepo.findById(ingredientId)).toBeNull();
    expect(result.recipesAffected).toBe(0);
    expect(result.planningsAffected).toBe(0);
  });

  it('debe lanzar error si el ingrediente no existe', () => {
    expect(() => useCase.execute('550e8400-e29b-41d4-a716-446655440099')).toThrow(AppError);
  });

  it('debe eliminar el ingrediente de las recetas que lo usan', () => {
    const recipeId = '550e8400-e29b-41d4-a716-446655440010';
    const recipe = Recipe.create(recipeId, userId, 'Receta', 4, 30, null, [
      RecipeIngredient.create(ingredientId, 'al gusto'),
    ], defaultTags);
    recipeRepo.save(recipe);

    const result = useCase.execute(ingredientId);

    expect(result.recipesAffected).toBe(1);
    const saved = recipeRepo.findById(recipeId)!;
    expect(saved.getIngredients()).toHaveLength(0);
    expect(ingredientRepo.findById(ingredientId)).toBeNull();
  });

  it('debe eliminar el ingrediente de la despensa y lista de la compra', () => {
    const planningId = '550e8400-e29b-41d4-a716-446655440010';
    const planning = Planning.create(planningId, userId, 'Semana', null, 1);
    planning.addPantryItem('550e8400-e29b-41d4-a716-446655440099', ingredientId);
    planning.addShoppingItem('550e8400-e29b-41d4-a716-446655440098', ingredientId);
    planningRepo.save(planning);

    const result = useCase.execute(ingredientId);

    expect(result.planningsAffected).toBe(1);
    const updated = planningRepo.findById(planningId)!;
    expect(updated.getPantryItems()).toHaveLength(0);
    expect(updated.getShoppingItems()).toHaveLength(0);
    expect(ingredientRepo.findById(ingredientId)).toBeNull();
  });
});
