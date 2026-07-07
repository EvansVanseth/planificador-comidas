import { describe, it, expect, beforeEach } from 'vitest';
import { SetMealPreferencesUseCase } from './set-meal-preferences.use-case';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { AppError } from '../shared/errors/app-error';

describe('SetMealPreferencesUseCase', () => {
  const planningId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';
  const dayId = '550e8400-e29b-41d4-a716-446655440002';
  const lunchTagId = '550e8400-e29b-41d4-a716-446655440010';
  const preferences = ['550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440101'];

  let useCase: SetMealPreferencesUseCase;
  let planningRepo: InMemoryPlanningRepository;

  beforeEach(() => {
    planningRepo = new InMemoryPlanningRepository();
    useCase = new SetMealPreferencesUseCase(planningRepo);
  });

  it('debe asignar preferencias a un servicio correctamente', () => {
    const planning = Planning.create(planningId, userId, 'Test', null, 1);
    planning.addDay(dayId, 1);
    planning.assignMealToDay(1, lunchTagId, 4);
    planningRepo.save(planning);

    useCase.execute(planningId, 1, lunchTagId, preferences);

    const updated = planningRepo.findById(planningId)!;
    const day = updated.getDay(1)!;
    expect(day.services[lunchTagId]!.getPreferences()).toEqual(preferences);
  });

  it('debe reemplazar preferencias anteriores', () => {
    const planning = Planning.create(planningId, userId, 'Test', null, 1);
    planning.addDay(dayId, 1);
    planning.assignMealToDay(1, lunchTagId, 4, undefined, undefined, [preferences[0]]);
    planningRepo.save(planning);

    useCase.execute(planningId, 1, lunchTagId, [preferences[1]]);

    const updated = planningRepo.findById(planningId)!;
    const day = updated.getDay(1)!;
    expect(day.services[lunchTagId]!.getPreferences()).toEqual([preferences[1]]);
  });

  it('debe fallar si el planning no existe', () => {
    expect(() => useCase.execute(planningId, 1, lunchTagId, preferences)).toThrow(AppError);
  });

  it('debe fallar si el día no existe', () => {
    const planning = Planning.create(planningId, userId, 'Test', null, 1);
    planningRepo.save(planning);

    expect(() => useCase.execute(planningId, 1, lunchTagId, preferences)).toThrow(AppError);
  });

  it('debe fallar si el servicio no existe', () => {
    const planning = Planning.create(planningId, userId, 'Test', null, 1);
    planning.addDay(dayId, 1);
    planningRepo.save(planning);

    expect(() => useCase.execute(planningId, 1, lunchTagId, preferences)).toThrow(AppError);
  });
});
