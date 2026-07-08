import { AutoPlanner, PlannerInput, PlannerResult, PlannerAssignment, PlannerUnassigned } from '@/application/planning/ports/auto-planner.interface';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';

export class GreedyPlanner implements AutoPlanner {
  plan(input: PlannerInput): PlannerResult {
    const assignments: PlannerAssignment[] = [];
    const unassigned: PlannerUnassigned[] = [];
    const assignedRecipeIds = new Set<string>();
    const tipoCount = new Map<string, number>();
    const hotSet = new Set(input.hotTagIds);

    const slotsSorted = [...input.slots].sort(
      (a, b) => this.countCandidates(a, input.recipes, assignedRecipeIds)
        - this.countCandidates(b, input.recipes, assignedRecipeIds),
    );

    for (const slot of slotsSorted) {
      const candidates = this.findCandidates(slot, input.recipes, assignedRecipeIds);

      if (candidates.length === 0) {
        unassigned.push({
          dayOrder: slot.dayOrder,
          momentTagId: slot.momentTagId,
          reason: 'No hay recetas candidatas disponibles',
        });
        continue;
      }

      const hotAssigned = assignments.filter(a =>
        input.recipes.some(r =>
          r.id === a.recipeId && r.tags.some(t => hotSet.has(t.id)),
        ),
      ).length;
      const totalAssigned = assignments.length;
      const desiredHot = Math.round((totalAssigned + 1) * input.hotColdBalance / 100);

      const scored = candidates.map(recipe => {
        let score = 0;

        if (slot.preferences.some(pref => recipe.tags.some(t => t.id === pref))) {
          score += 10;
        }

        const isHot = recipe.tags.some(t => hotSet.has(t.id));
        if (isHot && hotAssigned < desiredHot) {
          score += 5;
        } else if (!isHot && hotAssigned >= desiredHot) {
          score += 5;
        }

        const tipoId = recipe.tags.find(t => t.dimension === TagDimension.TIPO_PLATO)?.id ?? '';
        score -= (tipoCount.get(tipoId) ?? 0) * 3;

        return { recipe, score };
      });

      scored.sort((a, b) => b.score - a.score);
      const chosen = scored[0].recipe;

      assignedRecipeIds.add(chosen.id);
      const tipoId = chosen.tags.find(t => t.dimension === TagDimension.TIPO_PLATO)?.id ?? '';
      tipoCount.set(tipoId, (tipoCount.get(tipoId) ?? 0) + 1);

      assignments.push({
        dayOrder: slot.dayOrder,
        momentTagId: slot.momentTagId,
        recipeId: chosen.id,
      });
    }

    return { assignments, unassigned };
  }

  private countCandidates(
    slot: PlannerInput['slots'][0],
    recipes: PlannerInput['recipes'],
    assigned: Set<string>,
  ): number {
    return this.findCandidates(slot, recipes, assigned).length;
  }

  private findCandidates(
    slot: PlannerInput['slots'][0],
    recipes: PlannerInput['recipes'],
    assigned: Set<string>,
  ) {
    return recipes.filter(recipe =>
      !assigned.has(recipe.id)
      && recipe.tags.some(t => t.id === slot.momentTagId && t.dimension === TagDimension.MOMENTO_DIA)
      && !recipe.tags.some(t => slot.exclusions.includes(t.id))
    );
  }
}
