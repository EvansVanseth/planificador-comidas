import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteUserUseCase } from './delete-user.use-case';
import { InMemoryUserRepository } from '../../infrastructure/repositories/in-memory-user.repository';
import { User } from '@/domain/users/aggregates/user.aggregate';
import { AppError } from '../shared/errors/app-error';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let repo: InMemoryUserRepository;

  beforeEach(() => {
    repo = new InMemoryUserRepository();
    useCase = new DeleteUserUseCase(repo);
  });

  it('debe eliminar un usuario existente', () => {
    const user = User.create('550e8400-e29b-41d4-a716-446655440001', 'Alice');
    repo.save(user);

    useCase.execute(user.getId());
    expect(repo.findById(user.getId())).toBeNull();
  });

  it('debe lanzar error si el usuario no existe', () => {
    expect(() => useCase.execute('550e8400-e29b-41d4-a716-446655449999')).toThrow(AppError);
  });
});
