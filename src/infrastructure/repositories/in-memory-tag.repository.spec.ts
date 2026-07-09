import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryTagRepository } from './in-memory-tag.repository';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';

describe('InMemoryTagRepository', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';
  const validUserId = '550e8400-e29b-41d4-a716-446655440001';

  let repo: InMemoryTagRepository;

  beforeEach(() => {
    repo = new InMemoryTagRepository();
  });

  it('debe guardar y recuperar una etiqueta por id', () => {
    const tag = Tag.create(validId, validUserId, 'Vegano', TagDimension.ESTILOS_VIDA, false);
    repo.save(tag);
    const found = repo.findById(validId);
    expect(found).not.toBeNull();
    expect(found!.getId()).toBe(validId);
  });

  it('debe devolver null si no existe la etiqueta', () => {
    const found = repo.findById(validId);
    expect(found).toBeNull();
  });

  it('debe listar todas las etiquetas', () => {
    const tag1 = Tag.create(validId, validUserId, 'Desayuno', TagDimension.MOMENTO_DIA, true);
    const tag2 = Tag.create('550e8400-e29b-41d4-a716-446655440002', validUserId, 'Cena', TagDimension.MOMENTO_DIA, true);
    repo.save(tag1);
    repo.save(tag2);
    expect(repo.findAll()).toHaveLength(2);
  });

  it('debe devolver lista vacía si no hay etiquetas', () => {
    expect(repo.findAll()).toHaveLength(0);
  });

  it('debe eliminar una etiqueta por id', () => {
    const tag = Tag.create(validId, validUserId, 'Frío', TagDimension.FORMATO, true);
    repo.save(tag);
    repo.delete(validId);
    expect(repo.findById(validId)).toBeNull();
  });

  it('debe actualizar una etiqueta existente al guardar con el mismo id', () => {
    const tag = Tag.create(validId, validUserId, 'Original', TagDimension.MOMENTO_DIA, true);
    repo.save(tag);
    tag.rename('Actualizado');
    repo.save(tag);
    const found = repo.findById(validId);
    expect(found!.getName()).toBe('Actualizado');
  });

  it('debe buscar por nombre y dimensión', () => {
    repo.save(Tag.create(validId, validUserId, 'Desayuno', TagDimension.MOMENTO_DIA, true));
    const found = repo.findByNameAndDimension('Desayuno', TagDimension.MOMENTO_DIA);
    expect(found).not.toBeNull();
    expect(found!.getId()).toBe(validId);
  });

  it('debe buscar ignorando mayúsculas', () => {
    repo.save(Tag.create(validId, validUserId, 'Desayuno', TagDimension.MOMENTO_DIA, true));
    const found = repo.findByNameAndDimension('desayuno', TagDimension.MOMENTO_DIA);
    expect(found).not.toBeNull();
  });

  it('debe devolver null si no coincide la dimensión', () => {
    repo.save(Tag.create(validId, validUserId, 'Desayuno', TagDimension.MOMENTO_DIA, true));
    const found = repo.findByNameAndDimension('Desayuno', TagDimension.TIPO_PLATO);
    expect(found).toBeNull();
  });

  it('debe devolver null si no existe el nombre', () => {
    const found = repo.findByNameAndDimension('Inexistente', TagDimension.MOMENTO_DIA);
    expect(found).toBeNull();
  });
});
