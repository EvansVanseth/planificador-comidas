import { describe, it, expect, beforeEach } from 'vitest';
import { CreateTagUseCase } from './create-tag.use-case';
import { InMemoryTagRepository } from '../../infrastructure/repositories/in-memory-tag.repository';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../shared/errors/app-error';
import { DomainError } from '@/domain/shared/errors/domain-error';

describe('CreateTagUseCase', () => {
  const systemUserId = '550e8400-e29b-41d4-a716-446655449999';

  let useCase: CreateTagUseCase;
  let repo: InMemoryTagRepository;

  beforeEach(() => {
    repo = new InMemoryTagRepository();
    useCase = new CreateTagUseCase(repo);
  });

  it('debe crear una etiqueta de sistema y devolver un id', async () => {
    const id = await useCase.execute(systemUserId, 'Desayuno', TagDimension.MOMENTO_DIA, true);
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
    const saved = await repo.findById(id);
    expect(saved).not.toBeNull();
    expect(saved!.getName()).toBe('Desayuno');
    expect(saved!.isSystemTag()).toBe(true);
  });

  it('debe crear una etiqueta de usuario y devolver un id', async () => {
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    const id = await useCase.execute(userId, 'Vegano', TagDimension.ESTILOS_VIDA);
    const saved = await repo.findById(id);
    expect(saved!.getUserId()).toBe(userId);
  });

  it('debe rechazar nombre duplicado en la misma dimensión', async () => {
    await useCase.execute(systemUserId, 'Pasta', TagDimension.TIPO_PLATO, true);
    await expect(useCase.execute(systemUserId, 'Pasta', TagDimension.TIPO_PLATO, true)).rejects.toThrow(AppError);
  });

  it('debe rechazar nombre duplicado ignorando mayúsculas', async () => {
    await useCase.execute(systemUserId, 'Pasta', TagDimension.TIPO_PLATO, true);
    await expect(useCase.execute(systemUserId, 'pasta', TagDimension.TIPO_PLATO, true)).rejects.toThrow(AppError);
  });

  it('debe permitir mismo nombre en distinta dimensión', async () => {
    await useCase.execute(systemUserId, 'Pasta', TagDimension.TIPO_PLATO, true);
    await expect(useCase.execute(systemUserId, 'Pasta', TagDimension.MOMENTO_DIA, true)).resolves.not.toThrow();
  });

  it('debe rechazar crear etiqueta FORMATO que no sea de sistema', async () => {
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    await expect(useCase.execute(userId, 'Caliente', TagDimension.FORMATO, false)).rejects.toThrow(DomainError);
  });

  it('debe asignar orden 1 a la primera etiqueta MOMENTO_DIA', async () => {
    const id = await useCase.execute(systemUserId, 'Desayuno', TagDimension.MOMENTO_DIA, true);
    const saved = await repo.findById(id);
    expect(saved!.getOrder()).toBe(1);
  });

  it('debe asignar max+1 a una nueva etiqueta MOMENTO_DIA', async () => {
    const seeds: Array<[string, number]> = [
      ['Desayuno', 1],
      ['Comida', 2],
      ['Cena', 3],
    ];
    const seedIds = [
      '550e8400-e29b-41d4-a716-446655441001',
      '550e8400-e29b-41d4-a716-446655441002',
      '550e8400-e29b-41d4-a716-446655441003',
    ];
    for (let i = 0; i < seeds.length; i++) {
      const [name, order] = seeds[i];
      const tag = Tag.create(
        seedIds[i],
        systemUserId,
        name,
        TagDimension.MOMENTO_DIA,
        true,
        undefined,
        order,
      );
      await repo.save(tag);
    }

    const id = await useCase.execute(systemUserId, 'Merienda', TagDimension.MOMENTO_DIA);
    const saved = await repo.findById(id);
    expect(saved!.getOrder()).toBe(4);
  });

  it('no debe reordenar etiquetas existentes al crear una MOMENTO_DIA', async () => {
    const tag = Tag.create(crypto.randomUUID(), systemUserId, 'Desayuno', TagDimension.MOMENTO_DIA, true, undefined, 1);
    await repo.save(tag);

    const id = await useCase.execute(systemUserId, 'Comida', TagDimension.MOMENTO_DIA);
    const saved = await repo.findById(id);
    expect(saved!.getOrder()).toBe(2);

    const existing = await repo.findById(tag.getId());
    expect(existing!.getOrder()).toBe(1);
  });

  it('no debe aplicar lógica de orden a otras dimensiones', async () => {
    const id = await useCase.execute(systemUserId, 'Vegano', TagDimension.ESTILOS_VIDA);
    const saved = await repo.findById(id);
    expect(saved!.getOrder()).toBe(0);
  });
});
