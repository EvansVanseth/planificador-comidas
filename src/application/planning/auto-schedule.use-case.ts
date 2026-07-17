import { PlanningRepository } from '../../domain/planning/repositories/planning-repository.interface';
import { RecipeRepository } from '../../domain/recipes/repositories/recipe-repository.interface';
import { TagRepository } from '../../domain/tags/repositories/tag-repository.interface';
import { AutoPlanner, PlannerResult } from './ports/auto-planner.interface';
import { AppError } from '../shared/errors/app-error';

export type AutoScheduleInput = {
  planningId: string;
  userId: string;
  dryRun?: boolean;
};

export class AutoScheduleUseCase {
  constructor(
    private planningRepository: PlanningRepository,
    private recipeRepository: RecipeRepository,
    private tagRepository: TagRepository,
    private planner: AutoPlanner,
  ) {}

  async execute(input: AutoScheduleInput): Promise<PlannerResult> {
    const planning = await this.planningRepository.findById(input.planningId);
    if (!planning) throw new AppError('Planificacion no encontrada');

    const slots = planning.getDays()
      .flatMap(day => {
        const dto = day.toDTO();
        return Object.entries(dto.services)
          .filter(([_, svc]) => !svc?.getRecipeId())
          .map(([momentTagId, svc]) => ({
            dayOrder: day.getOrdenDia(),
            momentTagId,
            covers: svc!.getCovers(),
            exclusions: svc!.getExclusions(),
            preferences: svc!.getPreferences(),
          }));
      });

    if (slots.length === 0) {
      return { assignments: [], unassigned: [] };
    }

    const recipes = (await this.recipeRepository.findAllByUserId(input.userId))
      .map(r => r.toPrimitives());

    const allTags = await this.tagRepository.findAllByUserId(input.userId);
    const hotTags = allTags
      .filter(t => t.getSystemKey() === 'CALIENTE')
      .map(t => t.getId());

    const result = this.planner.plan({
      slots,
      recipes,
      hotTagIds: hotTags,
      hotColdBalance: planning.getHotColdBalance(),
    });

    if (!input.dryRun) {
      for (const a of result.assignments) {
        const dto = planning.getDay(a.dayOrder);
        if (!dto) continue;
        const svc = dto.services[a.momentTagId];
        if (!svc) continue;
        planning.assignMealToDay(a.dayOrder, a.momentTagId, svc.getCovers(), a.recipeId);
      }
      await this.planningRepository.save(planning);
    }
    return result;
  }
}
