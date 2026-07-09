import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteRecipeUseCase } from './delete-recipe.use-case';
import { InMemoryRecipeRepository } from '../../infrastructure/repositories/in-memory-recipe.repository';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { Recipe, TagPrimitive } from '@/domain/recipes/aggregates/recipe.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { AppError } from '../shared/errors/app-error';

const defaultTags: TagPrimitive[] = [
  { id: '550e8400-e29b-41d4-a716-446655440100', dimension: TagDimension.MOMENTO_DIA },
  { id: '550e8400-e29b-41d4-a716-446655440101', dimension: TagDimension.FORMATO },
  { id: '550e8400-e29b-41d4-a716-446655440102', dimension: TagDimension.TIPO_PLATO },
];

describe('DeleteRecipeUseCase', () => {
  const recipeId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '550e8400-e29b-41d4-a716-446655440001';

  let useCase: DeleteRecipeUseCase;
  let recipeRepo: InMemoryRecipeRepository;
  let planningRepo: InMemoryPlanningRepository;

  beforeEach(() => {
    recipeRepo = new InMemoryRecipeRepository();
    planningRepo = new InMemoryPlanningRepository();
    useCase = new DeleteRecipeUseCase(recipeRepo, planningRepo);
  });

  it('debe eliminar una receta existente', () => {
    recipeRepo.save(Recipe.create(recipeId, userId, 'Receta', 4, 30, null, [], defaultTags));

    const result = useCase.execute(recipeId);

    expect(recipeRepo.findById(recipeId)).toBeNull();
    expect(result.planningsAffected).toBe(0);
  });

  it('debe lanzar error si la receta no existe', () => {
    expect(() => useCase.execute(recipeId)).toThrow(AppError);
  });

  it('debe desasignar la receta de los servicios de planificacion', () => {
    recipeRepo.save(Recipe.create(recipeId, userId, 'Receta', 4, 30, null, [], defaultTags));

    const planningId = '550e8400-e29b-41d4-a716-446655440010';
    const planning = Planning.create(planningId, userId, 'Semana', null, 1);
    planning.addDay('550e8400-e29b-41d4-a716-446655440020', 1);
    planning.assignMealToDay(1, 'momento-tag', 4, recipeId);
    planningRepo.save(planning);

    const result = useCase.execute(recipeId);

    expect(result.planningsAffected).toBe(1);
    const updated = planningRepo.findById(planningId)!;
    const day = updated.getDay(1);
    expect(day!.services['momento-tag']!.getRecipeId()).toBeNull();
    expect(recipeRepo.findById(recipeId)).toBeNull();
  });
});
