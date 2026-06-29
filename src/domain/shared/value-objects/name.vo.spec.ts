import { describe, it, expect } from 'vitest';
import { Name } from './name.vo';
import { NullError } from '@/domain/shared/errors/null-type-error';
import { OutRangeError } from '@/domain/shared/errors/ranges-error';

describe('Name (Value Object)', () => {
  it('debe crear un nombre válido si cumple los requisitos', () => {
    const nombre = 'Pizza Margarita';
    const vo = Name.create('Test', nombre);
    expect(vo.value).toBe('Pizza Margarita');
  });

  it('debe lanzar NullError si el nombre es vacío', () => {
    expect(() => Name.create('Test', '')).toThrow(NullError);
  });

  it('debe lanzar InvalidRangeError si el nombre es demasiado corto', () => {
    // Definiremos que el mínimo son 3 caracteres
    expect(() => Name.create('Test', 'Pi')).toThrow(OutRangeError);
  });
});