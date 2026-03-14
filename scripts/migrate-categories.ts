import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    // 1. Find old category
    const oldCat = await prisma.category.findUnique({ where: { slug: 'prepared-meals-sushi' } });
    if (!oldCat) {
        console.log('Old category "prepared-meals-sushi" not found — may already be migrated');
    }

    // 2. Create new categories (upsert to be idempotent)
    const newCategories = [
        { name: 'Prepared Meals', slug: 'prepared-meals', imageUrl: '/assets/products/stir-fried-pre-made-meal.webp', sortOrder: 11 },
        { name: 'Sushi', slug: 'sushi', imageUrl: '/assets/products/nigiri-setsushi.webp', sortOrder: 12 },
        { name: 'Sashimi', slug: 'sashimi', imageUrl: '/assets/products/img1279.webp', sortOrder: 13 },
        { name: 'Frozen Traded', slug: 'frozen-traded', imageUrl: '/assets/products/marinaria-mix.webp', sortOrder: 14 },
        { name: 'Sauces & Condiments', slug: 'sauces-condiments', imageUrl: '/assets/products/img3304.webp', sortOrder: 15 },
    ];

    const catMap: Record<string, string> = {};
    for (const cat of newCategories) {
        const created = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: { name: cat.name, imageUrl: cat.imageUrl, sortOrder: cat.sortOrder },
            create: cat,
        });
        catMap[cat.slug] = created.id;
        console.log(`✓ Category "${cat.name}" (${created.id})`);
    }

    // 3. Reassign products from old category
    if (oldCat) {
        const products = await prisma.product.findMany({ where: { categories: { some: { categoryId: oldCat.id } } } });
        console.log(`\nFound ${products.length} products in old category:`);

        for (const product of products) {
            // Sushi products go to "sushi", others go to "prepared-meals"
            const isSushi = product.name.toLowerCase().includes('sushi') || product.name.toLowerCase().includes('nigiri');
            const newCatSlug = isSushi ? 'sushi' : 'prepared-meals';
            await prisma.product.update({
                where: { id: product.id },
                data: { categories: { updateMany: { where: { isPrimary: true }, data: { categoryId: catMap[newCatSlug] } } } },
            });
            console.log(`  → "${product.name}" → ${newCatSlug}`);
        }

        // 4. Delete old category
        await prisma.category.delete({ where: { id: oldCat.id } });
        console.log(`\n✓ Deleted old category "Prepared Meals & Sushi"`);
    }

    console.log('\nDone! New categories:');
    const all = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
    for (const c of all) {
        console.log(`  ${c.sortOrder}. ${c.name} (${c.slug})`);
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await pool.end();
    });
