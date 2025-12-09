import { PrismaClient } from '@prisma/client'

const globaForPrisma = global as typeof globalThis & {
    prisma?: PrismaClient
}

export const prisma = globaForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
    globaForPrisma.prisma = prisma
}
