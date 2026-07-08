import { RecipePrimitives } from '@/domain/recipes/aggregates/recipe.aggregate';

export type PlannerSlot = {
  dayOrder: number;
  momentTagId: string;
  covers: number;
  exclusions: string[];
  preferences: string[];
};

export type PlannerInput = {
  slots: PlannerSlot[];
  recipes: RecipePrimitives[];
  hotTagIds: string[];
  hotColdBalance: number;
};

export type PlannerAssignment = {
  dayOrder: number;
  momentTagId: string;
  recipeId: string;
};

export type PlannerUnassigned = {
  dayOrder: number;
  momentTagId: string;
  reason: string;
};

export type PlannerResult = {
  assignments: PlannerAssignment[];
  unassigned: PlannerUnassigned[];
};

export interface AutoPlanner {
  plan(input: PlannerInput): PlannerResult;
}
