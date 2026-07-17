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

    await this.prisma.planning.upsert({
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

    await this.prisma.mealService.deleteMany({
      where: { day: { planningId: data.id } },
    });
    await this.prisma.plannedDay.deleteMany({ where: { planningId: data.id } });

    for (const day of data.days) {
      await this.prisma.plannedDay.create({
        data: {
          id: day.id,
          planningId: data.id,
          order: day.order,
          services: {
            create: day.services.map(s => ({
              id: randomUUID(),
              time: s.time,
              recipeId: s.recipeId,
              covers: s.covers,
              exclusions: s.exclusions,
              preferences: s.preferences,
              ignoreRestrictions: s.ignoreRestrictions ?? false,
            })),
          },
        },
      });
    }

    await this.prisma.planningPantryItem.deleteMany({ where: { planningId: data.id } });
    if (data.pantryItems.length > 0) {
      await this.prisma.planningPantryItem.createMany({
        data: data.pantryItems.map(p => ({
          id: p.id,
          planningId: data.id,
          ingredientId: p.ingredientId,
          available: p.available,
          covers: p.covers,
        })),
      });
    }

    await this.prisma.planningShoppingItem.deleteMany({ where: { planningId: data.id } });
    if (data.shoppingItems.length > 0) {
      await this.prisma.planningShoppingItem.createMany({
        data: data.shoppingItems.map(s => ({
          id: s.id,
          planningId: data.id,
          ingredientId: s.ingredientId,
          completed: s.completed,
        })),
      });
    }
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
