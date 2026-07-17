import { describe, it, expect, beforeEach } from 'vitest';
import { MergeIngredientsUseCase } from './merge-ingredients.use-case';
import { InMemoryIngredientRepository } from '../../infrastructure/repositories/in-memory-ingredient.repository';
import { InMemoryRecipeRepository } from '../../infrastructure/repositories/in-memory-recipe.repository';
import { Ingredient } from '@/domain/ingredients/aggregates/ingredient.aggregate';
import { Recipe } from '@/domain/recipes/aggregates/recipe.aggregate';
import { RecipeIngredient } from '@/domain/recipes/value-objects/recipe-ingredient.vo';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { TagPrimitive } from '@/domain/recipes/aggregates/recipe.aggregate';
import { AppError } from '../shared/errors/app-error';

const USER_ID = '550e8400-e29b-41d4-a716-446655440001';

function createValidTags(): TagPrimitive[] {
  return [
    { id: '660e8400-e29b-41d4-a716-446655440010', dimension: TagDimension.MOMENTO_DIA },
    { id: '660e8400-e29b-41d4-a716-446655440011', dimension: TagDimension.FORMATO },
    { id: '660e8400-e29b-41d4-a716-446655440012', dimension: TagDimension.TIPO_PLATO },
  ];
}

describe('MergeIngredientsUseCase', () => {
  let useCase: MergeIngredientsUseCase;
  let ingredientRepo: InMemoryIngredientRepository;
  let recipeRepo: InMemoryRecipeRepository;
  let sourceId: string;
  let targetId: string;

  beforeEach(async () => {
    ingredientRepo = new InMemoryIngredientRepository();
    recipeRepo = new InMemoryRecipeRepository();
    useCase = new MergeIngredientsUseCase(ingredientRepo, recipeRepo);

    sourceId = '770e8400-e29b-41d4-a716-446655440001';
    targetId = '770e8400-e29b-41d4-a716-446655440002';

    const source = Ingredient.create(sourceId, USER_ID, 'huevo');
    const target = Ingredient.create(targetId, USER_ID, 'huevos');
    await ingredientRepo.save(source);
    await ingredientRepo.save(target);
  });

  it('debe fusionar ingrediente origen en destino y actualizar recetas', async () => {
    const recipe = Recipe.create(
      '880e8400-e29b-41d4-a716-446655440001',
      USER_ID, 'Tortilla', 4, 15, null,
      [RecipeIngredient.create(sourceId, '3 unidades')],
      createValidTags(),
    );
    await recipeRepo.save(recipe);

    await useCase.execute(USER_ID, sourceId, targetId);

    expect(await ingredientRepo.findById(sourceId)).toBeNull();
    expect(await ingredientRepo.findById(targetId)).not.toBeNull();

    const updated = (await recipeRepo.findById('880e8400-e29b-41d4-a716-446655440001'))!;
    const ingredients = updated.getIngredients();
    expect(ingredients).toHaveLength(1);
    expect(ingredients[0].ingredientId).toBe(targetId);
    expect(ingredients[0].quantityNote).toBe('3 unidades');
  });

  it('debe eliminar origen si la receta ya tiene el destino', async () => {
    const recipe = Recipe.create(
      '880e8400-e29b-41d4-a716-446655440002',
      USER_ID, 'Tortilla doble', 4, 15, null,
      [
        RecipeIngredient.create(sourceId, '2 unidades'),
        RecipeIngredient.create(targetId, '4 unidades'),
      ],
      createValidTags(),
    );
    await recipeRepo.save(recipe);

    await useCase.execute(USER_ID, sourceId, targetId);

    expect(await ingredientRepo.findById(sourceId)).toBeNull();

    const updated = (await recipeRepo.findById('880e8400-e29b-41d4-a716-446655440002'))!;
    const ingredients = updated.getIngredients();
    expect(ingredients).toHaveLength(1);
    expect(ingredients[0].ingredientId).toBe(targetId);
    expect(ingredients[0].quantityNote).toBe('4 unidades');
  });

  it('debe fusionar en múltiples recetas', async () => {
    const recipe1 = Recipe.create(
      '880e8400-e29b-41d4-a716-446655440010',
      USER_ID, 'Tortilla', 4, 15, null,
      [RecipeIngredient.create(sourceId, '3 unidades')],
      createValidTags(),
    );
    const recipe2 = Recipe.create(
      '880e8400-e29b-41d4-a716-446655440011',
      USER_ID, 'Huevos rotos', 2, 10, null,
      [RecipeIngredient.create(sourceId, '2 unidades')],
      createValidTags(),
    );
    await recipeRepo.save(recipe1);
    await recipeRepo.save(recipe2);

    await useCase.execute(USER_ID, sourceId, targetId);

    for (const id of ['880e8400-e29b-41d4-a716-446655440010', '880e8400-e29b-41d4-a716-446655440011']) {
      const updated = (await recipeRepo.findById(id))!;
      const ingredients = updated.getIngredients();
      expect(ingredients).toHaveLength(1);
      expect(ingredients[0].ingredientId).toBe(targetId);
    }
  });

  it('debe rechazar si origen no existe', async () => {
    await expect(useCase.execute(USER_ID, 'inexistente', targetId)).rejects.toThrow(AppError);
  });

  it('debe rechazar si destino no existe', async () => {
    await expect(useCase.execute(USER_ID, sourceId, 'inexistente')).rejects.toThrow(AppError);
  });

  it('debe rechazar si origen y destino son el mismo', async () => {
    await expect(useCase.execute(USER_ID, sourceId, sourceId)).rejects.toThrow(AppError);
  });

  it('debe rechazar si los ingredientes son de distintos usuarios', async () => {
    const otherUserId = '550e8400-e29b-41d4-a716-446655440099';
    const otherSource = Ingredient.create(sourceId, otherUserId, 'otro');
    await ingredientRepo.save(otherSource);

    await expect(useCase.execute(USER_ID, sourceId, targetId)).rejects.toThrow(AppError);
  });

  it('debe funcionar si ninguna receta usa el origen (solo eliminar)', async () => {
    await useCase.execute(USER_ID, sourceId, targetId);

    expect(await ingredientRepo.findById(sourceId)).toBeNull();
    expect(await ingredientRepo.findById(targetId)).not.toBeNull();
  });
});
