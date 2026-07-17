import { Prisma, PrismaClient } from '@/generated/prisma/client';
import { UserRepository } from '@/domain/users/repositories/user-repository.interface';
import { User } from '@/domain/users/aggregates/user.aggregate';
import { prisma as defaultPrisma } from './prisma-client';

type UserRow = Prisma.UserGetPayload<{}>;

export class PostgresUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient = defaultPrisma) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    if (!row) return null;
    return this.toDomain(row);
  }

  async findAll(): Promise<User[]> {
    const rows = await this.prisma.user.findMany();
    return rows.map((r: UserRow) => this.toDomain(r));
  }

  async findByName(name: string): Promise<User | null> {
    const normalized = name.toLowerCase().trim();
    const rows = await this.prisma.user.findMany();
    const found = rows.find((r: UserRow) => r.name.toLowerCase().trim() === normalized);
    return found ? this.toDomain(found) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalized = email.toLowerCase().trim();
    const rows = await this.prisma.user.findMany();
    const found = rows.find((r: UserRow) => r.email.toLowerCase().trim() === normalized);
    return found ? this.toDomain(found) : null;
  }

  async save(user: User): Promise<void> {
    const data = user.toPrimitives();
    await this.prisma.user.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        name: data.name,
        email: data.email,
      },
      update: {
        name: data.name,
        email: data.email,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } }).catch(() => {});
  }

  private toDomain(row: UserRow): User {
    return User.fromPrimitives({
      id: row.id,
      name: row.name,
      email: row.email,
    });
  }
}
