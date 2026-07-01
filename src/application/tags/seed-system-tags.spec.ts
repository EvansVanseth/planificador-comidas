import { describe, it, expect, beforeEach } from 'vitest';
import { seedSystemTags } from './seed-system-tags';
import { InMemoryTagRepository } from '@/infrastructure/repositories/in-memory-tag.repository';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';

describe('seedSystemTags', () => {
  let repo: InMemoryTagRepository;

  beforeEach(() => {
    repo = new InMemoryTagRepository();
  });

  it('debe crear las 15 etiquetas de sistema si no hay ninguna', () => {
    seedSystemTags(repo);

    const all = repo.findAll();
    const systemTags = all.filter(t => t.getUserId() === null);
    expect(systemTags).toHaveLength(15);

    const momentos = systemTags.filter(t => t.getDimension() === TagDimension.MOMENTO_DIA);
    expect(momentos).toHaveLength(3);
    expect(momentos.map(t => t.getName())).toEqual(
      expect.arrayContaining(['Desayuno', 'Comida', 'Cena'])
    );

    const formatos = systemTags.filter(t => t.getDimension() === TagDimension.FORMATO);
    expect(formatos).toHaveLength(2);
    expect(formatos.map(t => t.getName())).toEqual(
      expect.arrayContaining(['Caliente', 'Frio'])
    );

    const tipos = systemTags.filter(t => t.getDimension() === TagDimension.TIPO_PLATO);
    expect(tipos).toHaveLength(7);

    const estilos = systemTags.filter(t => t.getDimension() === TagDimension.ESTILOS_VIDA);
    expect(estilos).toHaveLength(3);
  });

  it('no debe duplicar etiquetas si ya existen las de sistema', () => {
    seedSystemTags(repo);
    expect(repo.findAll().filter(t => t.getUserId() === null)).toHaveLength(15);

    seedSystemTags(repo);
    expect(repo.findAll().filter(t => t.getUserId() === null)).toHaveLength(15);
  });

  it('debe crear etiquetas de sistema incluso si ya hay etiquetas de usuario', () => {
    const userTag = Tag.create(
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
      'Mi etiqueta',
      TagDimension.TIPO_PLATO,
    );
    repo.save(userTag);

    seedSystemTags(repo);

    const systemTags = repo.findAll().filter(t => t.getUserId() === null);
    expect(systemTags).toHaveLength(15);
    expect(repo.findAll()).toHaveLength(16);
  });

  it('cada etiqueta de sistema debe tener userId null', () => {
    seedSystemTags(repo);

    const systemTags = repo.findAll().filter(t => t.getUserId() === null);
    expect(systemTags).toHaveLength(15);
    for (const tag of systemTags) {
      expect(tag.getUserId()).toBeNull();
    }
  });
});
