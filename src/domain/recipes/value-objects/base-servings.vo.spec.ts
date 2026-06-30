import { describe, it, expect } from 'vitest';
import { BaseServings } from './base-servings.vo';
import { MinRangeError } from '@/domain/shared/errors/ranges-error';
import { NoIntegerError } from '@/domain/shared/errors/null-type-error';

describe('BaseServings (Value Object)', () => {
  it(`debe lanzar MinRangeError si es menor de ${BaseServings.MIN_VALUE}`, () => {
    expect(() => BaseServings.create(0)).toThrow(MinRangeError);
    expect(() => BaseServings.create(-5)).toThrow(MinRangeError);
  });

  it('debe lanzar NoIntegerError si no es un entero', () => {
    expect(() => BaseServings.create(2.5)).toThrow(NoIntegerError);
  });

  it('debe crear un valor válido', () => {
    const servings = BaseServings.create(4);
    expect(servings.value).toBe(4);
  });
});
