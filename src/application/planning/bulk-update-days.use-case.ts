import { PlanningRepository } from '../../domain/planning/repositories/planning-repository.interface';
import { TagRepository } from '../../domain/tags/repositories/tag-repository.interface';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../shared/errors/app-error';

export type BulkUpdateDaysInput = {
  planningId: string;
  days: number[];
  covers?: number;
  exclusions?: string[];
  preferences?: string[];
};

export class BulkUpdateDaysUseCase {
  constructor(
    private planningRepository: PlanningRepository,
    private tagRepository: TagRepository,
  ) {}

  async execute(input: BulkUpdateDaysInput): Promise<void> {
    const planning = await this.planningRepository.findById(input.planningId);
    if (!planning) throw new AppError('El Id del planning no existe');

    if (input.exclusions) await this.validarSinMomentoDia(input.exclusions, 'exclusión');
    if (input.preferences) await this.validarSinMomentoDia(input.preferences, 'preferencia');

    planning.bulkUpdateServices(input.days, {
      covers: input.covers,
      exclusions: input.exclusions,
      preferences: input.preferences,
    });

    await this.planningRepository.save(planning);
  }

  private async validarSinMomentoDia(tagIds: string[], tipo: string): Promise<void> {
    for (const tagId of tagIds) {
      const tag = await this.tagRepository.findById(tagId);
      if (tag && tag.getDimension() === TagDimension.MOMENTO_DIA) {
        throw new AppError(`No se puede usar la etiqueta de momento del día "${tag.getName()}" como ${tipo}`);
      }
    }
  }
}
