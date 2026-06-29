import { describe, it, expect } from "vitest";
import { Planning } from "./planning.aggregate";
import { PlannedDay } from "../entities/planned-day.entity";
import { DomainError } from "@/domain/shared/errors/domain-error";
import { OutRangeError } from "@/domain/shared/errors/ranges-error";
import { MealTime } from "../entities/meal-time.enum";

describe('Planning (Aggregate)', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';

   //Creación
  it('debería crear un Planning correctamente', () => {
    const planning = Planning.create(validId, 'Mi planificación', null, 2);
    expect(planning).toBeInstanceOf(Planning);
  });

  // Name
  it('debería recuperar el nombre de un Planning correctamente', () => {
    const planning = Planning.create(validId, 'Mi planificación', null, 2);
    expect(planning.getName()).toBe('Mi planificación');
  });

  it('debería renombrar un Planning correctamente', () => {
    const planning = Planning.create(validId, 'Mi planificación', null, 2);
    planning.rename('Nuevo nombre');
    expect(planning.getName()).toBe('Nuevo nombre');
  });

  // StartDate
  it('debería recuperar la fecha de inicio de un Planning correctamente', () => {
    const startDate = new Date('2024-01-01');
    const planning = Planning.create(validId, 'Mi planificación', startDate, 2);
    expect(planning.getStartDate()).toEqual(startDate);
  });

  it('debería reprogramar la fecha de inicio de un Planning correctamente', () => {
    const planning = Planning.create(validId, 'Mi planificación', null, 2);
    const newStartDate = new Date('2024-02-05');
    planning.reSchedule(newStartDate);
    expect(planning.getStartDate()).toEqual(newStartDate);
  });

  it('debería reprogramar la fecha de inicio de un Planning a null correctamente', () => {
    const planning = Planning.create(validId, 'Mi planificación', new Date('2024-01-01'), 2);
    planning.reSchedule(null);
    expect(planning.getStartDate()).toBeNull();
  });

  // Weeks
  it('debería recuperar el número de semanas de un Planning correctamente', () => {
    const planning = Planning.create(validId, 'Mi planificación', null, 2);
    expect(planning.getWeeks()).toBe(2);
  });

  it('debería cambiar el número de semanas de un Planning correctamente', () => {
    const planning = Planning.create(validId, 'Mi planificación', null, 2);
    planning.changeWeeks(3);
    expect(planning.getWeeks()).toBe(3);
  }); 

  it('debería fallar al cambiar el número de semanas a un valor menor que 1', () => {
    const planning = Planning.create(validId, 'Mi planificación', null, 2);
    expect(() => planning.changeWeeks(0)).toThrow(OutRangeError);
  });

  it('deberia fallar al cambiar el número de semanas si hay días planificados fuera del rango de semanas planificadas', () => {
    const planning = Planning.create(validId, 'Mi planificación', null, 2);
    planning.addDay(validId, 8); // Añadimos un día fuera del rango de semanas al que queremos cambiar (1 - 7)
    expect(() => planning.changeWeeks(1)).toThrow(DomainError); // Intentamos cambiar a 1 semana, pero hay un día planificado en la semana 2 (día 8)
  });

  // Days
  it('debería añadir un día a un Planning correctamente', () => {
    const planning = Planning.create(validId, 'Mi planificación', null, 2);
    planning.addDay(validId, 1);
    expect(planning.getDays().length).toBe(1);
  });

  it('debería fallar al añadir un día duplicado a un Planning correctamente', () => {
    const planning = Planning.create(validId, 'Mi planificación', null, 2);
    planning.addDay(validId, 1);
    expect(() => planning.addDay(validId, 1)).toThrow(DomainError);
  });  

  it(('debería fallar al añadir un día fuera del rango de semanas planificadas'), () => {
    const planning = Planning.create(validId, 'Mi planificación', null, 2);
    expect(() => planning.addDay(validId, 15)).toThrow(DomainError);
    expect(() => planning.addDay(validId, -5)).toThrow(DomainError);
  })

  it('debería recuperar un día de un Planning correctamente', () => {
    const planning = Planning.create(validId, 'Mi planificación', null, 2);
    planning.addDay(validId, 1);
    const day = planning.getDay(1);
    expect(day).not.toBeNull();
    expect(day!.id).toBe(validId);
  });

  it('debería devolver null al recuperar un día que no existe en un Planning', () => {
    const planning = Planning.create(validId, 'Mi planificación', null, 2);
    const day = planning.getDay(1);
    expect(day).toBeNull();
  });

  it('debería asignar una comida a un día de un Planning correctamente', () => {
    const planning = Planning.create(validId, 'Mi planificación', null, 2);
    planning.addDay(validId, 1);
    planning.assignMealToDay(1, MealTime.BREAKFAST, validId, 10);
    const day = planning.getDay(1);
    expect(day).not.toBeNull();
    expect(Object.values(day!.services).filter((service) => service !== null).length).toBe(1);
  });

  it('debería eliminar un día de un Planning correctamente', () => {
    const planning = Planning.create(validId, 'Mi planificación', null, 2);
    planning.addDay(validId, 1);
    planning.removeDay(1);
    expect(planning.getDays().length).toBe(0);
  });

  it('debería fallar al eliminar un día que no existe en un Planning', () => {
    const planning = Planning.create(validId, 'Mi planificación', null, 2);
    expect(() => planning.removeDay(1)).toThrow(DomainError);
  })
})