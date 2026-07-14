import { describe, it, expect, beforeEach } from 'vitest';
import { AssignMealUseCase } from './assign-meal.use-case';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { InMemoryTagRepository } from '../../infrastructure/repositories/in-memory-tag.repository';
import { InMemoryRecipeRepository } from '../../infrastructure/repositories/in-memory-recipe.repository';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { Recipe } from '@/domain/recipes/aggregates/recipe.aggregate';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../shared/errors/app-error';

describe('AssignMealUseCase', () => {
  const planningId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';
  const momentTagId = '550e8400-e29b-41d4-a716-446655440010';
  const otherTagId = '550e8400-e29b-41d4-a716-446655440020';
  const recipeId = '550e8400-e29b-41d4-a716-446655440030';
  const dayId = '550e8400-e29b-41d4-a716-446655440040';
  const excludedTagId = '550e8400-e29b-41d4-a716-446655440050';
  const formatoTagId = '550e8400-e29b-41d4-a716-446655440060';
  const tipoPlatoTagId = '550e8400-e29b-41d4-a716-446655440070';

  let useCase: AssignMealUseCase;
  let planningRepo: InMemoryPlanningRepository;
  let tagRepo: InMemoryTagRepository;
  let recipeRepo: InMemoryRecipeRepository;

  beforeEach(() => {
    planningRepo = new InMemoryPlanningRepository();
    tagRepo = new InMemoryTagRepository();
    recipeRepo = new InMemoryRecipeRepository();
    useCase = new AssignMealUseCase(planningRepo, tagRepo, recipeRepo);
  });

  it('debe asignar una comida a un día correctamente', () => {
    tagRepo.save(Tag.create(momentTagId, userId, 'Almuerzo', TagDimension.MOMENTO_DIA, true));
    recipeRepo.save(Recipe.create(recipeId, userId, 'Arroz', 4, 30, null, [], [
      { id: momentTagId, dimension: TagDimension.MOMENTO_DIA },
      { id: formatoTagId, dimension: TagDimension.FORMATO },
      { id: tipoPlatoTagId, dimension: TagDimension.TIPO_PLATO },
    ]));
    const planning = Planning.create(planningId, userId, 'Test', null, 1);
    planning.addDay(dayId, 1);
    planningRepo.save(planning);

    useCase.execute(planningId, 1, momentTagId, recipeId, 2);

    const updated = planningRepo.findById(planningId)!;
    const day = updated.getDay(1);
    expect(day!.services[momentTagId]).not.toBeNull();
    expect(day!.services[momentTagId]!.getCovers()).toBe(2);
  });

  it('debe fallar si el planning no existe', () => {
    expect(() => useCase.execute(planningId, 1, momentTagId, recipeId, 2)).toThrow(AppError);
  });

  it('debe fallar si la tag de momento no existe', () => {
    const planning = Planning.create(planningId, userId, 'Test', null, 1);
    planning.addDay(dayId, 1);
    planningRepo.save(planning);

    expect(() => useCase.execute(planningId, 1, momentTagId, recipeId, 2)).toThrow(AppError);
  });

  it('debe fallar si la tag no es de tipo MOMENTO_DIA', () => {
    tagRepo.save(Tag.create(otherTagId, userId, 'Asiático', TagDimension.TIPO_PLATO, true));
    const planning = Planning.create(planningId, userId, 'Test', null, 1);
    planning.addDay(dayId, 1);
    planningRepo.save(planning);

    expect(() => useCase.execute(planningId, 1, otherTagId, recipeId, 2)).toThrow(AppError);
  });

  it('debe rechazar receta con etiqueta excluida', () => {
    tagRepo.save(Tag.create(momentTagId, userId, 'Almuerzo', TagDimension.MOMENTO_DIA, true));
    tagRepo.save(Tag.create(excludedTagId, userId, 'Carne', TagDimension.TIPO_PLATO, true));
    recipeRepo.save(Recipe.create(recipeId, userId, 'Arroz con pollo', 4, 30, null, [], [
      { id: momentTagId, dimension: TagDimension.MOMENTO_DIA },
      { id: formatoTagId, dimension: TagDimension.FORMATO },
      { id: excludedTagId, dimension: TagDimension.TIPO_PLATO },
    ]));
    const planning = Planning.create(planningId, userId, 'Test', null, 1);
    planning.addDay(dayId, 1);
    planning.assignMealToDay(1, momentTagId, 4, undefined, [excludedTagId]);
    planningRepo.save(planning);

    expect(() => useCase.execute(planningId, 1, momentTagId, recipeId, 4)).toThrow(AppError);
  });

  it('debe permitir receta con ignoreRestrictions=true aunque tenga exclusiones', () => {
    tagRepo.save(Tag.create(momentTagId, userId, 'Almuerzo', TagDimension.MOMENTO_DIA, true));
    tagRepo.save(Tag.create(excludedTagId, userId, 'Carne', TagDimension.TIPO_PLATO, true));
    recipeRepo.save(Recipe.create(recipeId, userId, 'Arroz con pollo', 4, 30, null, [], [
      { id: momentTagId, dimension: TagDimension.MOMENTO_DIA },
      { id: formatoTagId, dimension: TagDimension.FORMATO },
      { id: excludedTagId, dimension: TagDimension.TIPO_PLATO },
    ]));
    const planning = Planning.create(planningId, userId, 'Test', null, 1);
    planning.addDay(dayId, 1);
    planning.assignMealToDay(1, momentTagId, 4, undefined, [excludedTagId]);
    planningRepo.save(planning);

    useCase.execute(planningId, 1, momentTagId, recipeId, 4, true);

    const updated = planningRepo.findById(planningId)!;
    const day = updated.getDay(1)!;
    const meal = day.services[momentTagId]!;
    expect(meal.getRecipeId()).toBe(recipeId);
    expect(meal.getIgnoreRestrictions()).toBe(true);
  });

  it('debe permitir receta si exclusiones no coinciden con tags de la receta', () => {
    tagRepo.save(Tag.create(momentTagId, userId, 'Almuerzo', TagDimension.MOMENTO_DIA, true));
    recipeRepo.save(Recipe.create(recipeId, userId, 'Arroz', 4, 30, null, [], [
      { id: momentTagId, dimension: TagDimension.MOMENTO_DIA },
      { id: formatoTagId, dimension: TagDimension.FORMATO },
      { id: tipoPlatoTagId, dimension: TagDimension.TIPO_PLATO },
    ]));
    const planning = Planning.create(planningId, userId, 'Test', null, 1);
    planning.addDay(dayId, 1);
    planning.assignMealToDay(1, momentTagId, 4, undefined, [excludedTagId]);
    planningRepo.save(planning);

    useCase.execute(planningId, 1, momentTagId, recipeId, 4);

    const updated = planningRepo.findById(planningId)!;
    const day = updated.getDay(1)!;
    expect(day.services[momentTagId]!.getRecipeId()).toBe(recipeId);
  });
});
