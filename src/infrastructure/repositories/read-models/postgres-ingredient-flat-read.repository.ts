import { PrismaClient } from '@/generated/prisma/client';
import {
  IngredientFlatReadRepository,
  IngredientNameFlat,
} from '@/domain/ingredients/repositories/ingredient-flat-read-repository.interface';
import { prisma as defaultPrisma } from '../prisma-client';

export class PostgresIngredientFlatReadRepository implements IngredientFlatReadRepository {
  constructor(private prisma: PrismaClient = defaultPrisma) {}

  async findNamesByIds(ids: string[]): Promise<IngredientNameFlat[]> {
    if (ids.length === 0) return [];

    const rows = await this.prisma.ingredient.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true },
    });

    return rows;
  }
}
