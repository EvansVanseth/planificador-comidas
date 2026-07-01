import { DomainError } from '@/domain/shared/errors/domain-error';
import { Id } from '@/domain/shared/value-objects/id.vo';
import { Name } from '@/domain/shared/value-objects/name.vo';
import { UserId } from '@/domain/users/value-objects/user-id.vo';
import { BaseServings } from '@/domain/recipes/value-objects/base-servings.vo';
import { PrepCookTime } from '@/domain/recipes/value-objects/prep-cook-time.vo';
import { RecipeIngredient, RecipeIngredientPrimitives } from '@/domain/recipes/value-objects/recipe-ingredient.vo';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';

const RECIPE_NAME_FIELD = 'recipe name';
const REQUIRED_DIMENSIONS: TagDimension[] = [
  TagDimension.MOMENTO_DIA,
  TagDimension.FORMATO,
  TagDimension.TIPO_PLATO,
];

export type TagPrimitive = {
  id: string;
  dimension: TagDimension;
};

export type RecipePrimitives = {
  id: string;
  userId: string;
  name: string;
  baseServings: number;
  prepTime: number;
  preparation: string | null;
  ingredients: RecipeIngredientPrimitives[];
  tags: TagPrimitive[];
};

export class Recipe {
  private id: Id;
  private userId: UserId;
  private name: Name;
  private baseServings: BaseServings;
  private prepTime: PrepCookTime;
  private preparation: string | null;
  private ingredients: RecipeIngredient[];
  private tags: Map<string, TagDimension>;

  private constructor(
    id: Id,
    userId: UserId,
    name: Name,
    baseServings: BaseServings,
    prepTime: PrepCookTime,
    preparation: string | null,
    ingredients: RecipeIngredient[],
    tags: Map<string, TagDimension>,
  ) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.baseServings = baseServings;
    this.prepTime = prepTime;
    this.preparation = preparation;
    this.ingredients = ingredients;
    this.tags = tags;
  }

  public static create(
    id: string,
    userId: string,
    name: string,
    baseServings: number,
    prepTime: number,
    preparation: string | null,
    ingredients: RecipeIngredient[],
    tags: TagPrimitive[],
  ): Recipe {
    validateRequiredDimensions(tags);

    const tagMap = new Map<string, TagDimension>();
    for (const t of tags) {
      const tagId = Id.create(t.id).value;
      tagMap.set(tagId, t.dimension);
    }

    return new Recipe(
      Id.create(id),
      UserId.create(userId),
      Name.create(RECIPE_NAME_FIELD, name),
      BaseServings.create(baseServings),
      PrepCookTime.create(prepTime),
      preparation?.trim() ?? null,
      ingredients,
      tagMap,
    );
  }

  public getId(): string {
    return this.id.value;
  }

  public getUserId(): string {
    return this.userId.value;
  }

  public getName(): string {
    return this.name.value;
  }

  public getBaseServings(): number {
    return this.baseServings.value;
  }

  public getPrepTime(): number {
    return this.prepTime.value;
  }

  public getPreparation(): string | null {
    return this.preparation;
  }

  public getIngredients(): RecipeIngredient[] {
    return [...this.ingredients];
  }

  public getTagIds(): string[] {
    return Array.from(this.tags.keys());
  }

  public rename(name: string): void {
    this.name = Name.create(RECIPE_NAME_FIELD, name);
  }

  public reassignUser(userId: string): void {
    this.userId = UserId.create(userId);
  }

  public updatePreparation(preparation: string | null): void {
    this.preparation = preparation?.trim() ?? null;
  }

  public changeBaseServings(servings: number): void {
    this.baseServings = BaseServings.create(servings);
  }

  public changePrepTime(time: number): void {
    this.prepTime = PrepCookTime.create(time);
  }

  public addTag(tagId: string, dimension: TagDimension): void {
    const id = Id.create(tagId).value;

    if (this.tags.has(id)) {
      throw new DomainError('La etiqueta ya está asignada a la receta');
    }

    this.tags.set(id, dimension);
  }

  public removeTag(tagId: string): void {
    const id = Id.create(tagId).value;

    const dimension = this.tags.get(id);
    if (!dimension) {
      throw new DomainError('La etiqueta no existe en la receta');
    }

    if (REQUIRED_DIMENSIONS.includes(dimension)) {
      const remainingOfDimension = Array.from(this.tags.values())
        .filter(d => d === dimension);
      if (remainingOfDimension.length <= 1) {
        throw new DomainError(
          `No se puede eliminar la única etiqueta de dimensión ${dimension}. La receta debe tener al menos una.`
        );
      }
    }

    this.tags.delete(id);
  }

  public addIngredient(ingredient: RecipeIngredient): void {
    this.ingredients.push(ingredient);
  }

  public removeIngredient(ingredientId: string): void {
    const index = this.ingredients.findIndex(i => i.ingredientId === ingredientId);
    if (index === -1) {
      throw new DomainError('El ingrediente no existe en la receta');
    }
    this.ingredients.splice(index, 1);
  }

  public toPrimitives(): RecipePrimitives {
    return {
      id: this.id.value,
      userId: this.userId.value,
      name: this.name.value,
      baseServings: this.baseServings.value,
      prepTime: this.prepTime.value,
      preparation: this.preparation,
      ingredients: this.ingredients.map(i => i.toPrimitives()),
      tags: Array.from(this.tags.entries()).map(([id, dimension]) => ({ id, dimension })),
    };
  }

  public static fromPrimitives(data: RecipePrimitives): Recipe {
    const tagMap = new Map<string, TagDimension>();
    for (const t of data.tags) {
      tagMap.set(t.id, t.dimension);
    }

    return new Recipe(
      Id.create(data.id),
      UserId.create(data.userId),
      Name.create(RECIPE_NAME_FIELD, data.name),
      BaseServings.create(data.baseServings),
      PrepCookTime.create(data.prepTime),
      data.preparation,
      data.ingredients.map(i => RecipeIngredient.fromPrimitives(i)),
      tagMap,
    );
  }
}

function validateRequiredDimensions(tags: TagPrimitive[]): void {
  const hasMomento = tags.some(t => t.dimension === TagDimension.MOMENTO_DIA);
  const hasFormato = tags.some(t => t.dimension === TagDimension.FORMATO);
  const hasTipo = tags.some(t => t.dimension === TagDimension.TIPO_PLATO);

  if (!hasMomento || !hasFormato || !hasTipo) {
    throw new DomainError(
      'La receta debe tener al menos una etiqueta de cada tipo: MOMENTO_DIA, FORMATO y TIPO_PLATO'
    );
  }
}
