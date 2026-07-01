import { describe, it, expect } from 'vitest';
import { Ingredient } from './ingredient.aggregate';
import { DomainError } from '@/domain/shared/errors/domain-error';
import { NullError } from '@/domain/shared/errors/null-type-error';

describe('Ingredient (Aggregate)', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';
  const validUserId = '550e8400-e29b-41d4-a716-446655440001';

  it('debe crearse con todos los campos', () => {
    const ingredient = Ingredient.create(validId, validUserId, 'Arroz Blanco');
    expect(ingredient.getId()).toBe(validId);
    expect(ingredient.getUserId()).toBe(validUserId);
    expect(ingredient.getName()).toBe('Arroz Blanco');
  });

  it('debe rechazar un id inválido', () => {
    expect(() => Ingredient.create('invalido', validUserId, 'Arroz')).toThrow(DomainError);
  });

  it('debe rechazar un userId inválido', () => {
    expect(() => Ingredient.create(validId, 'invalido', 'Arroz')).toThrow(DomainError);
  });

  it('debe rechazar un nombre vacío', () => {
    expect(() => Ingredient.create(validId, validUserId, '')).toThrow(NullError);
  });

  it('debe rechazar un nombre demasiado corto', () => {
    expect(() => Ingredient.create(validId, validUserId, 'Ar')).toThrow(DomainError);
  });

  it('debe permitir renombrar', () => {
    const ingredient = Ingredient.create(validId, validUserId, 'Arroz');
    ingredient.rename('Arroz Integral');
    expect(ingredient.getName()).toBe('Arroz Integral');
  });

  it('debe serializar a primitivas', () => {
    const ingredient = Ingredient.create(validId, validUserId, 'Pechuga de Pollo');
    expect(ingredient.toPrimitives()).toEqual({
      id: validId,
      userId: validUserId,
      name: 'Pechuga de Pollo'
    });
  });

  it('debe restaurar desde primitivas', () => {
    const original = Ingredient.create(validId, validUserId, 'Huevos');
    const primitives = original.toPrimitives();
    const restored = Ingredient.fromPrimitives(primitives);
    expect(restored.getId()).toBe(validId);
    expect(restored.getUserId()).toBe(validUserId);
    expect(restored.getName()).toBe('Huevos');
  });

  it('debe mantener integridad en roundtrip', () => {
    const original = Ingredient.create(validId, validUserId, 'Leche');
    const primitives = original.toPrimitives();
    const restored = Ingredient.fromPrimitives(primitives);
    expect(restored.toPrimitives()).toEqual(primitives);
  });

  it('debe reasignar el usuario', () => {
    const ingredient = Ingredient.create(validId, validUserId, 'Arroz');
    const newUserId = '550e8400-e29b-41d4-a716-446655440002';
    ingredient.reassignUser(newUserId);
    expect(ingredient.getUserId()).toBe(newUserId);
  });

  it('debe rechazar userId inválido en reassignUser', () => {
    const ingredient = Ingredient.create(validId, validUserId, 'Arroz');
    expect(() => ingredient.reassignUser('no-uuid')).toThrow(DomainError);
  });
});
