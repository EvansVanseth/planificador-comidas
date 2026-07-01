import { describe, it, expect } from 'vitest'
import { PlannedDay } from './planned-day.entity'
import { DomainError } from '@/domain/shared/errors/domain-error';

describe('PlannedDay (Entity)', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';
  const lunchTagId = '550e8400-e29b-41d4-a716-446655440100';

  it('debe crearse correctamente con su orden', () => {
    const plannedDay = PlannedDay.create(validId, 1);
    expect(plannedDay.getOrdenDia()).toBe(1);
    expect(plannedDay.getId()).toBe(validId);
  });

  it('debe devolver un DTO correctamente', () => {
    const plannedDay = PlannedDay.create(validId, 1);
    const dto = plannedDay.toDTO();
    expect(dto).toEqual({
      id: validId,
      order: 1,
      services: {}
    });
  })

  it('debe permitir añadir un servicio de comida', () => {
    const plannedDay = PlannedDay.create(validId, 1);
    plannedDay.addMeal(lunchTagId, 2, validId);
    const meal = plannedDay.getMeal(lunchTagId);
    expect(meal).not.toBeNull();
    expect(meal!.getRecipeId()).toBe(validId);
    expect(meal!.getCovers()).toBe(2);
  });

  it('debe permitir añadir un servicio sin receta (pendiente de planificar)', () => {
    const plannedDay = PlannedDay.create(validId, 1);
    plannedDay.addMeal(lunchTagId, 4);
    const meal = plannedDay.getMeal(lunchTagId);
    expect(meal).not.toBeNull();
    expect(meal!.getRecipeId()).toBeNull();
    expect(meal!.getCovers()).toBe(4);
  });

  it('debe fallar al intentar añadir un servicio de comida a un momento ya ocupado', () => {
    const plannedDay = PlannedDay.create(validId, 1);
    plannedDay.addMeal(lunchTagId, 2, validId);
    expect(() => plannedDay.addMeal(lunchTagId, 2, validId)).toThrow(DomainError);
  });

})
