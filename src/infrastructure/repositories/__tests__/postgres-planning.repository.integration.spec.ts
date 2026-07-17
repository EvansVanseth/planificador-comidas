import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PostgresPlanningRepository } from '../postgres-planning.repository';
import { PostgresTagRepository } from '../postgres-tag.repository';
import { PostgresIngredientRepository } from '../postgres-ingredient.repository';
import { PostgresRecipeRepository } from '../postgres-recipe.repository';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { Ingredient } from '@/domain/ingredients/aggregates/ingredient.aggregate';
import { Recipe } from '@/domain/recipes/aggregates/recipe.aggregate';
import { testPrisma, cleanDb, connectTestDb, disconnectTestDb, seedTestUser, TEST_USER_ID } from './postgres-test-helper';

describe('PostgresPlanningRepository (integration)', () => {
  const userId = TEST_USER_ID;
  const planningId = '550e8400-e29b-41d4-a716-446655440010';
  const momentTagId = '550e8400-e29b-41d4-a716-446655440020';
  const formatoTagId = '550e8400-e29b-41d4-a716-446655440021';
  const tipoTagId = '550e8400-e29b-41d4-a716-446655440022';
  const ingredientId = '550e8400-e29b-41d4-a716-446655440030';
  const recipeId = '550e8400-e29b-41d4-a716-446655440040';
  const dayId = '550e8400-e29b-41d4-a716-446655440050';
  const pantryId = '550e8400-e29b-41d4-a716-446655440060';
  const shoppingId = '550e8400-e29b-41d4-a716-446655440070';
  const otherUserId = '550e8400-e29b-41d4-a716-446655449999';

  let repo: PostgresPlanningRepository;
  let tagRepo: PostgresTagRepository;
  let ingredientRepo: PostgresIngredientRepository;
  let recipeRepo: PostgresRecipeRepository;

  const defaultTags = () => [
    { id: momentTagId, dimension: TagDimension.MOMENTO_DIA },
    { id: formatoTagId, dimension: TagDimension.FORMATO },
    { id: tipoTagId, dimension: TagDimension.TIPO_PLATO },
  ];

  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await cleanDb();
    await seedTestUser();
    repo = new PostgresPlanningRepository(testPrisma);
    tagRepo = new PostgresTagRepository(testPrisma);
    ingredientRepo = new PostgresIngredientRepository(testPrisma);
    recipeRepo = new PostgresRecipeRepository(testPrisma);

    await tagRepo.save(Tag.create(momentTagId, userId, 'Desayuno', TagDimension.MOMENTO_DIA, true));
    await tagRepo.save(Tag.create(formatoTagId, userId, 'Caliente', TagDimension.FORMATO, true));
    await tagRepo.save(Tag.create(tipoTagId, userId, 'Carnes', TagDimension.TIPO_PLATO, true));
    await ingredientRepo.save(Ingredient.create(ingredientId, userId, 'Pollo'));
    await recipeRepo.save(Recipe.create(recipeId, userId, 'Pollo asado', 4, 45, null, [], defaultTags()));
  });

  it('debe guardar y recuperar una planificación por id', async () => {
    const planning = Planning.create(planningId, userId, 'Semana 1', new Date('2026-01-05'), 1);
    await repo.save(planning);
    const found = await repo.findById(planningId);
    expect(found).not.toBeNull();
    expect(found!.getId()).toBe(planningId);
    expect(found!.getName()).toBe('Semana 1');
  });

  it('debe devolver null si no existe', async () => {
    const found = await repo.findById(planningId);
    expect(found).toBeNull();
  });

  it('debe listar todas las planificaciones', async () => {
    await repo.save(Planning.create(planningId, userId, 'Planning 1', null, 1));
    const id2 = '550e8400-e29b-41d4-a716-446655440002';
    await repo.save(Planning.create(id2, userId, 'Planning 2', null, 2));
    expect(await repo.findAll()).toHaveLength(2);
  });

  it('debe devolver lista vacía si no hay planificaciones', async () => {
    expect(await repo.findAll()).toHaveLength(0);
  });

  it('debe eliminar una planificación por id', async () => {
    await repo.save(Planning.create(planningId, userId, 'Test', null, 1));
    await repo.delete(planningId);
    expect(await repo.findById(planningId)).toBeNull();
  });

  it('debe guardar y recuperar días y servicios', async () => {
    const planning = Planning.create(planningId, userId, 'Semana 1', new Date('2026-01-05'), 1);
    planning.addDay(dayId, 1);
    planning.assignMealToDay(1, momentTagId, 4, recipeId);
    await repo.save(planning);

    const found = await repo.findById(planningId);
    const primitives = found!.toPrimitives();
    expect(primitives.days).toHaveLength(1);
    expect(primitives.days[0].order).toBe(1);
    expect(primitives.days[0].services).toHaveLength(1);
    expect(primitives.days[0].services[0].recipeId).toBe(recipeId);
    expect(primitives.days[0].services[0].covers).toBe(4);
  });

  it('debe guardar y recuperar pantry items', async () => {
    const planning = Planning.create(planningId, userId, 'Semana 1', new Date('2026-01-05'), 1);
    planning.addPantryItem(pantryId, ingredientId);
    await repo.save(planning);

    const found = await repo.findById(planningId);
    const items = found!.getPantryItems();
    expect(items).toHaveLength(1);
    expect(items[0].getIngredientId()).toBe(ingredientId);
    expect(items[0].isAvailable()).toBe(false);
  });

  it('debe guardar y recuperar shopping items', async () => {
    const planning = Planning.create(planningId, userId, 'Semana 1', new Date('2026-01-05'), 1);
    planning.addShoppingItem(shoppingId, ingredientId);
    await repo.save(planning);

    const found = await repo.findById(planningId);
    const items = found!.getShoppingItems();
    expect(items).toHaveLength(1);
    expect(items[0].getIngredientId()).toBe(ingredientId);
    expect(items[0].isCompleted()).toBe(false);
  });

  it('debe actualizar una planificación existente', async () => {
    const planning = Planning.create(planningId, userId, 'Original', null, 1);
    await repo.save(planning);
    planning.rename('Actualizado');
    planning.changeWeeks(2);
    await repo.save(planning);
    const found = await repo.findById(planningId);
    expect(found!.getName()).toBe('Actualizado');
    expect(found!.getWeeks()).toBe(2);
  });

  it('debe filtrar por userId', async () => {
    await repo.save(Planning.create(planningId, userId, 'Mío', null, 1));
    await testPrisma.user.upsert({
      where: { id: otherUserId },
      create: { id: otherUserId, name: 'Other', email: 'other@example.com' },
      update: {},
    });
    await repo.save(Planning.create('550e8400-e29b-41d4-a716-446655440002', otherUserId, 'Otro', null, 1));
    const userPlannings = await repo.findAllByUserId(userId);
    expect(userPlannings).toHaveLength(1);
    expect(userPlannings[0]!.getId()).toBe(planningId);
  });

  it('debe buscar por nombre ignorando mayúsculas', async () => {
    await repo.save(Planning.create(planningId, userId, 'Mi Plan Semanal', null, 1));
    const found = await repo.findByName('mi plan semanal');
    expect(found).not.toBeNull();
    expect(found!.getId()).toBe(planningId);
  });
});
