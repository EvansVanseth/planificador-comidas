import { describe, it, expect, beforeEach } from 'vitest';
import { TagOrderMoveUpUseCase } from './tag-order-move-up.use-case';
import { InMemoryTagRepository } from '../../infrastructure/repositories/in-memory-tag.repository';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../shared/errors/app-error';

describe('TagOrderMoveUpUseCase', () => {
  const userId = '550e8400-e29b-41d4-a716-446655440001';

  let useCase: TagOrderMoveUpUseCase;
  let repo: InMemoryTagRepository;

  function seedTag(id: string, name: string, order: number): Tag {
    const tag = Tag.create(id, userId, name, TagDimension.MOMENTO_DIA, true, name.toUpperCase(), order);
    repo.save(tag);
    return tag;
  }

  beforeEach(() => {
    repo = new InMemoryTagRepository();
    useCase = new TagOrderMoveUpUseCase(repo);
  });

  it('debe intercambiar orden con la etiqueta superior', async () => {
    seedTag('550e8400-e29b-41d4-a716-446655440010', 'Desayuno', 1);
    seedTag('550e8400-e29b-41d4-a716-446655440011', 'Comida', 2);
    seedTag('550e8400-e29b-41d4-a716-446655440012', 'Cena', 3);

    await useCase.execute('550e8400-e29b-41d4-a716-446655440012');

    expect((await repo.findById('550e8400-e29b-41d4-a716-446655440012'))!.getOrder()).toBe(2);
    expect((await repo.findById('550e8400-e29b-41d4-a716-446655440011'))!.getOrder()).toBe(3);
    expect((await repo.findById('550e8400-e29b-41d4-a716-446655440010'))!.getOrder()).toBe(1);
  });

  it('debe lanzar error si ya está en primera posición', async () => {
    seedTag('550e8400-e29b-41d4-a716-446655440010', 'Desayuno', 1);
    seedTag('550e8400-e29b-41d4-a716-446655440011', 'Comida', 2);

    await expect(useCase.execute('550e8400-e29b-41d4-a716-446655440010')).rejects.toThrow(AppError);
  });

  it('debe lanzar error si la etiqueta no es MOMENTO_DIA', async () => {
    const tag = Tag.create('550e8400-e29b-41d4-a716-446655440010', userId, 'Vegano', TagDimension.ESTILOS_VIDA, false);
    await repo.save(tag);

    await expect(useCase.execute('550e8400-e29b-41d4-a716-446655440010')).rejects.toThrow(AppError);
  });

  it('debe lanzar error si la etiqueta no existe', async () => {
    await expect(useCase.execute('550e8400-e29b-41d4-a716-446655440099')).rejects.toThrow(AppError);
  });

  it('debe funcionar correctamente en el medio de la lista', async () => {
    seedTag('550e8400-e29b-41d4-a716-446655440010', 'Uno', 1);
    seedTag('550e8400-e29b-41d4-a716-446655440011', 'Dos', 2);
    seedTag('550e8400-e29b-41d4-a716-446655440012', 'Tres', 3);
    seedTag('550e8400-e29b-41d4-a716-446655440013', 'Cuatro', 4);

    await useCase.execute('550e8400-e29b-41d4-a716-446655440012');

    expect((await repo.findById('550e8400-e29b-41d4-a716-446655440010'))!.getOrder()).toBe(1);
    expect((await repo.findById('550e8400-e29b-41d4-a716-446655440011'))!.getOrder()).toBe(3);
    expect((await repo.findById('550e8400-e29b-41d4-a716-446655440012'))!.getOrder()).toBe(2);
    expect((await repo.findById('550e8400-e29b-41d4-a716-446655440013'))!.getOrder()).toBe(4);
  });
});
