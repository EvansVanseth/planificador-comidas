import { describe, it, expect, beforeEach } from 'vitest';
import { seedSystemTags } from './seed-system-tags';
import { InMemoryTagRepository } from '@/infrastructure/repositories/in-memory-tag.repository';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';

describe('seedSystemTags', () => {
  const userId = '550e8400-e29b-41d4-a716-446655440001';

  let repo: InMemoryTagRepository;

  beforeEach(() => {
    repo = new InMemoryTagRepository();
  });

  it('debe crear las 15 etiquetas de sistema si no hay ninguna', async () => {
    await seedSystemTags(repo, userId);

    const all = await repo.findAll();
    const systemTags = all.filter(t => t.isSystemTag());
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

  it('no debe duplicar etiquetas si ya existen las de sistema', async () => {
    await seedSystemTags(repo, userId);
    expect((await repo.findAll()).filter(t => t.isSystemTag())).toHaveLength(15);

    await seedSystemTags(repo, userId);
    expect((await repo.findAll()).filter(t => t.isSystemTag())).toHaveLength(15);
  });

  it('debe crear etiquetas de sistema incluso si ya hay etiquetas de usuario', async () => {
    const userTag = Tag.create(
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
      'Mi etiqueta',
      TagDimension.TIPO_PLATO,
      false,
    );
    await repo.save(userTag);

    await seedSystemTags(repo, userId);

    const all = await repo.findAll();
    const systemTags = all.filter(t => t.isSystemTag());
    expect(systemTags).toHaveLength(15);
    expect(all).toHaveLength(16);
  });

  it('cada etiqueta de sistema debe tener isSystem=true', async () => {
    await seedSystemTags(repo, userId);

    const systemTags = (await repo.findAll()).filter(t => t.isSystemTag());
    expect(systemTags).toHaveLength(15);
    for (const tag of systemTags) {
      expect(tag.isSystemTag()).toBe(true);
    }
  });

  it('debe asignar ordenes contiguos a MOMENTO_DIA de datos antiguos (order=0)', async () => {
    const desayuno = Tag.create(
      '550e8400-e29b-41d4-a716-446655440010', userId, 'Desayuno', TagDimension.MOMENTO_DIA, true, 'DESAYUNO', 0,
    );
    const comida = Tag.create(
      '550e8400-e29b-41d4-a716-446655440011', userId, 'Comida', TagDimension.MOMENTO_DIA, true, 'COMIDA', 0,
    );
    const cena = Tag.create(
      '550e8400-e29b-41d4-a716-446655440012', userId, 'Cena', TagDimension.MOMENTO_DIA, true, 'CENA', 0,
    );
    const almuerzo = Tag.create(
      '550e8400-e29b-41d4-a716-446655440013', userId, 'Almuerzo', TagDimension.MOMENTO_DIA, false, undefined, 0,
    );
    await repo.save(desayuno);
    await repo.save(comida);
    await repo.save(cena);
    await repo.save(almuerzo);

    await seedSystemTags(repo, userId);

    const all = await repo.findAll();
    const momentos = all
      .filter(t => t.getDimension() === TagDimension.MOMENTO_DIA)
      .sort((a, b) => a.getOrder() - b.getOrder());

    expect(momentos).toHaveLength(4);
    expect(momentos[0].getName()).toBe('Desayuno');
    expect(momentos[0].getOrder()).toBe(1);
    expect(momentos[1].getName()).toBe('Comida');
    expect(momentos[1].getOrder()).toBe(2);
    expect(momentos[2].getName()).toBe('Cena');
    expect(momentos[2].getOrder()).toBe(3);
    expect(momentos[3].getName()).toBe('Almuerzo');
    expect(momentos[3].getOrder()).toBe(4);
  });

  it('no debe reasignar ordenes si ya tienen valores no cero', async () => {
    const desayuno = Tag.create(
      '550e8400-e29b-41d4-a716-446655440010', userId, 'Desayuno', TagDimension.MOMENTO_DIA, true, 'DESAYUNO', 1,
    );
    const almuerzo = Tag.create(
      '550e8400-e29b-41d4-a716-446655440013', userId, 'Almuerzo', TagDimension.MOMENTO_DIA, false, undefined, 5,
    );
    await repo.save(desayuno);
    await repo.save(almuerzo);

    await seedSystemTags(repo, userId);

    expect((await repo.findById('550e8400-e29b-41d4-a716-446655440010'))!.getOrder()).toBe(1);
    expect((await repo.findById('550e8400-e29b-41d4-a716-446655440013'))!.getOrder()).toBe(5);
  });
});
