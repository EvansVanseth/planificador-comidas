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
    const tag = Tag.create(validId, validUserId, 'Vegano', TagDimension.ESTILOS_VIDA);
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
    const tag1 = Tag.create(validId, null, 'Desayuno', TagDimension.MOMENTO_DIA);
    const tag2 = Tag.create('550e8400-e29b-41d4-a716-446655440002', null, 'Cena', TagDimension.MOMENTO_DIA);
    repo.save(tag1);
    repo.save(tag2);
    expect(repo.findAll()).toHaveLength(2);
  });

  it('debe devolver lista vacía si no hay etiquetas', () => {
    expect(repo.findAll()).toHaveLength(0);
  });

  it('debe eliminar una etiqueta por id', () => {
    const tag = Tag.create(validId, null, 'Frío', TagDimension.FORMATO);
    repo.save(tag);
    repo.delete(validId);
    expect(repo.findById(validId)).toBeNull();
  });

  it('debe actualizar una etiqueta existente al guardar con el mismo id', () => {
    const tag = Tag.create(validId, null, 'Original', TagDimension.MOMENTO_DIA);
    repo.save(tag);
    tag.rename('Actualizado');
    repo.save(tag);
    const found = repo.findById(validId);
    expect(found!.getName()).toBe('Actualizado');
  });
});
