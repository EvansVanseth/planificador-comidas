import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PostgresUserRepository } from '../postgres-user.repository';
import { User } from '@/domain/users/aggregates/user.aggregate';
import { testPrisma, cleanDb, connectTestDb, disconnectTestDb, seedTestUser, TEST_USER_ID } from './postgres-test-helper';

describe('PostgresUserRepository (integration)', () => {
  const validId = TEST_USER_ID;

  let repo: PostgresUserRepository;

  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await cleanDb();
    repo = new PostgresUserRepository(testPrisma);
  });

  it('debe guardar y recuperar un usuario por id', async () => {
    const user = User.create(validId, 'Albus', 'albus@example.com');
    await repo.save(user);
    const found = await repo.findById(validId);
    expect(found).not.toBeNull();
    expect(found!.getId()).toBe(validId);
    expect(found!.getName()).toBe('Albus');
    expect(found!.getEmail()).toBe('albus@example.com');
  });

  it('debe devolver null si no existe el usuario', async () => {
    const found = await repo.findById(validId);
    expect(found).toBeNull();
  });

  it('debe listar todos los usuarios', async () => {
    await repo.save(User.create(validId, 'Albus', 'albus@example.com'));
    const id2 = '550e8400-e29b-41d4-a716-446655440002';
    await repo.save(User.create(id2, 'Ana', 'ana@example.com'));
    expect(await repo.findAll()).toHaveLength(2);
  });

  it('debe devolver lista vacía si no hay usuarios', async () => {
    expect(await repo.findAll()).toHaveLength(0);
  });

  it('debe eliminar un usuario por id', async () => {
    await repo.save(User.create(validId, 'Albus', 'albus@example.com'));
    await repo.delete(validId);
    expect(await repo.findById(validId)).toBeNull();
  });

  it('debe actualizar un usuario existente', async () => {
    const user = User.create(validId, 'Albus', 'albus@example.com');
    await repo.save(user);
    user.rename('Albus Dumbledore');
    await repo.save(user);
    const found = await repo.findById(validId);
    expect(found!.getName()).toBe('Albus Dumbledore');
  });

  it('debe buscar por nombre ignorando mayúsculas', async () => {
    await repo.save(User.create(validId, 'Albus', 'albus@example.com'));
    const found = await repo.findByName('albus');
    expect(found).not.toBeNull();
    expect(found!.getId()).toBe(validId);
  });

  it('debe buscar por email ignorando mayúsculas', async () => {
    await repo.save(User.create(validId, 'Albus', 'Albus@Example.com'));
    const found = await repo.findByEmail('albus@example.com');
    expect(found).not.toBeNull();
    expect(found!.getId()).toBe(validId);
  });

  it('debe devolver null si no existe el nombre', async () => {
    const found = await repo.findByName('Inexistente');
    expect(found).toBeNull();
  });

  it('debe devolver null si no existe el email', async () => {
    const found = await repo.findByEmail('no@existe.com');
    expect(found).toBeNull();
  });
});
