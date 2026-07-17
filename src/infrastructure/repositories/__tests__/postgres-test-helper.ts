import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://planificador:planificador@localhost:5432/planificador';

export const testPrisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: DATABASE_URL }),
});

export const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440001';

export async function seedTestUser(): Promise<void> {
  await testPrisma.user.upsert({
    where: { id: TEST_USER_ID },
    create: { id: TEST_USER_ID, name: 'TestUser', email: 'test@example.com' },
    update: {},
  });
}

export async function cleanDb(): Promise<void> {
  await testPrisma.$transaction([
    testPrisma.mealService.deleteMany(),
    testPrisma.plannedDay.deleteMany(),
    testPrisma.planningShoppingItem.deleteMany(),
    testPrisma.planningPantryItem.deleteMany(),
    testPrisma.planning.deleteMany(),
    testPrisma.recipeTag.deleteMany(),
    testPrisma.recipeIngredient.deleteMany(),
    testPrisma.recipe.deleteMany(),
    testPrisma.tag.deleteMany(),
    testPrisma.ingredient.deleteMany(),
    testPrisma.user.deleteMany(),
  ]);
}

export async function connectTestDb(): Promise<void> {
  await testPrisma.$connect();
}

export async function disconnectTestDb(): Promise<void> {
  await cleanDb();
  await testPrisma.$disconnect();
}
