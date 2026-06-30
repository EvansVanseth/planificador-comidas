import { describe, it, expect } from 'vitest';
import { PlanningShoppingItem } from './planning-shopping-item.entity';
import { DomainError } from '@/domain/shared/errors/domain-error';

describe('PlanningShoppingItem (Entity)', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';
  const validIngredientId = '550e8400-e29b-41d4-a716-446655440001';

  it('debe crearse como pendiente por defecto', () => {
    const item = PlanningShoppingItem.create(validId, validIngredientId);
    expect(item.getId()).toBe(validId);
    expect(item.getIngredientId()).toBe(validIngredientId);
    expect(item.isCompleted()).toBe(false);
  });

  it('debe crearse como completado si se indica', () => {
    const item = PlanningShoppingItem.create(validId, validIngredientId, true);
    expect(item.isCompleted()).toBe(true);
  });

  it('debe rechazar un id inválido', () => {
    expect(() => PlanningShoppingItem.create('invalido', validIngredientId)).toThrow(DomainError);
  });

  it('debe rechazar un ingredientId inválido', () => {
    expect(() => PlanningShoppingItem.create(validId, 'invalido')).toThrow(DomainError);
  });

  it('debe permitir marcar como completado', () => {
    const item = PlanningShoppingItem.create(validId, validIngredientId);
    item.markAsCompleted();
    expect(item.isCompleted()).toBe(true);
  });

  it('debe permitir marcar como pendiente', () => {
    const item = PlanningShoppingItem.create(validId, validIngredientId, true);
    item.markAsPending();
    expect(item.isCompleted()).toBe(false);
  });

  it('debe serializar a primitivas', () => {
    const item = PlanningShoppingItem.create(validId, validIngredientId, true);
    expect(item.toPrimitives()).toEqual({
      id: validId,
      ingredientId: validIngredientId,
      completed: true,
    });
  });

  it('debe restaurar desde primitivas', () => {
    const primitives = { id: validId, ingredientId: validIngredientId, completed: false };
    const restored = PlanningShoppingItem.fromPrimitives(primitives);
    expect(restored.getId()).toBe(validId);
    expect(restored.isCompleted()).toBe(false);
  });
});
