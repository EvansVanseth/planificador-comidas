import { describe, it, expect } from 'vitest';
import { Tag } from './tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { DomainError } from '@/domain/shared/errors/domain-error';
import { NullError } from '@/domain/shared/errors/null-type-error';

describe('Tag (Aggregate)', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';
  const validUserId = '550e8400-e29b-41d4-a716-446655440001';
  const anotherUserId = '550e8400-e29b-41d4-a716-446655440002';

  it('debe crearse con todos los campos obligatorios', () => {
    const tag = Tag.create(validId, validUserId, 'Vegano', TagDimension.ESTILOS_VIDA, false);
    expect(tag.getId()).toBe(validId);
    expect(tag.getUserId()).toBe(validUserId);
    expect(tag.getName()).toBe('Vegano');
    expect(tag.getDimension()).toBe(TagDimension.ESTILOS_VIDA);
    expect(tag.isSystemTag()).toBe(false);
  });

  it('debe permitir crear una etiqueta del sistema', () => {
    const tag = Tag.create(validId, validUserId, 'Caliente', TagDimension.FORMATO, true);
    expect(tag.isSystemTag()).toBe(true);
    expect(tag.getUserId()).toBe(validUserId);
  });

  it('debe rechazar un id inválido', () => {
    expect(() => Tag.create('invalido', validUserId, 'Pasta', TagDimension.TIPO_PLATO, false)).toThrow(DomainError);
  });

  it('debe rechazar un userId inválido si se provee', () => {
    expect(() => Tag.create(validId, 'invalido', 'Pasta', TagDimension.TIPO_PLATO, false)).toThrow(DomainError);
  });

  it('debe rechazar un nombre vacío', () => {
    expect(() => Tag.create(validId, validUserId, '', TagDimension.MOMENTO_DIA, true)).toThrow(NullError);
  });

  it('debe permitir renombrar la etiqueta', () => {
    const tag = Tag.create(validId, validUserId, 'Viejo', TagDimension.MOMENTO_DIA, true);
    tag.rename('Nuevo');
    expect(tag.getName()).toBe('Nuevo');
  });

  it('debe serializar a primitivas correctamente con userId', () => {
    const tag = Tag.create(validId, validUserId, 'Vegetariano', TagDimension.ESTILOS_VIDA, false);
    const primitives = tag.toPrimitives();
    expect(primitives).toEqual({
      id: validId,
      userId: validUserId,
      name: 'Vegetariano',
      dimension: TagDimension.ESTILOS_VIDA,
      isSystem: false,
      systemKey: null,
    });
  });

  it('debe serializar a primitivas correctamente con etiqueta del sistema', () => {
    const tag = Tag.create(validId, validUserId, 'Frío', TagDimension.FORMATO, true);
    const primitives = tag.toPrimitives();
    expect(primitives).toEqual({
      id: validId,
      userId: validUserId,
      name: 'Frío',
      dimension: TagDimension.FORMATO,
      isSystem: true,
      systemKey: null,
    });
  });

  it('debe restaurar desde primitivas correctamente', () => {
    const tag = Tag.create(validId, validUserId, 'Arroz', TagDimension.TIPO_PLATO, false);
    const primitives = tag.toPrimitives();
    const restored = Tag.fromPrimitives(primitives);
    expect(restored.getId()).toBe(validId);
    expect(restored.getUserId()).toBe(validUserId);
    expect(restored.getName()).toBe('Arroz');
    expect(restored.getDimension()).toBe(TagDimension.TIPO_PLATO);
  });

  it('debe mantener integridad en roundtrip', () => {
    const original = Tag.create(validId, validUserId, 'Desayuno', TagDimension.MOMENTO_DIA, true);
    const primitives = original.toPrimitives();
    const restored = Tag.fromPrimitives(primitives);
    expect(restored.toPrimitives()).toEqual(primitives);
  });

  it('debe cambiar la dimensión de una etiqueta de usuario', () => {
    const tag = Tag.create(validId, validUserId, 'Test', TagDimension.MOMENTO_DIA, false);
    tag.changeDimension(TagDimension.TIPO_PLATO);
    expect(tag.getDimension()).toBe(TagDimension.TIPO_PLATO);
  });

  it('debe rechazar cambiar la dimensión de una etiqueta del sistema', () => {
    const tag = Tag.create(validId, validUserId, 'Test', TagDimension.MOMENTO_DIA, true);
    expect(() => tag.changeDimension(TagDimension.TIPO_PLATO)).toThrow(DomainError);
  });

  it('debe reasignar la etiqueta a un usuario', () => {
    const tag = Tag.create(validId, validUserId, 'Test', TagDimension.MOMENTO_DIA, true);
    tag.reassignUser(anotherUserId);
    expect(tag.getUserId()).toBe(anotherUserId);
  });

  it('debe reasignar la etiqueta a otro usuario', () => {
    const tag = Tag.create(validId, validUserId, 'Test', TagDimension.MOMENTO_DIA, false);
    tag.reassignUser(anotherUserId);
    expect(tag.getUserId()).toBe(anotherUserId);
  });

  it('debe rechazar userId inválido en reassignUser', () => {
    const tag = Tag.create(validId, validUserId, 'Test', TagDimension.MOMENTO_DIA, true);
    expect(() => tag.reassignUser('no-uuid')).toThrow(DomainError);
  });

  it('debe rechazar crear una etiqueta FORMATO que no sea de sistema', () => {
    expect(() => Tag.create(validId, validUserId, 'Caliente', TagDimension.FORMATO, false)).toThrow(DomainError);
  });

  it('debe rechazar cambiar una etiqueta de usuario a FORMATO', () => {
    const tag = Tag.create(validId, validUserId, 'Pasta', TagDimension.TIPO_PLATO, false);
    expect(() => tag.changeDimension(TagDimension.FORMATO)).toThrow(DomainError);
  });

  it('debe rechazar asignar userId a una etiqueta FORMATO', () => {
    const tag = Tag.create(validId, validUserId, 'Caliente', TagDimension.FORMATO, true);
    expect(() => tag.reassignUser(anotherUserId)).toThrow(DomainError);
  });

  it('debe almacenar y devolver systemKey', () => {
    const tag = Tag.create(validId, validUserId, 'Caliente', TagDimension.FORMATO, true, 'CALIENTE');
    expect(tag.getSystemKey()).toBe('CALIENTE');
  });

  it('debe tener systemKey null por defecto', () => {
    const tag = Tag.create(validId, validUserId, 'Test', TagDimension.TIPO_PLATO, false);
    expect(tag.getSystemKey()).toBeNull();
  });

  it('debe rechazar rename si tiene systemKey', () => {
    const tag = Tag.create(validId, validUserId, 'Caliente', TagDimension.FORMATO, true, 'CALIENTE');
    expect(() => tag.rename('Plato caliente')).toThrow(DomainError);
  });

  it('debe permitir rename si no tiene systemKey aunque sea sistema', () => {
    const tag = Tag.create(validId, validUserId, 'Vegano', TagDimension.ESTILOS_VIDA, true);
    tag.rename('Veggie');
    expect(tag.getName()).toBe('Veggie');
  });

  it('debe serializar systemKey en primitivas', () => {
    const tag = Tag.create(validId, validUserId, 'Frío', TagDimension.FORMATO, true, 'FRIO');
    expect(tag.toPrimitives()).toMatchObject({ systemKey: 'FRIO' });
  });

  it('debe restaurar systemKey desde primitivas', () => {
    const tag = Tag.create(validId, validUserId, 'Frío', TagDimension.FORMATO, true, 'FRIO');
    const restored = Tag.fromPrimitives(tag.toPrimitives());
    expect(restored.getSystemKey()).toBe('FRIO');
  });

  it('debe tolerar primitivas antiguas sin systemKey', () => {
    const restored = Tag.fromPrimitives({
      id: validId,
      userId: validUserId,
      name: 'Frío',
      dimension: TagDimension.FORMATO,
      isSystem: true,
    });
    expect(restored.getSystemKey()).toBeNull();
  });
});
