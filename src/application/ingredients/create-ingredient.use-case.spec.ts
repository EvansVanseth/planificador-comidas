import { describe, it, expect, beforeEach } from 'vitest';
import { CreateIngredientUseCase } from './create-ingredient.use-case';
import { InMemoryIngredientRepository } from '../../infrastructure/repositories/in-memory-ingredient.repository';
import { AppError } from '../shared/errors/app-error';

describe('CreateIngredientUseCase', () => {
  const validUserId = '550e8400-e29b-41d4-a716-446655440001';

  let useCase: CreateIngredientUseCase;
  let repo: InMemoryIngredientRepository;

  beforeEach(() => {
    repo = new InMemoryIngredientRepository();
    useCase = new CreateIngredientUseCase(repo);
  });

  it('debe crear un ingrediente y devolver un id', () => {
    const id = useCase.execute(validUserId, 'Arroz Integral');
    expect(id).toBeDefined();
    const saved = repo.findById(id);
    expect(saved).not.toBeNull();
    expect(saved!.getName()).toBe('Arroz Integral');
    expect(saved!.getUserId()).toBe(validUserId);
  });

  it('debe rechazar nombre duplicado', () => {
    useCase.execute(validUserId, 'Arroz');
    expect(() => useCase.execute(validUserId, 'Arroz')).toThrow(AppError);
  });

  it('debe rechazar nombre duplicado ignorando mayúsculas', () => {
    useCase.execute(validUserId, 'Arroz');
    expect(() => useCase.execute(validUserId, 'arroz')).toThrow(AppError);
  });
});
