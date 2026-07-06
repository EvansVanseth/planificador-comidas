import { describe, it, expect, beforeEach } from 'vitest';
import { AddNewTagToRecipeUseCase } from './add-new-tag-to-recipe.use-case';
import { InMemoryRecipeRepository } from '../../infrastructure/repositories/in-memory-recipe.repository';
import { InMemoryTagRepository } from '../../infrastructure/repositories/in-memory-tag.repository';
import { Recipe } from '@/domain/recipes/aggregates/recipe.aggregate';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../shared/errors/app-error';

describe('AddNewTagToRecipeUseCase', () => {
  const recipeId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';
  const defaultTags = [
    { id: '550e8400-e29b-41d4-a716-446655440010', dimension: TagDimension.MOMENTO_DIA },
    { id: '550e8400-e29b-41d4-a716-446655440011', dimension: TagDimension.FORMATO },
    { id: '550e8400-e29b-41d4-a716-446655440012', dimension: TagDimension.TIPO_PLATO },
  ];

  let useCase: AddNewTagToRecipeUseCase;
  let recipeRepo: InMemoryRecipeRepository;
  let tagRepo: InMemoryTagRepository;

  beforeEach(() => {
    recipeRepo = new InMemoryRecipeRepository();
    tagRepo = new InMemoryTagRepository();
    useCase = new AddNewTagToRecipeUseCase(recipeRepo, tagRepo);
  });

  it('debe crear una tag y añadirla a la receta', () => {
    const recipe = Recipe.create(recipeId, userId, 'Pasta', 2, 20, null, [], defaultTags);
    recipeRepo.save(recipe);

    const tagId = useCase.execute(userId, recipeId, 'Italiana', TagDimension.TIPO_PLATO);

    const savedTag = tagRepo.findById(tagId);
    expect(savedTag).not.toBeNull();
    expect(savedTag!.getName()).toBe('Italiana');

    const savedRecipe = recipeRepo.findById(recipeId)!;
    expect(savedRecipe.getTagIds()).toContain(tagId);
  });

  it('debe lanzar error si la receta no existe', () => {
    expect(() => useCase.execute(userId, recipeId, 'Italiana', TagDimension.TIPO_PLATO)).toThrow(AppError);
  });

  it('debe lanzar error si ya existe una tag con el mismo nombre y dimensión', () => {
    const recipe = Recipe.create(recipeId, userId, 'Pasta', 2, 20, null, [], defaultTags);
    recipeRepo.save(recipe);

    const existingTagId = '550e8400-e29b-41d4-a716-446655440020';
    tagRepo.save(Tag.create(existingTagId, userId, 'Italiana', TagDimension.TIPO_PLATO, false));

    expect(() => useCase.execute(userId, recipeId, 'Italiana', TagDimension.TIPO_PLATO)).toThrow(AppError);
  });
});
