import { describe, it, expect, beforeEach } from 'vitest';
import { CreateTagUseCase } from './create-tag.use-case';
import { InMemoryTagRepository } from '../../infrastructure/repositories/in-memory-tag.repository';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';

describe('CreateTagUseCase', () => {
  let useCase: CreateTagUseCase;
  let repo: InMemoryTagRepository;

  beforeEach(() => {
    repo = new InMemoryTagRepository();
    useCase = new CreateTagUseCase(repo);
  });

  it('debe crear una etiqueta de sistema y devolver un id', () => {
    const id = useCase.execute(null, 'Desayuno', TagDimension.MOMENTO_DIA);
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
    const saved = repo.findById(id);
    expect(saved).not.toBeNull();
    expect(saved!.getName()).toBe('Desayuno');
    expect(saved!.getUserId()).toBeNull();
  });

  it('debe crear una etiqueta de usuario y devolver un id', () => {
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    const id = useCase.execute(userId, 'Vegano', TagDimension.ESTILOS_VIDA);
    const saved = repo.findById(id);
    expect(saved!.getUserId()).toBe(userId);
  });
});
