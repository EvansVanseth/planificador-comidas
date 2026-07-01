import { describe, it, expect, beforeEach } from 'vitest';
import { AssignMealUseCase } from './assign-meal.use-case';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { InMemoryTagRepository } from '../../infrastructure/repositories/in-memory-tag.repository';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
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

  let useCase: AssignMealUseCase;
  let planningRepo: InMemoryPlanningRepository;
  let tagRepo: InMemoryTagRepository;

  beforeEach(() => {
    planningRepo = new InMemoryPlanningRepository();
    tagRepo = new InMemoryTagRepository();
    useCase = new AssignMealUseCase(planningRepo, tagRepo);
  });

  it('debe asignar una comida a un día correctamente', () => {
    tagRepo.save(Tag.create(momentTagId, null, 'Almuerzo', TagDimension.MOMENTO_DIA));
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
    tagRepo.save(Tag.create(otherTagId, null, 'Asiático', TagDimension.TIPO_PLATO));
    const planning = Planning.create(planningId, userId, 'Test', null, 1);
    planning.addDay(dayId, 1);
    planningRepo.save(planning);

    expect(() => useCase.execute(planningId, 1, otherTagId, recipeId, 2)).toThrow(AppError);
  });
});
