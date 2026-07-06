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

  it('debe crear un usuario y devolver un id', () => {
    const id = useCase.execute('Alice');
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
    const saved = repo.findById(id);
    expect(saved).not.toBeNull();
    expect(saved!.getName()).toBe('Alice');
  });

  it('debe rechazar nombre duplicado', () => {
    useCase.execute('Alice');
    expect(() => useCase.execute('Alice')).toThrow(AppError);
  });

  it('debe rechazar nombre duplicado ignorando mayúsculas', () => {
    useCase.execute('Alice');
    expect(() => useCase.execute('alice')).toThrow(AppError);
  });
});
