import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateUserUseCase } from './update-user.use-case';
import { InMemoryUserRepository } from '../../infrastructure/repositories/in-memory-user.repository';
import { User } from '@/domain/users/aggregates/user.aggregate';
import { AppError } from '../shared/errors/app-error';

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  let repo: InMemoryUserRepository;

  beforeEach(() => {
    repo = new InMemoryUserRepository();
    useCase = new UpdateUserUseCase(repo);
  });

  it('debe renombrar un usuario', async () => {
    const user = User.create('550e8400-e29b-41d4-a716-446655440001', 'Alice', 'alice@test.com');
    await repo.save(user);

    await useCase.execute({ id: user.getId(), name: 'Alice Updated' });
    const saved = await repo.findById(user.getId());
    expect(saved!.getName()).toBe('Alice Updated');
  });

  it('debe rechazar rename con nombre duplicado', async () => {
    const user1 = User.create('550e8400-e29b-41d4-a716-446655440001', 'Alice', 'alice@test.com');
    const user2 = User.create('550e8400-e29b-41d4-a716-446655440002', 'Bob', 'bob@test.com');
    await repo.save(user1);
    await repo.save(user2);

    await expect(useCase.execute({ id: user1.getId(), name: 'Bob' })).rejects.toThrow(AppError);
  });

  it('debe lanzar error si el usuario no existe', async () => {
    await expect(useCase.execute({ id: '550e8400-e29b-41d4-a716-446655449999', name: 'Ghost' })).rejects.toThrow(AppError);
  });
});
