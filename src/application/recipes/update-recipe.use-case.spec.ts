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

  beforeEach(async () => {
    repo = new InMemoryRecipeRepository();
    useCase = new UpdateRecipeUseCase(repo);
    await repo.save(Recipe.create(validId, validUserId, 'Original', 4, 30, null, [], defaultTags));
  });

  it('debe actualizar el nombre', async () => {
    await useCase.execute({ id: validId, name: 'Renombrada' });
    expect((await repo.findById(validId))!.getName()).toBe('Renombrada');
  });

  it('debe actualizar el userId', async () => {
    const newId = '550e8400-e29b-41d4-a716-446655440002';
    await useCase.execute({ id: validId, userId: newId });
    expect((await repo.findById(validId))!.getUserId()).toBe(newId);
  });

  it('debe actualizar baseServings', async () => {
    await useCase.execute({ id: validId, baseServings: 8 });
    expect((await repo.findById(validId))!.getBaseServings()).toBe(8);
  });

  it('debe actualizar prepTime', async () => {
    await useCase.execute({ id: validId, prepTime: 60 });
    expect((await repo.findById(validId))!.getPrepTime()).toBe(60);
  });

  it('debe actualizar preparation', async () => {
    await useCase.execute({ id: validId, preparation: 'Cocinar 30 min' });
    expect((await repo.findById(validId))!.getPreparation()).toBe('Cocinar 30 min');
  });

  it('debe añadir y eliminar tags', async () => {
    const tagMomento2 = '550e8400-e29b-41d4-a716-446655440013';
    await useCase.execute({
      id: validId,
      addTags: [{ id: tagMomento2, dimension: TagDimension.MOMENTO_DIA }],
      removeTags: [tagMomento],
    });
    const recipe = (await repo.findById(validId))!;
    expect(recipe.getTagIds()).toHaveLength(3);
    expect(recipe.getTagIds()).toContain(tagMomento2);
  });

  it('debe lanzar error si la receta no existe', async () => {
    await expect(useCase.execute({ id: '550e8400-e29b-41d4-a716-446655449999', name: 'X' })).rejects.toThrow(AppError);
  });

  it('debe rechazar renombrar a un nombre duplicado', async () => {
    const otherId = '550e8400-e29b-41d4-a716-446655440020';
    await repo.save(Recipe.create(otherId, validUserId, 'Existente', 2, 10, null, [], defaultTags));
    await expect(useCase.execute({ id: validId, name: 'Existente' })).rejects.toThrow(AppError);
  });

  it('debe rechazar renombrar a un nombre duplicado ignorando mayúsculas', async () => {
    const otherId = '550e8400-e29b-41d4-a716-446655440020';
    await repo.save(Recipe.create(otherId, validUserId, 'Existente', 2, 10, null, [], defaultTags));
    await expect(useCase.execute({ id: validId, name: 'existente' })).rejects.toThrow(AppError);
  });

  it('debe permitir mantener el mismo nombre al actualizar', async () => {
    await useCase.execute({ id: validId, name: 'Original' });
    expect((await repo.findById(validId))!.getName()).toBe('Original');
  });
});
