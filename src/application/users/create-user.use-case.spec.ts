import { describe, it, expect, beforeEach } from 'vitest';
import { CreateUserUseCase } from './create-user.use-case';
import { InMemoryUserRepository } from '../../infrastructure/repositories/in-memory-user.repository';
import { AppError } from '../shared/errors/app-error';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let repo: InMemoryUserRepository;

  beforeEach(() => {
    repo = new InMemoryUserRepository();
    useCase = new CreateUserUseCase(repo);
  });

  it('debe crear un usuario y devolver un id', async () => {
    const id = await useCase.execute('Alice');
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
    const saved = await repo.findById(id);
    expect(saved).not.toBeNull();
    expect(saved!.getName()).toBe('Alice');
  });

  it('debe rechazar email duplicado', async () => {
    await useCase.execute('Alice', 'alice@test.com');
    await expect(useCase.execute('Alice2', 'alice@test.com')).rejects.toThrow(AppError);
  });

  it('debe rechazar email duplicado ignorando mayúsculas', async () => {
    await useCase.execute('Alice', 'alice@test.com');
    await expect(useCase.execute('Alice2', 'ALICE@test.com')).rejects.toThrow(AppError);
  });
});
