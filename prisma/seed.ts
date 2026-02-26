import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding database...');

    // ── Create Admin User ──
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@tasmanstar.com.au' },
        update: {},
        create: {
            email: 'admin@tasmanstar.com.au',
            passwordHash: adminPassword,
            name: 'Admin',
            phone: '+61755290844',
            role: 'ADMIN',
        },
    });
    console.log(`Admin user: ${admin.email}`);

    // ── Create Categories ──
    const categories = [
        { name: 'Prawns', slug: 'prawns', imageUrl: '/assets/products/prawns.png', sortOrder: 1 },
        { name: 'Oyster', slug: 'oyster', imageUrl: '/assets/products/oysters-mornay.png', sortOrder: 2 },
        { name: 'Fish Fillet', slug: 'fish-fillet', imageUrl: '/assets/products/fillets.png', sortOrder: 3 },
        { name: 'Crabs, Lobsters, Bugs', slug: 'crabs-lobsters-bugs', imageUrl: '/assets/products/crabs.png', sortOrder: 4 },
        { name: 'Shellfish', slug: 'shellfish', imageUrl: '/assets/products/scallops.png', sortOrder: 5 },
        { name: 'Sushi/Sashimi', slug: 'sushi-sashimi', imageUrl: '/assets/products/salmon.png', sortOrder: 6 },
        { name: 'Squid & Octopus', slug: 'squid-octopus', imageUrl: '/assets/products/octopus.png', sortOrder: 7 },
        { name: 'Frozen Products', slug: 'frozen-products', sortOrder: 8 },
        { name: 'Platters', slug: 'platters', sortOrder: 9 },
        { name: 'Family Value Packs', slug: 'family-value-packs', sortOrder: 10 },
        { name: 'Condiments & Sauces', slug: 'condiments-sauces', sortOrder: 11 },
        { name: 'Smoked & Cured Fish', slug: 'smoked-cured-fish', sortOrder: 12 },
        { name: 'Whole Fish', slug: 'whole-fish', sortOrder: 13 },
    ];

    const categoryMap: Record<string, string> = {};
    for (const cat of categories) {
        const created = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: cat,
        });
        categoryMap[cat.slug] = created.id;
    }
    console.log(`Created ${categories.length} categories`);

    // ── Create Sample Products ──
    const products = [
        { name: 'Cooked Spanner Crab Meat 500g', slug: 'cooked-spanner-crab-meat-500g', price: 45.00, categorySlug: 'crabs-lobsters-bugs', imageUrls: ['/assets/products/crabs.png'], unit: 'PACK' as const, isTodaysSpecial: true, tags: ['fresh'] },
        { name: 'Crab Soft Shell 1kg pack', slug: 'crab-soft-shell-1kg', price: 34.90, categorySlug: 'crabs-lobsters-bugs', imageUrls: ['/assets/products/crabs.png'], unit: 'PACK' as const, isTodaysSpecial: true, tags: ['fresh'] },
        { name: 'Fresh Sashimi Kingfish per 300gm Block', slug: 'fresh-sashimi-kingfish-300g', price: 40.00, categorySlug: 'sushi-sashimi', imageUrls: ['/assets/products/salmon.png'], unit: 'PIECE' as const, isTodaysSpecial: true, tags: ['sashimi'] },
        { name: 'Fresh Sashimi Kingfish per 500gm pack sliced', slug: 'fresh-sashimi-kingfish-500g-sliced', price: 60.00, categorySlug: 'sushi-sashimi', imageUrls: ['/assets/products/salmon.png'], unit: 'PACK' as const, isTodaysSpecial: true, tags: ['sashimi'] },
        { name: 'Barramundi Fillets Fresh 1kg Pack', slug: 'barramundi-fillets-1kg', price: 46.90, categorySlug: 'fish-fillet', imageUrls: ['/assets/products/fillets.png'], unit: 'PACK' as const, isFeatured: true, tags: ['best-buy'] },
        { name: 'Blue Eye Cod Fillets Fresh 1kg Pack', slug: 'blue-eye-cod-fillets-1kg', price: 79.90, categorySlug: 'fish-fillet', imageUrls: ['/assets/products/fillets.png'], unit: 'PACK' as const, isFeatured: true, tags: ['best-buy'] },
        { name: 'Tiger Prawns 1kg Pack', slug: 'tiger-prawns-1kg', price: 34.90, categorySlug: 'prawns', imageUrls: ['/assets/products/prawns.png'], unit: 'KG' as const, isFeatured: true, tags: ['best-buy', 'popular'] },
        { name: 'Oysters Mornay each', slug: 'oysters-mornay-each', price: 9.90, categorySlug: 'oyster', imageUrls: ['/assets/products/oysters-mornay.png'], unit: 'PIECE' as const, isFeatured: true, tags: ['best-buy'] },
        { name: 'Fresh Scallops 500g Pack', slug: 'fresh-scallops-500g', price: 29.99, categorySlug: 'shellfish', imageUrls: ['/assets/products/scallops.png'], unit: 'PACK' as const, isFeatured: true, tags: ['best-buy'] },
        { name: 'Octopus Whole 1kg', slug: 'octopus-whole-1kg', price: 25.00, categorySlug: 'squid-octopus', imageUrls: ['/assets/products/octopus.png'], unit: 'KG' as const, isFeatured: true, tags: ['best-buy'] },
        { name: 'Clams 1kg Pack', slug: 'clams-1kg', price: 29.99, categorySlug: 'shellfish', imageUrls: ['/assets/products/scallops.png'], unit: 'KG' as const, tags: ['best-buy'] },
        { name: 'Crab Meat Pots each', slug: 'crab-meat-pots-each', price: 25.00, categorySlug: 'crabs-lobsters-bugs', imageUrls: ['/assets/products/crabs.png'], unit: 'PIECE' as const, tags: ['best-buy'] },
        { name: 'Crab Meat Raw 500gm pack', slug: 'crab-meat-raw-500g', price: 65.00, categorySlug: 'crabs-lobsters-bugs', imageUrls: ['/assets/products/crabs.png'], unit: 'PACK' as const, tags: [] },
        { name: 'Salmon Fillet Fresh 1kg', slug: 'salmon-fillet-fresh-1kg', price: 55.00, categorySlug: 'fish-fillet', imageUrls: ['/assets/products/salmon.png'], unit: 'KG' as const, tags: ['popular'] },
        { name: 'Snapper Fillets 500g', slug: 'snapper-fillets-500g', price: 38.00, categorySlug: 'fish-fillet', imageUrls: ['/assets/products/fillets.png'], unit: 'PACK' as const, tags: [] },
        { name: 'Cooked Prawns 1kg', slug: 'cooked-prawns-1kg', price: 42.00, categorySlug: 'prawns', imageUrls: ['/assets/products/prawns.png'], unit: 'KG' as const, tags: ['popular'] },
    ];

    for (const product of products) {
        const { categorySlug, ...productData } = product;
        await prisma.product.upsert({
            where: { slug: productData.slug },
            update: {},
            create: {
                ...productData,
                categoryId: categoryMap[categorySlug],
                stockQuantity: Math.floor(Math.random() * 50) + 10,
                isAvailable: true,
            },
        });
    }
    console.log(`Created ${products.length} products`);

    // ── Create Wholesale Categories & Sample Items ──
    const wholesaleCategories = [
        { name: 'Prawns', sortOrder: 1 },
        { name: 'Fish Fillets', sortOrder: 2 },
        { name: 'Crabs & Lobsters', sortOrder: 3 },
        { name: 'Shellfish', sortOrder: 4 },
        { name: 'Whole Fish', sortOrder: 5 },
    ];

    const wsCategoryMap: Record<string, string> = {};
    for (const cat of wholesaleCategories) {
        const created = await prisma.wholesaleCategory.create({
            data: cat,
        });
        wsCategoryMap[cat.name] = created.id;
    }

    const wholesaleItems = [
        { name: 'Tiger Prawns U8-12', unit: 'per kg', price: 22.00, categoryName: 'Prawns' },
        { name: 'Tiger Prawns U15-20', unit: 'per kg', price: 18.50, categoryName: 'Prawns' },
        { name: 'Banana Prawns (cooked)', unit: 'per kg', price: 19.00, categoryName: 'Prawns' },
        { name: 'King Prawns Raw', unit: 'per 5kg box', price: 85.00, categoryName: 'Prawns' },
        { name: 'Barramundi Fillets', unit: 'per kg', price: 32.00, categoryName: 'Fish Fillets' },
        { name: 'Salmon Atlantic Fillets', unit: 'per kg', price: 38.00, categoryName: 'Fish Fillets' },
        { name: 'Blue Eye Cod Fillets', unit: 'per kg', price: 55.00, categoryName: 'Fish Fillets' },
        { name: 'Snapper Fillets', unit: 'per kg', price: 28.00, categoryName: 'Fish Fillets' },
        { name: 'Mud Crab Live', unit: 'per kg', price: 48.00, categoryName: 'Crabs & Lobsters' },
        { name: 'Spanner Crab Meat', unit: 'per kg', price: 65.00, categoryName: 'Crabs & Lobsters' },
        { name: 'Moreton Bay Bugs', unit: 'per kg', price: 42.00, categoryName: 'Crabs & Lobsters' },
        { name: 'Scallops (roe off)', unit: 'per kg', price: 45.00, categoryName: 'Shellfish' },
        { name: 'Oysters Pacific Dozen', unit: 'per dozen', price: 12.00, categoryName: 'Shellfish' },
        { name: 'Whole Snapper', unit: 'per kg', price: 18.00, categoryName: 'Whole Fish' },
        { name: 'Whole Barramundi', unit: 'per kg', price: 22.00, categoryName: 'Whole Fish' },
    ];

    for (const item of wholesaleItems) {
        const { categoryName, ...itemData } = item;
        await prisma.wholesalePriceItem.create({
            data: {
                ...itemData,
                categoryId: wsCategoryMap[categoryName],
                isAvailable: true,
            },
        });
    }
    console.log(`Created ${wholesaleItems.length} wholesale price items`);

    console.log('Seeding complete!');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
