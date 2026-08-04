import { PrismaClient } from '@/generated/prisma/client';
import {
  PlanningFlatReadRepository,
  PlanningSnapshotFlat,
} from '@/domain/planning/repositories/planning-flat-read-repository.interface';
import { prisma as defaultPrisma } from '../prisma-client';

export class PostgresPlanningFlatReadRepository implements PlanningFlatReadRepository {
  constructor(private prisma: PrismaClient = defaultPrisma) {}

  async getSnapshot(planningId: string): Promise<PlanningSnapshotFlat | null> {
    const planning = await this.prisma.planning.findUnique({
      where: { id: planningId },
      select: {
        days: {
          select: {
            services: {
              select: { recipeId: true, covers: true },
            },
          },
        },
        pantryItems: {
          select: { ingredientId: true, available: true, covers: true },
        },
        shoppingItems: {
          select: { ingredientId: true, completed: true },
        },
      },
    });

    if (!planning) return null;

    return {
      services: planning.days
        .flatMap((d) => d.services)
        .filter((s): s is { recipeId: string; covers: number } => s.recipeId !== null),
      pantryItems: planning.pantryItems,
      shoppingItems: planning.shoppingItems,
    };
  }
}
