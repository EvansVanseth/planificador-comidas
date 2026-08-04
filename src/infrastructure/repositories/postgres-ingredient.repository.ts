import { Prisma, PrismaClient } from '@/generated/prisma/client';
import { IngredientRepository } from '@/domain/ingredients/repositories/ingredient-repository.interface';
import { Ingredient } from '@/domain/ingredients/aggregates/ingredient.aggregate';
import { prisma as defaultPrisma } from './prisma-client';

type IngredientRow = Prisma.IngredientGetPayload<{}>;

export class PostgresIngredientRepository implements IngredientRepository {
  constructor(private prisma: PrismaClient = defaultPrisma) {}

  async findById(id: string): Promise<Ingredient | null> {
    const row = await this.prisma.ingredient.findUnique({ where: { id } });
    if (!row) return null;
    return this.toDomain(row);
  }

  async findManyByIds(ids: string[]): Promise<Ingredient[]> {
    if (ids.length === 0) return [];
    const rows = await this.prisma.ingredient.findMany({ where: { id: { in: ids } } });
    return rows.map((r: IngredientRow) => this.toDomain(r));
  }

  async findAll(): Promise<Ingredient[]> {
    const rows = await this.prisma.ingredient.findMany();
    return rows.map((r: IngredientRow) => this.toDomain(r));
  }

  async findAllByUserId(userId: string): Promise<Ingredient[]> {
    const rows = await this.prisma.ingredient.findMany({ where: { userId } });
    return rows.map((r: IngredientRow) => this.toDomain(r));
  }

  async findByName(name: string, userId: string): Promise<Ingredient | null> {
    const row = await this.prisma.ingredient.findFirst({
      where: { name: { equals: name, mode: 'insensitive' }, userId },
    });
    return row ? this.toDomain(row) : null;
  }

  async save(ingredient: Ingredient): Promise<void> {
    const data = ingredient.toPrimitives();
    await this.prisma.ingredient.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        userId: data.userId,
        name: data.name,
      },
      update: {
        userId: data.userId,
        name: data.name,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.ingredient.delete({ where: { id } }).catch(() => {});
  }

  private toDomain(row: IngredientRow): Ingredient {
    return Ingredient.fromPrimitives({
      id: row.id,
      userId: row.userId,
      name: row.name,
    });
  }
}
