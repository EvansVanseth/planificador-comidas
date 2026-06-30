import { describe, it, expect } from 'vitest';
import { RecipeIngredient } from './recipe-ingredient.vo';
import { DomainError } from '@/domain/shared/errors/domain-error';

describe('RecipeIngredient (Value Object)', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';

  it('debe crearse con ingredientId y sin nota', () => {
    const ri = RecipeIngredient.create(validId);
    expect(ri.ingredientId).toBe(validId);
    expect(ri.quantityNote).toBeNull();
  });

  it('debe crearse con ingredientId y nota opcional', () => {
    const ri = RecipeIngredient.create(validId, '2 cucharadas');
    expect(ri.ingredientId).toBe(validId);
    expect(ri.quantityNote).toBe('2 cucharadas');
  });

  it('debe rechazar un ingredientId inválido', () => {
    expect(() => RecipeIngredient.create('id-invalido')).toThrow(DomainError);
  });

  it('debe ser inmutable (Object.freeze)', () => {
    const ri = RecipeIngredient.create(validId, 'una pizca');
    expect(Object.isFrozen(ri)).toBe(true);
  });

  it('debe considerar iguales dos VOs con los mismos valores', () => {
    const a = RecipeIngredient.create(validId, 'al gusto');
    const b = RecipeIngredient.create(validId, 'al gusto');
    expect(a.equals(b)).toBe(true);
  });

  it('debe considerar diferentes dos VOs con distinto ingredientId', () => {
    const a = RecipeIngredient.create(validId);
    const otherId = '550e8400-e29b-41d4-a716-446655440001';
    const b = RecipeIngredient.create(otherId);
    expect(a.equals(b)).toBe(false);
  });

  it('debe serializar a primitivas', () => {
    const ri = RecipeIngredient.create(validId, '3 unidades');
    expect(ri.toPrimitives()).toEqual({
      ingredientId: validId,
      quantityNote: '3 unidades'
    });
  });

  it('debe restaurar desde primitivas', () => {
    const primitives = { ingredientId: validId, quantityNote: '1 cucharadita' };
    const ri = RecipeIngredient.fromPrimitives(primitives);
    expect(ri.ingredientId).toBe(validId);
    expect(ri.quantityNote).toBe('1 cucharadita');
  });
});
