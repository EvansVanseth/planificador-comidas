import { Id } from '@/domain/shared/value-objects/id.vo';
import { CoversNumber } from '../value-objects/covers-number.vo';
import { DomainError } from '@/domain/shared/errors/domain-error';

export type MealServicePrimitives = {
  time: string;
  recipeId: string | null;
  covers: number;
  exclusions: string[];
  preferences: string[];
};

export class MealService {
  private recipeId: Id | null;
  private covers: CoversNumber;
  private exclusions: Set<string>;
  private preferences: Set<string>;

  private constructor(recipeId: Id | null, covers: CoversNumber, exclusions: Set<string>, preferences: Set<string>) {
    this.recipeId = recipeId;
    this.covers = covers;
    this.exclusions = exclusions;
    this.preferences = preferences;
  }

  public static create(covers: number, recipeId?: string, exclusions?: string[], preferences?: string[]): MealService {
    if (covers === 0 && recipeId !== undefined) {
      throw new DomainError('Un servicio con 0 comensales no puede tener una receta asignada');
    }

    return new MealService(
      recipeId ? Id.create(recipeId) : null,
      CoversNumber.create(covers),
      new Set(exclusions ?? []),
      new Set(preferences ?? []),
    );
  }

  public static createEmpty(): MealService {
    return new MealService(null, CoversNumber.create(0), new Set(), new Set());
  }

  public getRecipeId(): string | null {
    return this.recipeId?.value ?? null;
  }

  public getCovers(): number {
    return this.covers.value;
  }

  public getExclusions(): string[] {
    return Array.from(this.exclusions);
  }

  public getPreferences(): string[] {
    return Array.from(this.preferences);
  }

  public assignRecipe(recipeId: string): void {
    if (this.covers.value === 0) {
      throw new DomainError('No se puede asignar receta a un servicio con 0 comensales');
    }
    this.recipeId = Id.create(recipeId);
  }

  public unassignRecipe(): void {
    this.recipeId = null;
  }

  public changeCovers(covers: number): void {
    if (covers === 0) {
      this.recipeId = null;
    }
    this.covers = CoversNumber.create(covers);
  }

  public addExclusion(tagId: string): void {
    this.exclusions.add(Id.create(tagId).value);
  }

  public removeExclusion(tagId: string): void {
    this.exclusions.delete(tagId);
  }

  public addPreference(tagId: string): void {
    this.preferences.add(Id.create(tagId).value);
  }

  public removePreference(tagId: string): void {
    this.preferences.delete(tagId);
  }

  public setExclusions(tagIds: string[]): void {
    this.exclusions = new Set(tagIds.map(id => Id.create(id).value));
  }

  public setPreferences(tagIds: string[]): void {
    this.preferences = new Set(tagIds.map(id => Id.create(id).value));
  }

  public toPrimitives(): MealServicePrimitives {
    return {
      time: '',
      recipeId: this.recipeId?.value ?? null,
      covers: this.covers.value,
      exclusions: Array.from(this.exclusions),
      preferences: Array.from(this.preferences),
    };
  }

  public static fromPrimitives(data: Omit<MealServicePrimitives, 'time'>): MealService {
    return new MealService(
      data.recipeId ? Id.create(data.recipeId) : null,
      CoversNumber.create(data.covers),
      new Set(data.exclusions),
      new Set(data.preferences),
    );
  }
}
