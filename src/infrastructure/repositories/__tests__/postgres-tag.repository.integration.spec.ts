import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PostgresTagRepository } from '../postgres-tag.repository';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { testPrisma, cleanDb, connectTestDb, disconnectTestDb, seedTestUser, TEST_USER_ID } from './postgres-test-helper';

describe('PostgresTagRepository (integration)', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';
  const validUserId = TEST_USER_ID;

  let repo: PostgresTagRepository;

  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await cleanDb();
    await seedTestUser();
    repo = new PostgresTagRepository(testPrisma);
  });

  it('debe guardar y recuperar una etiqueta por id', async () => {
    const tag = Tag.create(validId, validUserId, 'Vegano', TagDimension.ESTILOS_VIDA, false);
    await repo.save(tag);
    const found = await repo.findById(validId);
    expect(found).not.toBeNull();
    expect(found!.getId()).toBe(validId);
  });

  it('debe devolver null si no existe la etiqueta', async () => {
    const found = await repo.findById(validId);
    expect(found).toBeNull();
  });

  it('debe listar todas las etiquetas', async () => {
    const tag1 = Tag.create(validId, validUserId, 'Desayuno', TagDimension.MOMENTO_DIA, true);
    const tag2 = Tag.create('550e8400-e29b-41d4-a716-446655440002', validUserId, 'Cena', TagDimension.MOMENTO_DIA, true);
    await repo.save(tag1);
    await repo.save(tag2);
    expect(await repo.findAll()).toHaveLength(2);
  });

  it('debe devolver lista vacía si no hay etiquetas', async () => {
    expect(await repo.findAll()).toHaveLength(0);
  });

  it('debe eliminar una etiqueta por id', async () => {
    const tag = Tag.create(validId, validUserId, 'Frío', TagDimension.FORMATO, true);
    await repo.save(tag);
    await repo.delete(validId);
    expect(await repo.findById(validId)).toBeNull();
  });

  it('debe actualizar una etiqueta existente al guardar con el mismo id', async () => {
    const tag = Tag.create(validId, validUserId, 'Original', TagDimension.MOMENTO_DIA, true);
    await repo.save(tag);
    tag.rename('Actualizado');
    await repo.save(tag);
    const found = await repo.findById(validId);
    expect(found!.getName()).toBe('Actualizado');
  });

  it('debe buscar por nombre y dimensión', async () => {
    await repo.save(Tag.create(validId, validUserId, 'Desayuno', TagDimension.MOMENTO_DIA, true));
    const found = await repo.findByNameAndDimension('Desayuno', TagDimension.MOMENTO_DIA);
    expect(found).not.toBeNull();
    expect(found!.getId()).toBe(validId);
  });

  it('debe buscar ignorando mayúsculas', async () => {
    await repo.save(Tag.create(validId, validUserId, 'Desayuno', TagDimension.MOMENTO_DIA, true));
    const found = await repo.findByNameAndDimension('desayuno', TagDimension.MOMENTO_DIA);
    expect(found).not.toBeNull();
  });

  it('debe devolver null si no coincide la dimensión', async () => {
    await repo.save(Tag.create(validId, validUserId, 'Desayuno', TagDimension.MOMENTO_DIA, true));
    const found = await repo.findByNameAndDimension('Desayuno', TagDimension.TIPO_PLATO);
    expect(found).toBeNull();
  });

  it('debe devolver null si no existe el nombre', async () => {
    const found = await repo.findByNameAndDimension('Inexistente', TagDimension.MOMENTO_DIA);
    expect(found).toBeNull();
  });

  it('debe filtrar por userId', async () => {
    await repo.save(Tag.create(validId, validUserId, 'Tag1', TagDimension.MOMENTO_DIA, true));
    const otherUserId = '550e8400-e29b-41d4-a716-446655449999';
    await testPrisma.user.create({
      data: { id: otherUserId, name: 'Other', email: 'other@example.com' },
    });
    await repo.save(Tag.create('550e8400-e29b-41d4-a716-446655440002', otherUserId, 'Tag2', TagDimension.ESTILOS_VIDA, false));
    const userTags = await repo.findAllByUserId(validUserId);
    expect(userTags).toHaveLength(1);
    expect(userTags[0]!.getId()).toBe(validId);
  });

  it('debe persistir systemKey', async () => {
    const tag = Tag.create(validId, validUserId, 'Caliente', TagDimension.FORMATO, true, 'CALIENTE');
    await repo.save(tag);
    const found = await repo.findById(validId);
    expect(found!.getName()).toBe('Caliente');
  });
});
