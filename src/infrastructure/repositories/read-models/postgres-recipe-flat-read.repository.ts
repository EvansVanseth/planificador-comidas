import { PrismaClient } from '@/generated/prisma/client';
import {
  RecipeFlatReadRepository,
  RecipeIngredientFlat,
} from '@/domain/recipes/repositories/recipe-flat-read-repository.interface';
import { prisma as defaultPrisma } from '../prisma-client';

export class PostgresRecipeFlatReadRepository implements RecipeFlatReadRepository {
  constructor(private prisma: PrismaClient = defaultPrisma) {}

  async getIngredientsByRecipeIds(recipeIds: string[]): Promise<RecipeIngredientFlat[]> {
    if (recipeIds.length === 0) return [];

    const rows = await this.prisma.recipeIngredient.findMany({
      where: { recipeId: { in: recipeIds } },
      select: {
        recipeId: true,
        ingredientId: true,
        quantityNote: true,
        recipe: { select: { name: true } },
      },
    });

    return rows.map((r) => ({
      recipeId: r.recipeId,
      recipeName: r.recipe.name,
      ingredientId: r.ingredientId,
      quantityNote: r.quantityNote,
    }));
  }
}
