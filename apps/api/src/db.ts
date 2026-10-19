import { PrismaPg } from '@prisma/adapter-pg'
import { env } from './env'
import { PrismaClient } from './generated/prisma/client'

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })

export const prisma = new PrismaClient({ adapter })

/** Rejects when the database cannot be reached. */
export async function checkDatabase(): Promise<void> {
  await prisma.$queryRaw`SELECT 1`
}
