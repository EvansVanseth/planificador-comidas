import { describe, it, expect, beforeEach } from 'vitest';
import { CreatePlanningUseCase } from './create-planning.use-case';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { AppError } from '../shared/errors/app-error';

describe('CreatePlanningUseCase', () => {
  const validUserId = '550e8400-e29b-41d4-a716-446655440001';

  let useCase: CreatePlanningUseCase;
  let repo: InMemoryPlanningRepository;

  beforeEach(() => {
    repo = new InMemoryPlanningRepository();
    useCase = new CreatePlanningUseCase(repo);
  });

  it('debe crear una planificación y devolver un id', () => {
    const id = useCase.execute(validUserId, 'Semana 1', null, 2);
    expect(id).toBeDefined();
    const saved = repo.findById(id);
    expect(saved).not.toBeNull();
    expect(saved!.getName()).toBe('Semana 1');
    expect(saved!.getUserId()).toBe(validUserId);
  });

  it('debe rechazar nombre duplicado', () => {
    useCase.execute(validUserId, 'Semana 1', null, 2);
    expect(() => useCase.execute(validUserId, 'Semana 1', null, 2)).toThrow(AppError);
  });

  it('debe rechazar nombre duplicado ignorando mayúsculas', () => {
    useCase.execute(validUserId, 'Semana 1', null, 2);
    expect(() => useCase.execute(validUserId, 'semana 1', null, 2)).toThrow(AppError);
  });
});
