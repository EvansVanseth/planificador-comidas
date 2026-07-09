import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteTagUseCase } from './delete-tag.use-case';
import { InMemoryTagRepository } from '../../infrastructure/repositories/in-memory-tag.repository';
import { InMemoryRecipeRepository } from '../../infrastructure/repositories/in-memory-recipe.repository';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { Recipe, TagPrimitive } from '@/domain/recipes/aggregates/recipe.aggregate';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { AppError } from '../shared/errors/app-error';

const defaultTags: TagPrimitive[] = [
  { id: '550e8400-e29b-41d4-a716-446655440100', dimension: TagDimension.MOMENTO_DIA },
  { id: '550e8400-e29b-41d4-a716-446655440101', dimension: TagDimension.FORMATO },
  { id: '550e8400-e29b-41d4-a716-446655440102', dimension: TagDimension.TIPO_PLATO },
];

const nonRequiredDim = TagDimension.ESTILOS_VIDA;

describe('DeleteTagUseCase', () => {
  const tagId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';

  let useCase: DeleteTagUseCase;
  let tagRepo: InMemoryTagRepository;
  let recipeRepo: InMemoryRecipeRepository;
  let planningRepo: InMemoryPlanningRepository;

  beforeEach(() => {
    tagRepo = new InMemoryTagRepository();
    recipeRepo = new InMemoryRecipeRepository();
    planningRepo = new InMemoryPlanningRepository();
    useCase = new DeleteTagUseCase(tagRepo, recipeRepo, planningRepo);
  });

  it('debe eliminar una etiqueta de usuario existente', () => {
    const tag = Tag.create(tagId, userId, 'Test', nonRequiredDim, false);
    tagRepo.save(tag);

    const result = useCase.execute(tagId);

    expect(tagRepo.findById(tagId)).toBeNull();
    expect(result.recipesAffected).toBe(0);
    expect(result.planningsAffected).toBe(0);
    expect(result.servicesRemoved).toBe(0);
  });

  it('debe lanzar error si la etiqueta no existe', () => {
    expect(() => useCase.execute(tagId)).toThrow(AppError);
  });

  it('debe rechazar eliminar una etiqueta del sistema', () => {
    const tag = Tag.create(tagId, userId, 'Desayuno', TagDimension.MOMENTO_DIA, true);
    tagRepo.save(tag);

    expect(() => useCase.execute(tagId)).toThrow(AppError);
    expect(tagRepo.findById(tagId)).not.toBeNull();
  });

  it('debe limpiar la etiqueta de las recetas que la usan', () => {
    const tag = Tag.create(tagId, userId, 'Test', nonRequiredDim, false);
    tagRepo.save(tag);

    const recipeId1 = '550e8400-e29b-41d4-a716-446655440010';
    const recipeId2 = '550e8400-e29b-41d4-a716-446655440011';
    const recipeTags: TagPrimitive[] = [
      ...defaultTags,
      { id: tagId, dimension: nonRequiredDim },
    ];
    const recipe1 = Recipe.create(recipeId1, userId, 'Receta 1', 4, 30, 'Preparacion', [], recipeTags);
    recipeRepo.save(recipe1);
    const recipe2 = Recipe.create(recipeId2, userId, 'Receta 2', 2, 15, null, [], recipeTags);
    recipeRepo.save(recipe2);

    const result = useCase.execute(tagId);

    expect(result.recipesAffected).toBe(2);
    expect(recipeRepo.findById(recipeId1)!.getTagIds()).not.toContain(tagId);
    expect(recipeRepo.findById(recipeId2)!.getTagIds()).not.toContain(tagId);
    expect(tagRepo.findById(tagId)).toBeNull();
  });

  it('debe bloquear la eliminacion si la etiqueta es la unica de una dimension requerida', () => {
    const momentoId = '550e8400-e29b-41d4-a716-446655440050';
    const tagMomento = Tag.create(momentoId, userId, 'MiMomento', TagDimension.MOMENTO_DIA, false);
    tagRepo.save(tagMomento);

    const recipeId = '550e8400-e29b-41d4-a716-446655440010';
    const recipe = Recipe.create(recipeId, userId, 'Receta', 4, 30, null, [], [
      { id: momentoId, dimension: TagDimension.MOMENTO_DIA },
      { id: '550e8400-e29b-41d4-a716-446655440101', dimension: TagDimension.FORMATO },
      { id: '550e8400-e29b-41d4-a716-446655440102', dimension: TagDimension.TIPO_PLATO },
    ]);
    recipeRepo.save(recipe);

    expect(() => useCase.execute(momentoId)).toThrow(AppError);
    expect(tagRepo.findById(momentoId)).not.toBeNull();
    expect(recipeRepo.findById(recipeId)!.getTagIds()).toContain(momentoId);
  });

  it('debe eliminar servicios de planificacion completos si la etiqueta es MOMENTO_DIA', () => {
    const momentoId = '550e8400-e29b-41d4-a716-446655440050';
    const tagMomento = Tag.create(momentoId, userId, 'MiMomento', TagDimension.MOMENTO_DIA, false);
    tagRepo.save(tagMomento);

    const planningId = '550e8400-e29b-41d4-a716-446655440010';
    const planning = Planning.create(planningId, userId, 'Semana', null, 1);
    planning.addDay('550e8400-e29b-41d4-a716-446655440020', 1);
    planning.assignMealToDay(1, momentoId, 4);
    planningRepo.save(planning);

    const result = useCase.execute(momentoId);

    expect(result.servicesRemoved).toBe(1);
    expect(result.planningsAffected).toBe(1);
    const updated = planningRepo.findById(planningId)!;
    const day = updated.getDay(1);
    expect(day!.services[momentoId]).toBeUndefined();
    expect(tagRepo.findById(momentoId)).toBeNull();
  });

  it('debe limpiar referencias en planificaciones para etiquetas no MOMENTO_DIA', () => {
    const tag = Tag.create(tagId, userId, 'Test', nonRequiredDim, false);
    tagRepo.save(tag);

    const planningId = '550e8400-e29b-41d4-a716-446655440010';
    const planning = Planning.create(planningId, userId, 'Semana', null, 1);
    planning.addDay('550e8400-e29b-41d4-a716-446655440020', 1);
    planning.assignMealToDay(1, 'moment-tag', 4, undefined, [tagId], [tagId]);
    planningRepo.save(planning);

    const result = useCase.execute(tagId);

    expect(result.servicesRemoved).toBe(0);
    expect(result.planningsAffected).toBe(1);
    const updated = planningRepo.findById(planningId)!;
    const day = updated.getDay(1);
    const service = day!.services['moment-tag'];
    expect(service!.getExclusions()).not.toContain(tagId);
    expect(service!.getPreferences()).not.toContain(tagId);
  });
});
