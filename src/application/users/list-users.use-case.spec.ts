import { describe, it, expect, beforeEach } from 'vitest';
import { ListUsersUseCase } from './list-users.use-case';
import { InMemoryUserRepository } from '../../infrastructure/repositories/in-memory-user.repository';
import { User } from '@/domain/users/aggregates/user.aggregate';

describe('ListUsersUseCase', () => {
  let useCase: ListUsersUseCase;
  let repo: InMemoryUserRepository;

  beforeEach(() => {
    repo = new InMemoryUserRepository();
    useCase = new ListUsersUseCase(repo);
  });

  it('debe devolver lista vacía cuando no hay usuarios', () => {
    const result = useCase.execute();
    expect(result).toEqual([]);
  });

  it('debe devolver todos los usuarios como primitives', () => {
    const user1 = User.create('550e8400-e29b-41d4-a716-446655440001', 'Alice', 'alice@test.com');
    const user2 = User.create('550e8400-e29b-41d4-a716-446655440002', 'Bob', 'bob@test.com');
    repo.save(user1);
    repo.save(user2);

    const result = useCase.execute();
    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        { id: user1.getId(), name: 'Alice', email: 'alice@test.com' },
        { id: user2.getId(), name: 'Bob', email: 'bob@test.com' },
      ])
    );
  });
});
