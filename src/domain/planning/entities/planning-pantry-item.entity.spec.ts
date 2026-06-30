import { describe, it, expect } from 'vitest';
import { PlanningPantryItem } from './planning-pantry-item.entity';
import { DomainError } from '@/domain/shared/errors/domain-error';

describe('PlanningPantryItem (Entity)', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';
  const validIngredientId = '550e8400-e29b-41d4-a716-446655440001';

  it('debe crearse con valores por defecto', () => {
    const item = PlanningPantryItem.create(validId, validIngredientId);
    expect(item.getId()).toBe(validId);
    expect(item.getIngredientId()).toBe(validIngredientId);
    expect(item.isAvailable()).toBe(false);
    expect(item.getCovers()).toBe(0);
  });

  it('debe crearse con coverage específico', () => {
    const item = PlanningPantryItem.create(validId, validIngredientId, false, 4);
    expect(item.isAvailable()).toBe(false);
    expect(item.getCovers()).toBe(4);
  });

  it('debe crearse como disponible (tengo de todo)', () => {
    const item = PlanningPantryItem.create(validId, validIngredientId, true);
    expect(item.isAvailable()).toBe(true);
    expect(item.getCovers()).toBe(0);
  });

  it('debe rechazar un id inválido', () => {
    expect(() => PlanningPantryItem.create('invalido', validIngredientId)).toThrow(DomainError);
  });

  it('debe rechazar un ingredientId inválido', () => {
    expect(() => PlanningPantryItem.create(validId, 'invalido')).toThrow(DomainError);
  });

  it('debe rechazar covers negativo', () => {
    expect(() => PlanningPantryItem.create(validId, validIngredientId, false, -1)).toThrow(DomainError);
  });

  it('debe permitir marcar como disponible', () => {
    const item = PlanningPantryItem.create(validId, validIngredientId);
    item.markAsAvailable();
    expect(item.isAvailable()).toBe(true);
    expect(item.getCovers()).toBe(0);
  });

  it('debe permitir actualizar cobertura', () => {
    const item = PlanningPantryItem.create(validId, validIngredientId);
    item.updateCovers(6);
    expect(item.getCovers()).toBe(6);
    expect(item.isAvailable()).toBe(false);
  });

  it('debe serializar a primitivas', () => {
    const item = PlanningPantryItem.create(validId, validIngredientId, false, 3);
    expect(item.toPrimitives()).toEqual({
      id: validId,
      ingredientId: validIngredientId,
      available: false,
      covers: 3,
    });
  });

  it('debe restaurar desde primitivas', () => {
    const primitives = { id: validId, ingredientId: validIngredientId, available: true, covers: 0 };
    const restored = PlanningPantryItem.fromPrimitives(primitives);
    expect(restored.getId()).toBe(validId);
    expect(restored.isAvailable()).toBe(true);
  });
});
