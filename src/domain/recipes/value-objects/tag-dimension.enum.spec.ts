import { describe, it, expect } from 'vitest'
import { TagDimension } from './tag-dimension.enum'

describe('TagDimension (Enum)', () => {
  it('debe tener los 4 valores definidos', () => {
    expect(Object.keys(TagDimension)).toHaveLength(4);
  });

  it.each([
    ['MOMENTO_DIA', TagDimension.MOMENTO_DIA],
    ['FORMATO', TagDimension.FORMATO],
    ['TIPO_PLATO', TagDimension.TIPO_PLATO],
    ['ESTILOS_VIDA', TagDimension.ESTILOS_VIDA],
  ])('debe existir %s', (_, value) => {
    expect(value).toBeDefined();
  });

  it('debe rechazar un valor que no pertenezca al enum en tiempo de compilación', () => {
    const invalid = 'OTRO_VALOR' as TagDimension;
    expect(Object.values(TagDimension)).not.toContain(invalid);
  });
});
