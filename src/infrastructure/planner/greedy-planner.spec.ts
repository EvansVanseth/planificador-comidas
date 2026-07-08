import { describe, it, expect } from 'vitest';
import { GreedyPlanner } from './greedy-planner';
import { PlannerInput, PlannerSlot } from '@/application/planning/ports/auto-planner.interface';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';

const DESAYUNO = 'tag-desayuno';
const COMIDA = 'tag-comida';
const CENA = 'tag-cena';
const CALIENTE = 'tag-caliente';
const FRIO = 'tag-frio';
const CARNE = 'tag-carne';
const PESCADO = 'tag-pescado';
const PASTA = 'tag-pasta';

const hotTagIds = [CALIENTE];

function slot(overrides: Partial<PlannerSlot> = {}): PlannerSlot {
  return {
    dayOrder: 1,
    momentTagId: COMIDA,
    covers: 2,
    exclusions: [],
    preferences: [],
    ...overrides,
  };
}

function recipe(id: string, momentTagId: string, formatTagId: string, tipoTagId: string) {
  return {
    id,
    userId: 'u1',
    name: id,
    baseServings: 4,
    prepTime: 30,
    preparation: null,
    ingredients: [],
    tags: [
      { id: momentTagId, dimension: TagDimension.MOMENTO_DIA },
      { id: formatTagId, dimension: TagDimension.FORMATO },
      { id: tipoTagId, dimension: TagDimension.TIPO_PLATO },
    ],
  };
}

describe('GreedyPlanner', () => {
  const planner = new GreedyPlanner();

  it('asigna receta a un slot vacio', () => {
    const result = planner.plan({
      slots: [slot()],
      recipes: [recipe('r1', COMIDA, CALIENTE, CARNE)],
      hotTagIds,
      hotColdBalance: 50,
    });

    expect(result.assignments).toHaveLength(1);
    expect(result.assignments[0].recipeId).toBe('r1');
    expect(result.unassigned).toHaveLength(0);
  });

  it('respeta MOMENTO_DIA filtrando recetas', () => {
    const result = planner.plan({
      slots: [slot({ momentTagId: DESAYUNO })],
      recipes: [
        recipe('r1', COMIDA, CALIENTE, CARNE),
        recipe('r2', DESAYUNO, FRIO, PESCADO),
      ],
      hotTagIds,
      hotColdBalance: 50,
    });

    expect(result.assignments[0].recipeId).toBe('r2');
  });

  it('respeta exclusiones', () => {
    const result = planner.plan({
      slots: [slot({ exclusions: [PESCADO] })],
      recipes: [
        recipe('r1', COMIDA, CALIENTE, CARNE),
        recipe('r2', COMIDA, FRIO, PESCADO),
      ],
      hotTagIds,
      hotColdBalance: 50,
    });

    expect(result.assignments[0].recipeId).toBe('r1');
  });

  it('no repite recetas asignadas', () => {
    const result = planner.plan({
      slots: [
        slot({ dayOrder: 1, momentTagId: COMIDA }),
        slot({ dayOrder: 1, momentTagId: CENA }),
      ],
      recipes: [
        recipe('r-unica', COMIDA, CALIENTE, CARNE),
      ],
      hotTagIds,
      hotColdBalance: 50,
    });

    expect(result.assignments).toHaveLength(1);
    expect(result.unassigned).toHaveLength(1);
  });

  it('prefiere recetas con tags en preferences', () => {
    const result = planner.plan({
      slots: [slot({ preferences: [CARNE] })],
      recipes: [
        recipe('r-carne', COMIDA, CALIENTE, CARNE),
        recipe('r-pescado', COMIDA, FRIO, PESCADO),
      ],
      hotTagIds,
      hotColdBalance: 50,
    });

    expect(result.assignments[0].recipeId).toBe('r-carne');
  });

  it('inclina hacia caliente cuando hotColdBalance es 100', () => {
    const result = planner.plan({
      slots: [
        slot({ dayOrder: 1, momentTagId: COMIDA, preferences: [PASTA] }),
        slot({ dayOrder: 2, momentTagId: COMIDA, preferences: [PASTA] }),
      ],
      recipes: [
        recipe('r-fria', COMIDA, FRIO, PASTA),
        recipe('r-caliente1', COMIDA, CALIENTE, PASTA),
        recipe('r-caliente2', COMIDA, CALIENTE, PASTA),
      ],
      hotTagIds,
      hotColdBalance: 100,
    });

    expect(result.assignments).toHaveLength(2);
    expect(result.assignments.every(a => ['r-caliente1', 'r-caliente2'].includes(a.recipeId))).toBe(true);
  });
});
