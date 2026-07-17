import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteUserUseCase } from './delete-user.use-case';
import { InMemoryUserRepository } from '../../infrastructure/repositories/in-memory-user.repository';
import { InMemoryTagRepository } from '../../infrastructure/repositories/in-memory-tag.repository';
import { InMemoryIngredientRepository } from '../../infrastructure/repositories/in-memory-ingredient.repository';
import { InMemoryRecipeRepository } from '../../infrastructure/repositories/in-memory-recipe.repository';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { User } from '@/domain/users/aggregates/user.aggregate';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { Ingredient } from '@/domain/ingredients/aggregates/ingredient.aggregate';
import { Recipe, TagPrimitive } from '@/domain/recipes/aggregates/recipe.aggregate';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { AppError } from '../shared/errors/app-error';

const defaultTags: TagPrimitive[] = [
  { id: '00000000-0000-4000-a000-000000000100', dimension: TagDimension.MOMENTO_DIA },
  { id: '00000000-0000-4000-a000-000000000101', dimension: TagDimension.FORMATO },
  { id: '00000000-0000-4000-a000-000000000102', dimension: TagDimension.TIPO_PLATO },
];

describe('DeleteUserUseCase', () => {
  const userId = '550e8400-e29b-41d4-a716-446655440001';
  const otherUserId = '550e8400-e29b-41d4-a716-446655440002';

  let useCase: DeleteUserUseCase;
  let userRepo: InMemoryUserRepository;
  let tagRepo: InMemoryTagRepository;
  let ingredientRepo: InMemoryIngredientRepository;
  let recipeRepo: InMemoryRecipeRepository;
  let planningRepo: InMemoryPlanningRepository;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    tagRepo = new InMemoryTagRepository();
    ingredientRepo = new InMemoryIngredientRepository();
    recipeRepo = new InMemoryRecipeRepository();
    planningRepo = new InMemoryPlanningRepository();
    useCase = new DeleteUserUseCase(userRepo, tagRepo, ingredientRepo, recipeRepo, planningRepo);
  });

  it('debe eliminar un usuario existente', async () => {
    await userRepo.save(User.create(userId, 'Alice', 'alice@test.com'));

    const result = await useCase.execute(userId);

    expect(await userRepo.findById(userId)).toBeNull();
    expect(result.tagsDeleted).toBe(0);
  });

  it('debe lanzar error si el usuario no existe', async () => {
    await expect(useCase.execute('550e8400-e29b-41d4-a716-446655449999')).rejects.toThrow(AppError);
  });

  it('debe eliminar todos los datos del usuario', async () => {
    await userRepo.save(User.create(userId, 'Alice', 'alice@test.com'));

    await tagRepo.save(Tag.create('00000000-0000-4000-a000-000000000001', userId, 'Vegano', TagDimension.ESTILOS_VIDA, false));
    await tagRepo.save(Tag.create('00000000-0000-4000-a000-000000000002', userId, 'Celiaco', TagDimension.ESTILOS_VIDA, false));
    await tagRepo.save(Tag.create('00000000-0000-4000-a000-000000000009', otherUserId, 'Otro', TagDimension.ESTILOS_VIDA, false));

    await ingredientRepo.save(Ingredient.create('00000000-0000-4000-a000-000000000010', userId, 'Arroz'));
    await ingredientRepo.save(Ingredient.create('00000000-0000-4000-a000-000000000011', userId, 'Pollo'));
    await ingredientRepo.save(Ingredient.create('00000000-0000-4000-a000-000000000019', otherUserId, 'Aceite'));

    await recipeRepo.save(Recipe.create('00000000-0000-4000-a000-000000000020', userId, 'Arroz', 4, 30, null, [], defaultTags));
    await recipeRepo.save(Recipe.create('00000000-0000-4000-a000-000000000021', userId, 'Pollo', 4, 30, null, [], defaultTags));
    await recipeRepo.save(Recipe.create('00000000-0000-4000-a000-000000000029', otherUserId, 'Otro', 4, 30, null, [], defaultTags));

    await planningRepo.save(Planning.create('00000000-0000-4000-a000-000000000030', userId, 'Semana', null, 2));
    await planningRepo.save(Planning.create('00000000-0000-4000-a000-000000000039', otherUserId, 'Otra', null, 2));

    const result = await useCase.execute(userId);

    expect(result.tagsDeleted).toBe(2);
    expect(result.ingredientsDeleted).toBe(2);
    expect(result.recipesDeleted).toBe(2);
    expect(result.planningsDeleted).toBe(1);

    expect(await tagRepo.findById('00000000-0000-4000-a000-000000000009')).not.toBeNull();
    expect(await ingredientRepo.findById('00000000-0000-4000-a000-000000000019')).not.toBeNull();
    expect(await recipeRepo.findById('00000000-0000-4000-a000-000000000029')).not.toBeNull();
    expect(await planningRepo.findById('00000000-0000-4000-a000-000000000039')).not.toBeNull();

    expect(await userRepo.findById(userId)).toBeNull();
  });
});
