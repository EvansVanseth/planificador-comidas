import { describe, it, expect } from 'vitest';
import { MealService } from './meal-service.entity';
import { DomainError } from '@/domain/shared/errors/domain-error';

describe('MealService (Entity)', () => {
  const dinnerTagId = '550e8400-e29b-41d4-a716-446655440200';
  const tagId1 = '550e8400-e29b-41d4-a716-446655440300';
  const tagId2 = '550e8400-e29b-41d4-a716-446655440301';

  it('debe crearse correctamente con valores por defecto', () => {
    const service = MealService.create(4, dinnerTagId);
    expect(service.getCovers()).toBe(4);
    expect(service.getRecipeId()).toBe(dinnerTagId);
    expect(service.getExclusions()).toEqual([]);
    expect(service.getPreferences()).toEqual([]);
  });

  it('debe crearse con exclusiones y preferencias', () => {
    const service = MealService.create(2, undefined, [tagId1], [tagId2]);
    expect(service.getExclusions()).toEqual([tagId1]);
    expect(service.getPreferences()).toEqual([tagId2]);
  });

  it('debe crear empty con 0 comensales y sin receta', () => {
    const service = MealService.createEmpty();
    expect(service.getCovers()).toBe(0);
    expect(service.getRecipeId()).toBeNull();
    expect(service.getExclusions()).toEqual([]);
    expect(service.getPreferences()).toEqual([]);
  });

  it('debe fallar si covers es 0 y se asigna receta', () => {
    expect(() => MealService.create(0, dinnerTagId)).toThrow(DomainError);
  });

  it('debe fallar al asignar receta si covers es 0', () => {
    const service = MealService.create(0);
    expect(() => service.assignRecipe(dinnerTagId)).toThrow(DomainError);
  });

  it('debe permitir asignar receta', () => {
    const service = MealService.create(4);
    service.assignRecipe(dinnerTagId);
    expect(service.getRecipeId()).toBe(dinnerTagId);
  });

  it('debe desasignar receta', () => {
    const service = MealService.create(4, dinnerTagId);
    service.unassignRecipe();
    expect(service.getRecipeId()).toBeNull();
  });

  it('debe cambiar comensales', () => {
    const service = MealService.create(4, dinnerTagId);
    service.changeCovers(6);
    expect(service.getCovers()).toBe(6);
  });

  it('debe limpiar receta al cambiar covers a 0', () => {
    const service = MealService.create(4, dinnerTagId);
    service.changeCovers(0);
    expect(service.getCovers()).toBe(0);
    expect(service.getRecipeId()).toBeNull();
  });

  it('debe añadir y quitar exclusiones', () => {
    const service = MealService.create(4);
    service.addExclusion(tagId1);
    expect(service.getExclusions()).toEqual([tagId1]);
    service.removeExclusion(tagId1);
    expect(service.getExclusions()).toEqual([]);
  });

  it('debe añadir y quitar preferencias', () => {
    const service = MealService.create(4);
    service.addPreference(tagId1);
    expect(service.getPreferences()).toEqual([tagId1]);
    service.removePreference(tagId1);
    expect(service.getPreferences()).toEqual([]);
  });

  it('debe setear exclusiones reemplazando las anteriores', () => {
    const service = MealService.create(4, undefined, [tagId1]);
    service.setExclusions([tagId2]);
    expect(service.getExclusions()).toEqual([tagId2]);
  });

  it('debe setear preferencias reemplazando las anteriores', () => {
    const service = MealService.create(4, undefined, undefined, [tagId1]);
    service.setPreferences([tagId2]);
    expect(service.getPreferences()).toEqual([tagId2]);
  });

  it('debe serializar a primitivas correctamente', () => {
    const service = MealService.create(4, dinnerTagId, [tagId1], [tagId2]);
    const primitives = service.toPrimitives();
    expect(primitives).toEqual({
      time: '',
      recipeId: dinnerTagId,
      covers: 4,
      exclusions: [tagId1],
      preferences: [tagId2],
    });
  });

  it('debe restaurar desde primitivas correctamente', () => {
    const data = {
      recipeId: dinnerTagId,
      covers: 4,
      exclusions: [tagId1],
      preferences: [tagId2],
    };
    const service = MealService.fromPrimitives(data);
    expect(service.getCovers()).toBe(4);
    expect(service.getRecipeId()).toBe(dinnerTagId);
    expect(service.getExclusions()).toEqual([tagId1]);
    expect(service.getPreferences()).toEqual([tagId2]);
  });
});
