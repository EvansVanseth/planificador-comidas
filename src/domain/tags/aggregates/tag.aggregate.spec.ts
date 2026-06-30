import { describe, it, expect } from 'vitest';
import { Tag } from './tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { DomainError } from '@/domain/shared/errors/domain-error';
import { NullError } from '@/domain/shared/errors/null-type-error';

describe('Tag (Aggregate)', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';
  const validUserId = '550e8400-e29b-41d4-a716-446655440001';

  it('debe crearse con todos los campos obligatorios', () => {
    const tag = Tag.create(validId, validUserId, 'Vegano', TagDimension.ESTILOS_VIDA);
    expect(tag.getId()).toBe(validId);
    expect(tag.getUserId()).toBe(validUserId);
    expect(tag.getName()).toBe('Vegano');
    expect(tag.getDimension()).toBe(TagDimension.ESTILOS_VIDA);
  });

  it('debe permitir user_id nulo (etiqueta del sistema)', () => {
    const tag = Tag.create(validId, null, 'Caliente', TagDimension.FORMATO);
    expect(tag.getUserId()).toBeNull();
  });

  it('debe rechazar un id inválido', () => {
    expect(() => Tag.create('invalido', validUserId, 'Pasta', TagDimension.TIPO_PLATO)).toThrow(DomainError);
  });

  it('debe rechazar un userId inválido si se provee', () => {
    expect(() => Tag.create(validId, 'invalido', 'Pasta', TagDimension.TIPO_PLATO)).toThrow(DomainError);
  });

  it('debe rechazar un nombre vacío', () => {
    expect(() => Tag.create(validId, null, '', TagDimension.MOMENTO_DIA)).toThrow(NullError);
  });

  it('debe permitir renombrar la etiqueta', () => {
    const tag = Tag.create(validId, null, 'Viejo', TagDimension.MOMENTO_DIA);
    tag.rename('Nuevo');
    expect(tag.getName()).toBe('Nuevo');
  });

  it('debe serializar a primitivas correctamente con userId', () => {
    const tag = Tag.create(validId, validUserId, 'Vegetariano', TagDimension.ESTILOS_VIDA);
    const primitives = tag.toPrimitives();
    expect(primitives).toEqual({
      id: validId,
      userId: validUserId,
      name: 'Vegetariano',
      dimension: TagDimension.ESTILOS_VIDA
    });
  });

  it('debe serializar a primitivas correctamente con userId nulo', () => {
    const tag = Tag.create(validId, null, 'Frío', TagDimension.FORMATO);
    const primitives = tag.toPrimitives();
    expect(primitives).toEqual({
      id: validId,
      userId: null,
      name: 'Frío',
      dimension: TagDimension.FORMATO
    });
  });

  it('debe restaurar desde primitivas correctamente', () => {
    const tag = Tag.create(validId, validUserId, 'Arroz', TagDimension.TIPO_PLATO);
    const primitives = tag.toPrimitives();
    const restored = Tag.fromPrimitives(primitives);
    expect(restored.getId()).toBe(validId);
    expect(restored.getUserId()).toBe(validUserId);
    expect(restored.getName()).toBe('Arroz');
    expect(restored.getDimension()).toBe(TagDimension.TIPO_PLATO);
  });

  it('debe mantener integridad en roundtrip', () => {
    const original = Tag.create(validId, null, 'Desayuno', TagDimension.MOMENTO_DIA);
    const primitives = original.toPrimitives();
    const restored = Tag.fromPrimitives(primitives);
    expect(restored.toPrimitives()).toEqual(primitives);
  });
});
