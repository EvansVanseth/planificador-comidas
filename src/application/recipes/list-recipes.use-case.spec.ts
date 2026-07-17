import { describe, it, expect, beforeEach } from 'vitest';
import { ListRecipesUseCase } from './list-recipes.use-case';
import { InMemoryRecipeRepository } from '../../infrastructure/repositories/in-memory-recipe.repository';
import { Recipe } from '@/domain/recipes/aggregates/recipe.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';

describe('ListRecipesUseCase', () => {
  const userId = '550e8400-e29b-41d4-a716-446655440001';
  const otherUserId = '550e8400-e29b-41d4-a716-446655440099';
  const defaultTags = [
    { id: '550e8400-e29b-41d4-a716-446655440010', dimension: TagDimension.MOMENTO_DIA },
    { id: '550e8400-e29b-41d4-a716-446655440011', dimension: TagDimension.FORMATO },
    { id: '550e8400-e29b-41d4-a716-446655440012', dimension: TagDimension.TIPO_PLATO },
  ];

  let useCase: ListRecipesUseCase;
  let repo: InMemoryRecipeRepository;

  beforeEach(() => {
    repo = new InMemoryRecipeRepository();
    useCase = new ListRecipesUseCase(repo);
  });

  it('debe devolver lista vacía si no hay recetas', async () => {
    expect(await useCase.execute(userId)).toEqual([]);
  });

  it('debe devolver solo las recetas del usuario', async () => {
    const r1 = Recipe.create('550e8400-e29b-41d4-a716-446655440001', userId, 'Receta Uno', 2, 10, null, [], defaultTags);
    await repo.save(r1);
    const result = await useCase.execute(userId);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(r1.toPrimitives());
  });

  it('no debe devolver recetas de otro usuario', async () => {
    const r1 = Recipe.create('550e8400-e29b-41d4-a716-446655440001', otherUserId, 'Receta Otro', 2, 10, null, [], defaultTags);
    await repo.save(r1);
    const result = await useCase.execute(userId);
    expect(result).toHaveLength(0);
  });
});
