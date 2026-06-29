import { describe, it, expect } from 'vitest'
import { PlannedDay } from './planned-day.entity'
import { MealTime } from './meal-time.enum';
import { DomainError } from '@/domain/shared/errors/domain-error';

describe('PlannedDay (Entity)', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';
  
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
      services: {
        [MealTime.BREAKFAST]: null,
        [MealTime.LUNCH]: null,
        [MealTime.DINNER]: null
      }
    });
  })

  it('debe permitir añadir un servicio de comida', () => {
    const plannedDay = PlannedDay.create(validId, 1);
    plannedDay.addMeal(MealTime.LUNCH, validId, 2);
    expect(plannedDay.getMeal(MealTime.LUNCH)?.recipeId.value).toEqual(validId);
    expect(plannedDay.getMeal(MealTime.LUNCH)?.covers.value).toEqual(2);
  });

  it('debe fallar al intentar añadir un servicio de comida a una hora ya ocupada', () => {
    const plannedDay = PlannedDay.create(validId, 1);
    plannedDay.addMeal(MealTime.LUNCH, validId, 2);
    expect(() => plannedDay.addMeal(MealTime.LUNCH, validId, 2)).toThrow(DomainError);
  });

})