import { describe, it, expect } from 'vitest'
import { TagDimension } from './tag-dimension.vo'
import { NullError } from '@/domain/shared/errors/null-type-error';

describe('TagDimension (Value Object)', () => {
  it('debe lanzar NullError si está vacío', () => {
    expect(() => TagDimension.create('')).toThrow(NullError);
  })
  
  it('debe lanzar NullError si solo contiene espacios en blanco', () => {
    expect(() => TagDimension.create(' ')).toThrow(NullError);
  })

  it('debe permitir crear una etiqueta de dimension válida (MOMENTO_DIA)', () => {
    const VALID_TAG = 'MOMENTO_DIA';
    const dimension = TagDimension.create(VALID_TAG);
    expect(dimension.value).toBe(VALID_TAG);
  })
})