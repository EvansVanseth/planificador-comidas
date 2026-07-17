import { Prisma, PrismaClient } from '@/generated/prisma/client';
import { RecipeRepository } from '@/domain/recipes/repositories/recipe-repository.interface';
import { Recipe } from '@/domain/recipes/aggregates/recipe.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { prisma as defaultPrisma } from './prisma-client';

type RecipeRow = Prisma.RecipeGetPayload<{
  include: {
    ingredients: true;
    tags: { include: { tag: true } };
  };
}>;

export class PostgresRecipeRepository implements RecipeRepository {
  constructor(private prisma: PrismaClient = defaultPrisma) {}

  async findById(id: string): Promise<Recipe | null> {
    const row = await this.prisma.recipe.findUnique({
      where: { id },
      include: {
        ingredients: true,
        tags: { include: { tag: true } },
      },
    });
    if (!row) return null;
    return this.toDomain(row);
  }

  async findAll(): Promise<Recipe[]> {
    const rows = await this.prisma.recipe.findMany({
      include: {
        ingredients: true,
        tags: { include: { tag: true } },
      },
    });
    return rows.map((r: RecipeRow) => this.toDomain(r));
  }

  async findAllByUserId(userId: string): Promise<Recipe[]> {
    const rows = await this.prisma.recipe.findMany({
      where: { userId },
      include: {
        ingredients: true,
        tags: { include: { tag: true } },
      },
    });
    return rows.map((r: RecipeRow) => this.toDomain(r));
  }

  async findByName(name: string): Promise<Recipe | null> {
    const normalized = name.toLowerCase().trim();
    const rows = await this.prisma.recipe.findMany({
      include: {
        ingredients: true,
        tags: { include: { tag: true } },
      },
    });
    const found = rows.find((r: RecipeRow) => r.name.toLowerCase().trim() === normalized);
    return found ? this.toDomain(found) : null;
  }

  async save(recipe: Recipe): Promise<void> {
    const data = recipe.toPrimitives();

    await this.prisma.recipe.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        userId: data.userId,
        name: data.name,
        baseServings: data.baseServings,
        prepTime: data.prepTime,
        preparation: data.preparation,
      },
      update: {
        userId: data.userId,
        name: data.name,
        baseServings: data.baseServings,
        prepTime: data.prepTime,
        preparation: data.preparation,
      },
    });

    await this.prisma.recipeIngredient.deleteMany({ where: { recipeId: data.id } });
    if (data.ingredients.length > 0) {
      await this.prisma.recipeIngredient.createMany({
        data: data.ingredients.map(i => ({
          recipeId: data.id,
          ingredientId: i.ingredientId,
          quantityNote: i.quantityNote,
        })),
      });
    }

    await this.prisma.recipeTag.deleteMany({ where: { recipeId: data.id } });
    if (data.tags.length > 0) {
      await this.prisma.recipeTag.createMany({
        data: data.tags.map(t => ({
          recipeId: data.id,
          tagId: t.id,
        })),
      });
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.recipe.delete({ where: { id } }).catch(() => {});
  }

  private toDomain(row: RecipeRow): Recipe {
    return Recipe.fromPrimitives({
      id: row.id,
      userId: row.userId,
      name: row.name,
      baseServings: row.baseServings,
      prepTime: row.prepTime,
      preparation: row.preparation,
      ingredients: row.ingredients.map((i: { ingredientId: string; quantityNote: string | null }) => ({
        ingredientId: i.ingredientId,
        quantityNote: i.quantityNote,
      })),
      tags: row.tags.map((t: { tagId: string; tag: { dimension: string } }) => ({
        id: t.tagId,
        dimension: t.tag.dimension as TagDimension,
      })),
    });
  }
}
