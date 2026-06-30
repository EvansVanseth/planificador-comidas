import { describe, it, expect } from 'vitest';
import { Recipe } from './recipe.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { DomainError } from '@/domain/shared/errors/domain-error';

describe('Recipe (Aggregate)', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';
  const validUserId = '550e8400-e29b-41d4-a716-446655440001';
  const tagMomento = '550e8400-e29b-41d4-a716-446655440010';
  const tagFormato = '550e8400-e29b-41d4-a716-446655440011';
  const tagTipo = '550e8400-e29b-41d4-a716-446655440012';
  const tagMomento2 = '550e8400-e29b-41d4-a716-446655440013';

  const defaultTags = [
    { id: tagMomento, dimension: TagDimension.MOMENTO_DIA },
    { id: tagFormato, dimension: TagDimension.FORMATO },
    { id: tagTipo, dimension: TagDimension.TIPO_PLATO },
  ];

  // --- Creación ---

  it('debe crearse con todos los campos obligatorios', () => {
    const recipe = Recipe.create(validId, validUserId, 'Milanesas con Pure', 4, 30, null, [], defaultTags);
    expect(recipe.getId()).toBe(validId);
    expect(recipe.getUserId()).toBe(validUserId);
    expect(recipe.getName()).toBe('Milanesas con Pure');
    expect(recipe.getBaseServings()).toBe(4);
    expect(recipe.getPrepTime()).toBe(30);
    expect(recipe.getPreparation()).toBeNull();
    expect(recipe.getIngredients()).toHaveLength(0);
    expect(recipe.getTagIds()).toHaveLength(3);
  });

  it('debe fallar si falta una etiqueta MOMENTO_DIA', () => {
    const tags = [
      { id: tagFormato, dimension: TagDimension.FORMATO },
      { id: tagTipo, dimension: TagDimension.TIPO_PLATO },
    ];
    expect(() => Recipe.create(validId, validUserId, 'Solo Tipo', 2, 10, null, [], tags))
      .toThrow(DomainError);
  });

  it('debe fallar si falta una etiqueta FORMATO', () => {
    const tags = [
      { id: tagMomento, dimension: TagDimension.MOMENTO_DIA },
      { id: tagTipo, dimension: TagDimension.TIPO_PLATO },
    ];
    expect(() => Recipe.create(validId, validUserId, 'Sin Formato', 2, 10, null, [], tags))
      .toThrow(DomainError);
  });

  it('debe fallar si falta una etiqueta TIPO_PLATO', () => {
    const tags = [
      { id: tagMomento, dimension: TagDimension.MOMENTO_DIA },
      { id: tagFormato, dimension: TagDimension.FORMATO },
    ];
    expect(() => Recipe.create(validId, validUserId, 'Sin Tipo', 2, 10, null, [], tags))
      .toThrow(DomainError);
  });

  it('debe rechazar un id inválido', () => {
    expect(() => Recipe.create('invalido', validUserId, 'Test', 2, 10, null, [], defaultTags))
      .toThrow(DomainError);
  });

  it('debe rechazar comensales base menor a 1', () => {
    expect(() => Recipe.create(validId, validUserId, 'Test', 0, 10, null, [], defaultTags))
      .toThrow(DomainError);
  });

  // --- Mutaciones básicas ---

  it('debe permitir rename', () => {
    const recipe = Recipe.create(validId, validUserId, 'Original', 2, 10, null, [], defaultTags);
    recipe.rename('Renombrada');
    expect(recipe.getName()).toBe('Renombrada');
  });

  it('debe permitir cambiar comensales base', () => {
    const recipe = Recipe.create(validId, validUserId, 'Test', 2, 10, null, [], defaultTags);
    recipe.changeBaseServings(6);
    expect(recipe.getBaseServings()).toBe(6);
  });

  it('debe rechazar comensales base menor a 1 en change', () => {
    const recipe = Recipe.create(validId, validUserId, 'Test', 2, 10, null, [], defaultTags);
    expect(() => recipe.changeBaseServings(0)).toThrow(DomainError);
  });

  it('debe permitir cambiar tiempo de preparación', () => {
    const recipe = Recipe.create(validId, validUserId, 'Test', 2, 10, null, [], defaultTags);
    recipe.changePrepTime(45);
    expect(recipe.getPrepTime()).toBe(45);
  });

  it('debe rechazar tiempo menor a 1 en change', () => {
    const recipe = Recipe.create(validId, validUserId, 'Test', 2, 10, null, [], defaultTags);
    expect(() => recipe.changePrepTime(0)).toThrow(DomainError);
  });

  // --- Tags ---

  it('debe permitir añadir una etiqueta adicional', () => {
    const recipe = Recipe.create(validId, validUserId, 'Test', 2, 10, null, [], defaultTags);
    recipe.addTag(tagMomento2, TagDimension.MOMENTO_DIA);
    expect(recipe.getTagIds()).toHaveLength(4);
  });

  it('debe fallar al añadir una etiqueta duplicada', () => {
    const recipe = Recipe.create(validId, validUserId, 'Test', 2, 10, null, [], defaultTags);
    expect(() => recipe.addTag(tagMomento, TagDimension.MOMENTO_DIA)).toThrow(DomainError);
  });

  it('debe permitir eliminar una etiqueta si queda otra de la misma dimensión', () => {
    const recipe = Recipe.create(validId, validUserId, 'Test', 2, 10, null, [], [
      { id: tagMomento, dimension: TagDimension.MOMENTO_DIA },
      { id: tagMomento2, dimension: TagDimension.MOMENTO_DIA },
      { id: tagFormato, dimension: TagDimension.FORMATO },
      { id: tagTipo, dimension: TagDimension.TIPO_PLATO },
    ]);
    recipe.removeTag(tagMomento);
    expect(recipe.getTagIds()).toHaveLength(3);
  });

  it('debe fallar al eliminar la única etiqueta MOMENTO_DIA', () => {
    const recipe = Recipe.create(validId, validUserId, 'Test', 2, 10, null, [], defaultTags);
    expect(() => recipe.removeTag(tagMomento)).toThrow(DomainError);
  });

  it('debe fallar al eliminar la única etiqueta FORMATO', () => {
    const recipe = Recipe.create(validId, validUserId, 'Test', 2, 10, null, [], defaultTags);
    expect(() => recipe.removeTag(tagFormato)).toThrow(DomainError);
  });

  it('debe fallar al eliminar la única etiqueta TIPO_PLATO', () => {
    const recipe = Recipe.create(validId, validUserId, 'Test', 2, 10, null, [], defaultTags);
    expect(() => recipe.removeTag(tagTipo)).toThrow(DomainError);
  });

  it('debe fallar al eliminar una etiqueta que no existe', () => {
    const recipe = Recipe.create(validId, validUserId, 'Test', 2, 10, null, [], defaultTags);
    expect(() => recipe.removeTag(tagMomento2)).toThrow(DomainError);
  });

  // --- Primitivas ---

  it('debe serializar a primitivas incluyendo dimensiones de tags', () => {
    const recipe = Recipe.create(validId, validUserId, 'Pizza', 4, 45, 'Hornear 30 min', [], defaultTags);
    const primitives = recipe.toPrimitives();
    expect(primitives.id).toBe(validId);
    expect(primitives.userId).toBe(validUserId);
    expect(primitives.baseServings).toBe(4);
    expect(primitives.prepTime).toBe(45);
    expect(primitives.preparation).toBe('Hornear 30 min');
    expect(primitives.ingredients).toEqual([]);
    expect(primitives.tags).toEqual(
      expect.arrayContaining([
        { id: tagMomento, dimension: TagDimension.MOMENTO_DIA },
        { id: tagFormato, dimension: TagDimension.FORMATO },
        { id: tagTipo, dimension: TagDimension.TIPO_PLATO },
      ])
    );
    expect(primitives.tags).toHaveLength(3);
  });

  it('debe restaurar desde primitivas', () => {
    const primitives = {
      id: validId,
      userId: validUserId,
      name: 'Tortilla',
      baseServings: 2,
      prepTime: 15,
      preparation: null,
      ingredients: [],
      tags: [
        { id: tagMomento, dimension: TagDimension.MOMENTO_DIA },
        { id: tagFormato, dimension: TagDimension.FORMATO },
        { id: tagTipo, dimension: TagDimension.TIPO_PLATO },
      ],
    };
    const restored = Recipe.fromPrimitives(primitives);
    expect(restored.getId()).toBe(validId);
    expect(restored.getName()).toBe('Tortilla');
    expect(restored.getTagIds()).toHaveLength(3);
  });

  it('debe mantener integridad en roundtrip', () => {
    const original = Recipe.create(validId, validUserId, 'Ensalada', 2, 10, null, [], defaultTags);
    const primitives = original.toPrimitives();
    const restored = Recipe.fromPrimitives(primitives);
    expect(restored.toPrimitives()).toEqual(primitives);
  });
});
