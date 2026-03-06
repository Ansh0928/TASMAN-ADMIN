import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
    pool: Pool | undefined;
};

function createPrisma(): PrismaClient {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err) => {
        console.error('Unexpected PG pool error:', err);
    });

    globalForPrisma.pool = pool;
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
