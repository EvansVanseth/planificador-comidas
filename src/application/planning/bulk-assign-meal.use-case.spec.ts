import { describe, it, expect, beforeEach } from 'vitest';
import { BulkAssignMealUseCase } from './bulk-assign-meal.use-case';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { InMemoryTagRepository } from '../../infrastructure/repositories/in-memory-tag.repository';
import { InMemoryRecipeRepository } from '../../infrastructure/repositories/in-memory-recipe.repository';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { Recipe } from '@/domain/recipes/aggregates/recipe.aggregate';
import { RecipeIngredient } from '@/domain/recipes/value-objects/recipe-ingredient.vo';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { AppError } from '../shared/errors/app-error';
import { DomainError } from '@/domain/shared/errors/domain-error';

describe('BulkAssignMealUseCase', () => {
  const planningId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';
  const lunchTagId = '550e8400-e29b-41d4-a716-446655440010';
    const recipeId = '550e8400-e29b-41d4-a716-446655440020';
  const recipeTagMomento = lunchTagId;
  const recipeTagFormato = '550e8400-e29b-41d4-a716-446655440031';
  const recipeTagTipo = '550e8400-e29b-41d4-a716-446655440032';

  let useCase: BulkAssignMealUseCase;
  let planningRepo: InMemoryPlanningRepository;
  let tagRepo: InMemoryTagRepository;
  let recipeRepo: InMemoryRecipeRepository;

  function setupPlanningWithDays(): Planning {
    const planning = Planning.create(planningId, userId, 'Test', null, 2);
    planning.addDay('550e8400-e29b-41d4-a716-446655440002', 1);
    planning.addDay('550e8400-e29b-41d4-a716-446655440003', 2);
    planning.addDay('550e8400-e29b-41d4-a716-446655440004', 3);
    return planning;
  }

  beforeEach(async () => {
    planningRepo = new InMemoryPlanningRepository();
    tagRepo = new InMemoryTagRepository();
    recipeRepo = new InMemoryRecipeRepository();

    await tagRepo.save(Tag.create(lunchTagId, userId, 'Almuerzo', TagDimension.MOMENTO_DIA, true));
    await tagRepo.save(Tag.create(recipeTagFormato, userId, 'Plato', TagDimension.FORMATO, true));
    await tagRepo.save(Tag.create(recipeTagTipo, userId, 'Carne', TagDimension.TIPO_PLATO, true));
    await recipeRepo.save(Recipe.create(
      recipeId, userId, 'Tortilla', 4, 15, 'Cocinar',
      [RecipeIngredient.create('550e8400-e29b-41d4-a716-446655440031', '3 ud')],
      [
        { id: recipeTagMomento, dimension: TagDimension.MOMENTO_DIA },
        { id: recipeTagFormato, dimension: TagDimension.FORMATO },
        { id: recipeTagTipo, dimension: TagDimension.TIPO_PLATO },
      ],
    ));

    useCase = new BulkAssignMealUseCase(planningRepo, tagRepo, recipeRepo);
  });

  it('debe asignar el mismo servicio a varios dias', async () => {
    const planning = setupPlanningWithDays();
    await planningRepo.save(planning);

    await useCase.execute({ planningId, days: [1, 2], momentTagId: lunchTagId, covers: 4, recipeId });

    const updated = (await planningRepo.findById(planningId))!;
    expect(updated.getDay(1)!.services[lunchTagId]!.getCovers()).toBe(4);
    expect(updated.getDay(1)!.services[lunchTagId]!.getRecipeId()).toBe(recipeId);
    expect(updated.getDay(2)!.services[lunchTagId]!.getCovers()).toBe(4);
    expect(updated.getDay(3)).not.toBeNull();
    expect(updated.getDay(3)!.services[lunchTagId]).toBeUndefined();
  });

  it('debe asignar sin receta si no se proporciona', async () => {
    const planning = setupPlanningWithDays();
    await planningRepo.save(planning);

    await useCase.execute({ planningId, days: [1, 2], momentTagId: lunchTagId, covers: 2 });

    const updated = (await planningRepo.findById(planningId))!;
    expect(updated.getDay(1)!.services[lunchTagId]!.getCovers()).toBe(2);
    expect(updated.getDay(1)!.services[lunchTagId]!.getRecipeId()).toBeNull();
  });

  it('debe fallar si un dia no existe', async () => {
    const planning = setupPlanningWithDays();
    await planningRepo.save(planning);

    await expect(useCase.execute({ planningId, days: [99], momentTagId: lunchTagId, covers: 4 })).rejects.toThrow(DomainError);
  });

  it('debe fallar si el planning no existe', async () => {
    await expect(useCase.execute({ planningId, days: [1], momentTagId: lunchTagId, covers: 4 })).rejects.toThrow(AppError);
  });

  it('debe fallar si la etiqueta no es MOMENTO_DIA', async () => {
    const planning = setupPlanningWithDays();
    await planningRepo.save(planning);
    const estiloTagId = '550e8400-e29b-41d4-a716-446655440050';
    await tagRepo.save(Tag.create(estiloTagId, userId, 'Vegano', TagDimension.ESTILOS_VIDA, false));

    await expect(useCase.execute({ planningId, days: [1], momentTagId: estiloTagId, covers: 4 })).rejects.toThrow(AppError);
  });
});
