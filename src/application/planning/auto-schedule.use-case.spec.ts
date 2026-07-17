import { describe, it, expect, beforeEach } from 'vitest';
import { AutoScheduleUseCase } from './auto-schedule.use-case';
import { InMemoryPlanningRepository } from '../../infrastructure/repositories/in-memory-planning.repository';
import { InMemoryRecipeRepository } from '../../infrastructure/repositories/in-memory-recipe.repository';
import { InMemoryTagRepository } from '../../infrastructure/repositories/in-memory-tag.repository';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { Recipe } from '@/domain/recipes/aggregates/recipe.aggregate';
import { AutoPlanner, PlannerInput, PlannerResult } from './ports/auto-planner.interface';
import { AppError } from '../shared/errors/app-error';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';

const USER_ID = '550e8400-e29b-41d4-a716-446655440001';
const PLANNING_ID = 'a0000000-0000-4000-a000-000000000001';
const DESAYUNO_TAG = 'd0000000-0000-4000-a000-000000000001';
const COMIDA_TAG = 'd0000000-0000-4000-a000-000000000002';
const CENA_TAG = 'd0000000-0000-4000-a000-000000000003';
const CALIENTE_TAG = 'd0000000-0000-4000-a000-000000000010';
const FRIA_TAG = 'd0000000-0000-4000-a000-000000000011';
const CARNE_TAG = 'd0000000-0000-4000-a000-000000000020';
const PESCADO_TAG = 'd0000000-0000-4000-a000-000000000021';
const RECIPE_1 = 'b0000000-0000-4000-a000-000000000001';
const RECIPE_2 = 'b0000000-0000-4000-a000-000000000002';

class FakePlanner implements AutoPlanner {
  plan(input: PlannerInput): PlannerResult {
    return {
      assignments: input.slots.map(s => ({
        dayOrder: s.dayOrder,
        momentTagId: s.momentTagId,
        recipeId: RECIPE_1,
      })),
      unassigned: [],
    };
  }
}

function buildRecipe(id: string, name: string, momentTagId: string, formatTagId: string, tipoTagId: string): Recipe {
  return Recipe.create(
    id, USER_ID, name, 4, 30, null, [],
    [
      { id: momentTagId, dimension: TagDimension.MOMENTO_DIA },
      { id: formatTagId, dimension: TagDimension.FORMATO },
      { id: tipoTagId, dimension: TagDimension.TIPO_PLATO },
    ],
  );
}

describe('AutoScheduleUseCase', () => {
  let useCase: AutoScheduleUseCase;
  let planningRepo: InMemoryPlanningRepository;
  let recipeRepo: InMemoryRecipeRepository;
  let tagRepo: InMemoryTagRepository;
  let planner: FakePlanner;

  beforeEach(() => {
    planningRepo = new InMemoryPlanningRepository();
    recipeRepo = new InMemoryRecipeRepository();
    tagRepo = new InMemoryTagRepository();
    planner = new FakePlanner();
    useCase = new AutoScheduleUseCase(planningRepo, recipeRepo, tagRepo, planner);
  });

  it('debe asignar recetas a servicios vacios', async () => {
    const planning = Planning.create(PLANNING_ID, USER_ID, 'Prueba', null, 2);
    planning.addDay('c0000000-0000-4000-a000-000000000001', 1);
    planning.assignMealToDay(1, DESAYUNO_TAG, 2);
    planning.assignMealToDay(1, COMIDA_TAG, 2);
    await planningRepo.save(planning);

    await recipeRepo.save(buildRecipe(RECIPE_1, 'Tortilla', DESAYUNO_TAG, CALIENTE_TAG, CARNE_TAG));

    const result = await useCase.execute({ planningId: PLANNING_ID, userId: USER_ID });

    expect(result.assignments).toHaveLength(2);
    expect(result.unassigned).toHaveLength(0);

    const updated = (await planningRepo.findById(PLANNING_ID))!;
    const dayDTO = updated.getDay(1)!;
    expect(dayDTO.services[DESAYUNO_TAG]!.getRecipeId()).toBe(RECIPE_1);
    expect(dayDTO.services[COMIDA_TAG]!.getRecipeId()).toBe(RECIPE_1);
  });

  it('debe devolver vacio si todos los servicios ya tienen receta', async () => {
    const planning = Planning.create(PLANNING_ID, USER_ID, 'Prueba', null, 2);
    planning.addDay('c0000000-0000-4000-a000-000000000001', 1);
    planning.assignMealToDay(1, DESAYUNO_TAG, 2, RECIPE_1);
    await planningRepo.save(planning);

    const result = await useCase.execute({ planningId: PLANNING_ID, userId: USER_ID });
    expect(result.assignments).toHaveLength(0);
    expect(result.unassigned).toHaveLength(0);
  });

  it('debe lanzar error si la planificacion no existe', async () => {
    await expect(useCase.execute({ planningId: 'unknown', userId: USER_ID })).rejects.toThrow(AppError);
  });
});
