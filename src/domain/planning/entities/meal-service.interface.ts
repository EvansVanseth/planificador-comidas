import { Id } from '@/domain/shared/value-objects/id.vo';
import { CoversNumber } from '../value-objects/covers-number.vo';

export interface MealService {
  readonly recipeId: Id;
  readonly covers: CoversNumber;
}