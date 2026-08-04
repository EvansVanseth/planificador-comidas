import { randomUUID } from 'crypto';
import { Prisma, PrismaClient } from '@/generated/prisma/client';
import { PlanningRepository } from '@/domain/planning/repositories/planning-repository.interface';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { prisma as defaultPrisma } from './prisma-client';

type PlanningRow = Prisma.PlanningGetPayload<{
  include: {
    days: { include: { services: true } };
    pantryItems: true;
    shoppingItems: true;
  };
}>;

export class PostgresPlanningRepository implements PlanningRepository {
  constructor(private prisma: PrismaClient = defaultPrisma) {}

  async findById(id: string): Promise<Planning | null> {
    const row = await this.prisma.planning.findUnique({
      where: { id },
      include: {
        days: { include: { services: true } },
        pantryItems: true,
        shoppingItems: true,
      },
    });
    if (!row) return null;
    return this.toDomain(row);
  }

  async findAll(): Promise<Planning[]> {
    const rows = await this.prisma.planning.findMany({
      include: {
        days: { include: { services: true } },
        pantryItems: true,
        shoppingItems: true,
      },
    });
    return rows.map((r: PlanningRow) => this.toDomain(r));
  }

  async findAllByUserId(userId: string): Promise<Planning[]> {
    const rows = await this.prisma.planning.findMany({
      where: { userid: userId },
      include: {
        days: { include: { services: true } },
        pantryItems: true,
        shoppingItems: true,
      },
    });
    return rows.map((r: PlanningRow) => this.toDomain(r));
  }

  async findByName(name: string): Promise<Planning | null> {
    const normalized = name.toLowerCase().trim();
    const rows = await this.prisma.planning.findMany({
      include: {
        days: { include: { services: true } },
        pantryItems: true,
        shoppingItems: true,
      },
    });
    const found = rows.find((r: PlanningRow) => r.name.toLowerCase().trim() === normalized);
    return found ? this.toDomain(found) : null;
  }

  async save(planning: Planning): Promise<void> {
    const data = planning.toPrimitives();

    await this.prisma.$transaction(async (tx) => {
      await tx.planning.upsert({
        where: { id: data.id },
        create: {
          id: data.id,
          userid: data.userid,
          name: data.name,
          startdate: data.startdate,
          weeks: data.weeks,
          hotColdBalance: data.hotColdBalance ?? 50,
        },
        update: {
          userid: data.userid,
          name: data.name,
          startdate: data.startdate,
          weeks: data.weeks,
          hotColdBalance: data.hotColdBalance ?? 50,
        },
      });

      // --- Days & services ---
      const existingDays = await tx.plannedDay.findMany({
        where: { planningId: data.id },
        include: { services: true },
      });
      const existingDayMap = new Map(existingDays.map(d => [d.id, d]));
      const newDayIds = new Set(data.days.map(d => d.id));

      for (const day of existingDays) {
        if (!newDayIds.has(day.id)) {
          await tx.plannedDay.delete({ where: { id: day.id } });
        }
      }

      for (const day of data.days) {
        const existingDay = existingDayMap.get(day.id);
        if (!existingDay) {
          await tx.plannedDay.create({
            data: {
              id: day.id,
              planningId: data.id,
              order: day.order,
              services: {
                create: day.services.map(s => ({
                  id: randomUUID(),
                  ...serviceColumns(s),
                })),
              },
            },
          });
          continue;
        }

        if (existingDay.order !== day.order) {
          await tx.plannedDay.update({ where: { id: day.id }, data: { order: day.order } });
        }

        const existingServices = new Map(existingDay.services.map(s => [s.time, s]));
        const newServiceTimes = new Set(day.services.map(s => s.time));

        for (const [time] of existingServices) {
          if (!newServiceTimes.has(time)) {
            await tx.mealService.deleteMany({ where: { dayId: day.id, time } });
          }
        }

        for (const svc of day.services) {
          const existingSvc = existingServices.get(svc.time);
          if (!existingSvc) {
            await tx.mealService.create({
              data: { id: randomUUID(), dayId: day.id, ...serviceColumns(svc) },
            });
          } else if (serviceChanged(existingSvc, svc)) {
            await tx.mealService.update({
              where: { id: existingSvc.id },
              data: serviceColumns(svc),
            });
          }
        }
      }

      // --- Pantry items (keyed by ingredientId) ---
      const existingPantry = await tx.planningPantryItem.findMany({ where: { planningId: data.id } });
      const existingPantryMap = new Map(existingPantry.map(p => [p.ingredientId, p]));
      const newPantryIds = new Set(data.pantryItems.map(p => p.ingredientId));

      for (const item of existingPantry) {
        if (!newPantryIds.has(item.ingredientId)) {
          await tx.planningPantryItem.delete({ where: { id: item.id } });
        }
      }
      for (const item of data.pantryItems) {
        const existing = existingPantryMap.get(item.ingredientId);
        if (!existing) {
          await tx.planningPantryItem.create({
            data: {
              id: item.id,
              planningId: data.id,
              ingredientId: item.ingredientId,
              available: item.available,
              covers: item.covers,
            },
          });
        } else if (existing.available !== item.available || existing.covers !== item.covers) {
          await tx.planningPantryItem.update({
            where: { id: existing.id },
            data: { available: item.available, covers: item.covers },
          });
        }
      }

      // --- Shopping items (keyed by ingredientId) ---
      const existingShopping = await tx.planningShoppingItem.findMany({ where: { planningId: data.id } });
      const existingShoppingMap = new Map(existingShopping.map(s => [s.ingredientId, s]));
      const newShoppingIds = new Set(data.shoppingItems.map(s => s.ingredientId));

      for (const item of existingShopping) {
        if (!newShoppingIds.has(item.ingredientId)) {
          await tx.planningShoppingItem.delete({ where: { id: item.id } });
        }
      }
      for (const item of data.shoppingItems) {
        const existing = existingShoppingMap.get(item.ingredientId);
        if (!existing) {
          await tx.planningShoppingItem.create({
            data: {
              id: item.id,
              planningId: data.id,
              ingredientId: item.ingredientId,
              completed: item.completed,
            },
          });
        } else if (existing.completed !== item.completed) {
          await tx.planningShoppingItem.update({
            where: { id: existing.id },
            data: { completed: item.completed },
          });
        }
      }
    });
  }

  async setPantryItemCovers(planningId: string, ingredientId: string, covers: number): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.planningPantryItem.updateMany({
        where: { planningId, ingredientId },
        data: { available: false, covers },
      });

      if (count === 0 && covers > 0) {
        await tx.planningPantryItem.create({
          data: {
            id: randomUUID(),
            planningId,
            ingredientId,
            available: false,
            covers,
          },
        });
      }
    });
  }

  async setPantryItemAvailable(planningId: string, ingredientId: string, available: boolean): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.planningPantryItem.updateMany({
        where: { planningId, ingredientId },
        data: { available, covers: 0 },
      });

      if (count === 0 && available) {
        await tx.planningPantryItem.create({
          data: {
            id: randomUUID(),
            planningId,
            ingredientId,
            available,
            covers: 0,
          },
        });
      }
    });
  }

  async removePantryItem(planningId: string, ingredientId: string): Promise<void> {
    await this.prisma.planningPantryItem.deleteMany({ where: { planningId, ingredientId } });
  }

  async setShoppingItemCompleted(planningId: string, ingredientId: string, completed: boolean): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.planningShoppingItem.updateMany({
        where: { planningId, ingredientId },
        data: { completed },
      });

      if (count === 0 && completed) {
        await tx.planningShoppingItem.create({
          data: {
            id: randomUUID(),
            planningId,
            ingredientId,
            completed,
          },
        });
      }
    });
  }

  async removeShoppingItem(planningId: string, ingredientId: string): Promise<void> {
    await this.prisma.planningShoppingItem.deleteMany({ where: { planningId, ingredientId } });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.planning.delete({ where: { id } }).catch(() => {});
  }

  private toDomain(row: PlanningRow): Planning {
    return Planning.fromPrimitives({
      id: row.id,
      userid: row.userid,
      name: row.name,
      startdate: row.startdate,
      weeks: row.weeks,
      hotColdBalance: row.hotColdBalance,
      days: row.days
        .map((d: { id: string; order: number; services: Array<{ time: string; recipeId: string | null; covers: number; exclusions: string[]; preferences: string[]; ignoreRestrictions: boolean }> }) => ({
          id: d.id,
          order: d.order,
          services: d.services.map(s => ({
            time: s.time,
            recipeId: s.recipeId,
            covers: s.covers,
            exclusions: s.exclusions,
            preferences: s.preferences,
            ignoreRestrictions: s.ignoreRestrictions,
          })),
        }))
        .sort((a: { order: number }, b: { order: number }) => a.order - b.order),
      pantryItems: row.pantryItems.map((p: { id: string; ingredientId: string; available: boolean; covers: number }) => ({
        id: p.id,
        ingredientId: p.ingredientId,
        available: p.available,
        covers: p.covers,
      })),
      shoppingItems: row.shoppingItems.map((s: { id: string; ingredientId: string; completed: boolean }) => ({
        id: s.id,
        ingredientId: s.ingredientId,
        completed: s.completed,
      })),
    });
  }
}

type ServiceInput = {
  time: string;
  recipeId: string | null;
  covers: number;
  exclusions: string[];
  preferences: string[];
  ignoreRestrictions: boolean;
};

function serviceColumns(s: ServiceInput) {
  return {
    time: s.time,
    recipeId: s.recipeId,
    covers: s.covers,
    exclusions: s.exclusions,
    preferences: s.preferences,
    ignoreRestrictions: s.ignoreRestrictions,
  };
}

function serviceChanged(
  existing: {
    recipeId: string | null;
    covers: number;
    exclusions: string[];
    preferences: string[];
    ignoreRestrictions: boolean;
  },
  next: ServiceInput,
): boolean {
  return (
    existing.recipeId !== next.recipeId ||
    existing.covers !== next.covers ||
    JSON.stringify(existing.exclusions) !== JSON.stringify(next.exclusions) ||
    JSON.stringify(existing.preferences) !== JSON.stringify(next.preferences) ||
    existing.ignoreRestrictions !== next.ignoreRestrictions
  );
}
