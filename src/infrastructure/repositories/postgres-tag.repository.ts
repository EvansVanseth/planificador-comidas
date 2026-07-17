import { PrismaClient } from '@/generated/prisma/client';
import { TagRepository } from '@/domain/tags/repositories/tag-repository.interface';
import { Tag, TagPrimitives } from '@/domain/tags/aggregates/tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { prisma as defaultPrisma } from './prisma-client';

export class PostgresTagRepository implements TagRepository {
  constructor(private prisma: PrismaClient = defaultPrisma) {}

  async findById(id: string): Promise<Tag | null> {
    const row = await this.prisma.tag.findUnique({ where: { id } });
    if (!row) return null;
    return this.toDomain(row);
  }

  async findAll(): Promise<Tag[]> {
    const rows: Array<{
      id: string; userId: string; name: string; dimension: string;
      isSystem: boolean; systemKey: string | null; order: number;
    }> = await this.prisma.tag.findMany();
    return rows.map(r => this.toDomain(r));
  }

  async findAllByUserId(userId: string): Promise<Tag[]> {
    const rows: Array<{
      id: string; userId: string; name: string; dimension: string;
      isSystem: boolean; systemKey: string | null; order: number;
    }> = await this.prisma.tag.findMany({ where: { userId } });
    return rows.map(r => this.toDomain(r));
  }

  async findByNameAndDimension(name: string, dimension: TagDimension): Promise<Tag | null> {
    const normalized = name.toLowerCase().trim();
    const rows: Array<{
      id: string; userId: string; name: string; dimension: string;
      isSystem: boolean; systemKey: string | null; order: number;
    }> = await this.prisma.tag.findMany({ where: { dimension } });
    const found = rows.find(r => r.name.toLowerCase().trim() === normalized);
    return found ? this.toDomain(found) : null;
  }

  async save(tag: Tag): Promise<void> {
    const data = tag.toPrimitives();
    await this.prisma.tag.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        userId: data.userId,
        name: data.name,
        dimension: data.dimension,
        isSystem: data.isSystem,
        systemKey: data.systemKey ?? null,
        order: data.order ?? 0,
      },
      update: {
        userId: data.userId,
        name: data.name,
        dimension: data.dimension,
        isSystem: data.isSystem,
        systemKey: data.systemKey ?? null,
        order: data.order ?? 0,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.tag.delete({ where: { id } }).catch(() => {});
  }

  private toDomain(row: {
    id: string;
    userId: string;
    name: string;
    dimension: string;
    isSystem: boolean;
    systemKey: string | null;
    order: number;
  }): Tag {
    return Tag.fromPrimitives({
      id: row.id,
      userId: row.userId,
      name: row.name,
      dimension: row.dimension as TagDimension,
      isSystem: row.isSystem,
      systemKey: row.systemKey,
      order: row.order,
    });
  }
}
