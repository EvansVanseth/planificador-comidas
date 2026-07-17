import { describe, it, expect, beforeEach } from 'vitest';
import { UpdatePlanningUseCase } from './update-planning.use-case';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { AppError } from '../shared/errors/app-error';

describe('UpdatePlanningUseCase', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';
  const validUserId = '550e8400-e29b-41d4-a716-446655440001';

  let useCase: UpdatePlanningUseCase;
  let repo: InMemoryPlanningRepository;

  beforeEach(async () => {
    repo = new InMemoryPlanningRepository();
    useCase = new UpdatePlanningUseCase(repo);
    await repo.save(Planning.create(validId, validUserId, 'Original', null, 2));
  });

  it('debe actualizar el nombre', async () => {
    await useCase.execute({ id: validId, name: 'Renombrada' });
    expect((await repo.findById(validId))!.getName()).toBe('Renombrada');
  });

  it('debe actualizar startDate', async () => {
    const date = new Date(2026, 5, 29);
    await useCase.execute({ id: validId, startDate: date });
    expect((await repo.findById(validId))!.getStartDate()).toEqual(date);
  });

  it('debe actualizar startDate a null', async () => {
    await useCase.execute({ id: validId, startDate: null });
    expect((await repo.findById(validId))!.getStartDate()).toBeNull();
  });

  it('debe actualizar weeks', async () => {
    await useCase.execute({ id: validId, weeks: 4 });
    expect((await repo.findById(validId))!.getWeeks()).toBe(4);
  });

  it('debe lanzar error si el planning no existe', async () => {
    await expect(useCase.execute({ id: '550e8400-e29b-41d4-a716-446655449999', name: 'X' })).rejects.toThrow(AppError);
  });

  it('debe rechazar renombrar a un nombre duplicado', async () => {
    const otherId = '550e8400-e29b-41d4-a716-446655440010';
    await repo.save(Planning.create(otherId, validUserId, 'Existente', null, 2));
    await expect(useCase.execute({ id: validId, name: 'Existente' })).rejects.toThrow(AppError);
  });

  it('debe rechazar renombrar a un nombre duplicado ignorando mayúsculas', async () => {
    const otherId = '550e8400-e29b-41d4-a716-446655440010';
    await repo.save(Planning.create(otherId, validUserId, 'Existente', null, 2));
    await expect(useCase.execute({ id: validId, name: 'existente' })).rejects.toThrow(AppError);
  });

  it('debe permitir mantener el mismo nombre al actualizar', async () => {
    await useCase.execute({ id: validId, name: 'Original' });
    expect((await repo.findById(validId))!.getName()).toBe('Original');
  });
});
