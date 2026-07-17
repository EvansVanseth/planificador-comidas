import { describe, it, expect, beforeEach } from 'vitest';
import { BulkUpdateDaysUseCase } from './bulk-update-days.use-case';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { InMemoryTagRepository } from '../../infrastructure/repositories/in-memory-tag.repository';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { AppError } from '../shared/errors/app-error';
import { DomainError } from '@/domain/shared/errors/domain-error';

describe('BulkUpdateDaysUseCase', () => {
  const planningId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';
  const day1Id = '550e8400-e29b-41d4-a716-446655440002';
  const day2Id = '550e8400-e29b-41d4-a716-446655440003';
  const lunchTagId = '550e8400-e29b-41d4-a716-446655440010';
  const dinnerTagId = '550e8400-e29b-41d4-a716-446655440011';
  const momentoTagId = '550e8400-e29b-41d4-a716-446655440012';
  const exclusionIds = ['550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440101'];
  const preferenceIds = ['550e8400-e29b-41d4-a716-446655440200', '550e8400-e29b-41d4-a716-446655440201'];

  let useCase: BulkUpdateDaysUseCase;
  let planningRepo: InMemoryPlanningRepository;
  let tagRepo: InMemoryTagRepository;

  function setupPlanningWithServices(): Planning {
    const planning = Planning.create(planningId, userId, 'Test', null, 2);
    planning.addDay(day1Id, 1);
    planning.addDay(day2Id, 2);
    planning.assignMealToDay(1, lunchTagId, 4);
    planning.assignMealToDay(1, dinnerTagId, 2);
    planning.assignMealToDay(2, lunchTagId, 3);
    return planning;
  }

  beforeEach(async () => {
    planningRepo = new InMemoryPlanningRepository();
    tagRepo = new InMemoryTagRepository();
    await tagRepo.save(Tag.create(momentoTagId, userId, 'Desayuno', TagDimension.MOMENTO_DIA, true));
    useCase = new BulkUpdateDaysUseCase(planningRepo, tagRepo);
  });

  it('debe actualizar comensales en todos los servicios de los dias seleccionados', async () => {
    const planning = setupPlanningWithServices();
    await planningRepo.save(planning);

    await useCase.execute({ planningId, days: [1, 2], covers: 5 });

    const updated = (await planningRepo.findById(planningId))!;
    expect(updated.getDay(1)!.services[lunchTagId]!.getCovers()).toBe(5);
    expect(updated.getDay(1)!.services[dinnerTagId]!.getCovers()).toBe(5);
    expect(updated.getDay(2)!.services[lunchTagId]!.getCovers()).toBe(5);
  });

  it('debe actualizar exclusiones en todos los servicios de los dias seleccionados', async () => {
    const planning = setupPlanningWithServices();
    await planningRepo.save(planning);

    await useCase.execute({ planningId, days: [1], exclusions: exclusionIds });

    const updated = (await planningRepo.findById(planningId))!;
    expect(updated.getDay(1)!.services[lunchTagId]!.getExclusions()).toEqual(exclusionIds);
    expect(updated.getDay(1)!.services[dinnerTagId]!.getExclusions()).toEqual(exclusionIds);
    expect(updated.getDay(2)!.services[lunchTagId]!.getExclusions()).toEqual([]);
  });

  it('debe actualizar preferencias en todos los servicios de los dias seleccionados', async () => {
    const planning = setupPlanningWithServices();
    await planningRepo.save(planning);

    await useCase.execute({ planningId, days: [1, 2], preferences: preferenceIds });

    const updated = (await planningRepo.findById(planningId))!;
    expect(updated.getDay(1)!.services[lunchTagId]!.getPreferences()).toEqual(preferenceIds);
    expect(updated.getDay(2)!.services[lunchTagId]!.getPreferences()).toEqual(preferenceIds);
  });

  it('debe actualizar solo los campos proporcionados (covers sin tocar exclusiones)', async () => {
    const planning = setupPlanningWithServices();
    await planningRepo.save(planning);

    await useCase.execute({ planningId, days: [1], covers: 6 });

    const updated = (await planningRepo.findById(planningId))!;
    expect(updated.getDay(1)!.services[lunchTagId]!.getCovers()).toBe(6);
    expect(updated.getDay(1)!.services[lunchTagId]!.getExclusions()).toEqual([]);
  });

  it('debe manejar varios campos a la vez', async () => {
    const planning = setupPlanningWithServices();
    await planningRepo.save(planning);

    await useCase.execute({ planningId, days: [1, 2], covers: 3, exclusions: exclusionIds, preferences: preferenceIds });

    const updated = (await planningRepo.findById(planningId))!;
    expect(updated.getDay(1)!.services[lunchTagId]!.getCovers()).toBe(3);
    expect(updated.getDay(1)!.services[lunchTagId]!.getExclusions()).toEqual(exclusionIds);
    expect(updated.getDay(1)!.services[lunchTagId]!.getPreferences()).toEqual(preferenceIds);
    expect(updated.getDay(2)!.services[lunchTagId]!.getCovers()).toBe(3);
    expect(updated.getDay(2)!.services[lunchTagId]!.getExclusions()).toEqual(exclusionIds);
    expect(updated.getDay(2)!.services[lunchTagId]!.getPreferences()).toEqual(preferenceIds);
  });

  it('debe fallar si el planning no existe', async () => {
    await expect(useCase.execute({ planningId, days: [1], covers: 5 })).rejects.toThrow(AppError);
  });

  it('debe fallar si un dia no existe', async () => {
    const planning = Planning.create(planningId, userId, 'Test', null, 2);
    await planningRepo.save(planning);

    await expect(useCase.execute({ planningId, days: [99], covers: 5 })).rejects.toThrow(DomainError);
  });

  it('debe fallar si se intenta excluir una etiqueta de MOMENTO_DIA', async () => {
    const planning = setupPlanningWithServices();
    await planningRepo.save(planning);

    await expect(useCase.execute({ planningId, days: [1], exclusions: [momentoTagId] })).rejects.toThrow(AppError);
  });

  it('debe fallar si se intenta preferir una etiqueta de MOMENTO_DIA', async () => {
    const planning = setupPlanningWithServices();
    await planningRepo.save(planning);

    await expect(useCase.execute({ planningId, days: [1], preferences: [momentoTagId] })).rejects.toThrow(AppError);
  });
});
