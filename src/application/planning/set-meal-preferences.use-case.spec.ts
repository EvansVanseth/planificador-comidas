import { describe, it, expect, beforeEach } from 'vitest';
import { SetMealPreferencesUseCase } from './set-meal-preferences.use-case';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { InMemoryTagRepository } from '../../infrastructure/repositories/in-memory-tag.repository';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { AppError } from '../shared/errors/app-error';

describe('SetMealPreferencesUseCase', () => {
  const planningId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';
  const dayId = '550e8400-e29b-41d4-a716-446655440002';
  const lunchTagId = '550e8400-e29b-41d4-a716-446655440010';
  const momentoTagId = '550e8400-e29b-41d4-a716-446655440011';
  const preferences = ['550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440101'];

  let useCase: SetMealPreferencesUseCase;
  let planningRepo: InMemoryPlanningRepository;
  let tagRepo: InMemoryTagRepository;

  beforeEach(async () => {
    planningRepo = new InMemoryPlanningRepository();
    tagRepo = new InMemoryTagRepository();
    await tagRepo.save(Tag.create(momentoTagId, userId, 'Desayuno', TagDimension.MOMENTO_DIA, true));
    useCase = new SetMealPreferencesUseCase(planningRepo, tagRepo);
  });

  it('debe asignar preferencias a un servicio correctamente', async () => {
    const planning = Planning.create(planningId, userId, 'Test', null, 1);
    planning.addDay(dayId, 1);
    planning.assignMealToDay(1, lunchTagId, 4);
    await planningRepo.save(planning);

    await useCase.execute(planningId, 1, lunchTagId, preferences);

    const updated = (await planningRepo.findById(planningId))!;
    const day = updated.getDay(1)!;
    expect(day.services[lunchTagId]!.getPreferences()).toEqual(preferences);
  });

  it('debe reemplazar preferencias anteriores', async () => {
    const planning = Planning.create(planningId, userId, 'Test', null, 1);
    planning.addDay(dayId, 1);
    planning.assignMealToDay(1, lunchTagId, 4, undefined, undefined, [preferences[0]]);
    await planningRepo.save(planning);

    await useCase.execute(planningId, 1, lunchTagId, [preferences[1]]);

    const updated = (await planningRepo.findById(planningId))!;
    const day = updated.getDay(1)!;
    expect(day.services[lunchTagId]!.getPreferences()).toEqual([preferences[1]]);
  });

  it('debe fallar si el planning no existe', async () => {
    await expect(useCase.execute(planningId, 1, lunchTagId, preferences)).rejects.toThrow(AppError);
  });

  it('debe fallar si el día no existe', async () => {
    const planning = Planning.create(planningId, userId, 'Test', null, 1);
    await planningRepo.save(planning);

    await expect(useCase.execute(planningId, 1, lunchTagId, preferences)).rejects.toThrow(AppError);
  });

  it('debe fallar si el servicio no existe', async () => {
    const planning = Planning.create(planningId, userId, 'Test', null, 1);
    planning.addDay(dayId, 1);
    await planningRepo.save(planning);

    await expect(useCase.execute(planningId, 1, lunchTagId, preferences)).rejects.toThrow(AppError);
  });

  it('debe fallar si se intenta preferir una etiqueta de MOMENTO_DIA', async () => {
    const planning = Planning.create(planningId, userId, 'Test', null, 1);
    planning.addDay(dayId, 1);
    planning.assignMealToDay(1, lunchTagId, 4);
    await planningRepo.save(planning);

    await expect(useCase.execute(planningId, 1, lunchTagId, [momentoTagId])).rejects.toThrow(AppError);
  });
});
