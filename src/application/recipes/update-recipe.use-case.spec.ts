import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateRecipeUseCase } from './update-recipe.use-case';
import { InMemoryRecipeRepository } from '../../infrastructure/repositories/in-memory-recipe.repository';
import { Recipe } from '@/domain/recipes/aggregates/recipe.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../shared/errors/app-error';

describe('UpdateRecipeUseCase', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';
  const validUserId = '550e8400-e29b-41d4-a716-446655440001';
  const tagMomento = '550e8400-e29b-41d4-a716-446655440010';
  const tagFormato = '550e8400-e29b-41d4-a716-446655440011';
  const tagTipo = '550e8400-e29b-41d4-a716-446655440012';
  const defaultTags = [
    { id: tagMomento, dimension: TagDimension.MOMENTO_DIA },
    { id: tagFormato, dimension: TagDimension.FORMATO },
    { id: tagTipo, dimension: TagDimension.TIPO_PLATO },
  ];

  let useCase: UpdateRecipeUseCase;
  let repo: InMemoryRecipeRepository;

  beforeEach(() => {
    repo = new InMemoryRecipeRepository();
    useCase = new UpdateRecipeUseCase(repo);
    repo.save(Recipe.create(validId, validUserId, 'Original', 4, 30, null, [], defaultTags));
  });

  it('debe actualizar el nombre', () => {
    useCase.execute({ id: validId, name: 'Renombrada' });
    expect(repo.findById(validId)!.getName()).toBe('Renombrada');
  });

  it('debe actualizar el userId', () => {
    const newId = '550e8400-e29b-41d4-a716-446655440002';
    useCase.execute({ id: validId, userId: newId });
    expect(repo.findById(validId)!.getUserId()).toBe(newId);
  });

  it('debe actualizar baseServings', () => {
    useCase.execute({ id: validId, baseServings: 8 });
    expect(repo.findById(validId)!.getBaseServings()).toBe(8);
  });

  it('debe actualizar prepTime', () => {
    useCase.execute({ id: validId, prepTime: 60 });
    expect(repo.findById(validId)!.getPrepTime()).toBe(60);
  });

  it('debe actualizar preparation', () => {
    useCase.execute({ id: validId, preparation: 'Cocinar 30 min' });
    expect(repo.findById(validId)!.getPreparation()).toBe('Cocinar 30 min');
  });

  it('debe añadir y eliminar tags', () => {
    const tagMomento2 = '550e8400-e29b-41d4-a716-446655440013';
    useCase.execute({
      id: validId,
      addTags: [{ id: tagMomento2, dimension: TagDimension.MOMENTO_DIA }],
      removeTags: [tagMomento],
    });
    const recipe = repo.findById(validId)!;
    expect(recipe.getTagIds()).toHaveLength(3);
    expect(recipe.getTagIds()).toContain(tagMomento2);
  });

  it('debe lanzar error si la receta no existe', () => {
    expect(() => useCase.execute({ id: '550e8400-e29b-41d4-a716-446655449999', name: 'X' })).toThrow(AppError);
  });
});
