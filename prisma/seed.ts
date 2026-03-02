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

const IMG = (name: string) => `/assets/products/${name}`;

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

    // ── Delete existing products & categories (clean slate) ──
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    console.log('Cleared existing products & categories');

    // ── Create Categories ──
    const categories = [
        { name: 'Cooked Prawns', slug: 'cooked-prawns', imageUrl: IMG('large-cooked-king-prawn.webp'), sortOrder: 1 },
        { name: 'Raw Prawns', slug: 'raw-prawns', imageUrl: IMG('jumbo-raw-kung-prawns.webp'), sortOrder: 2 },
        { name: 'Cooked Crabs', slug: 'cooked-crabs', imageUrl: IMG('cooked-sand-crab.webp'), sortOrder: 3 },
        { name: 'Raw Crabs', slug: 'raw-crabs', imageUrl: IMG('raw-sand-crabs.webp'), sortOrder: 4 },
        { name: 'Cooked Bugs', slug: 'cooked-bugs', imageUrl: IMG('large-cooked-moreton-bay-bugs.webp'), sortOrder: 5 },
        { name: 'Raw Bugs', slug: 'raw-bugs', imageUrl: IMG('raw-moreton-bay-bugs.webp'), sortOrder: 6 },
        { name: 'Crayfish & Lobsters', slug: 'crayfish-lobsters', imageUrl: IMG('wa-cray-fish-cooked.webp'), sortOrder: 7 },
        { name: 'Live Species', slug: 'live-species', imageUrl: IMG('live-mud-crabs.webp'), sortOrder: 8 },
        { name: 'Oysters', slug: 'oysters', imageUrl: IMG('pacific-plate-oyster.webp'), sortOrder: 9 },
        { name: 'Scallops', slug: 'scallops', imageUrl: IMG('tasmania-scallops-meat.webp'), sortOrder: 10 },
        { name: 'Mussels', slug: 'mussels', imageUrl: IMG('fresh-black-mussels.webp'), sortOrder: 11 },
        { name: 'Raw Fillets', slug: 'raw-fillets', imageUrl: IMG('red-snapper-fillet.webp'), sortOrder: 12 },
        { name: 'Octopus, Squid & Cuttlefish', slug: 'octopus-squid-cuttlefish', imageUrl: IMG('cleaned-octoupus-2.webp'), sortOrder: 13 },
        { name: 'Sashimi, Sushi & Platters', slug: 'sashimi-sushi-platters', imageUrl: IMG('nigiri-setsushi.webp'), sortOrder: 14 },
        { name: 'Sauces', slug: 'sauces', sortOrder: 15 },
        { name: 'Smoked & Cured Fish', slug: 'smoked-cured-fish', sortOrder: 16 },
    ];

    const categoryMap: Record<string, string> = {};
    for (const cat of categories) {
        const created = await prisma.category.create({ data: cat });
        categoryMap[cat.slug] = created.id;
    }
    console.log(`Created ${categories.length} categories`);

    // ── Create Products ──
    type ProductInput = {
        name: string;
        slug: string;
        price: number;
        categorySlug: string;
        imageUrls: string[];
        unit: 'KG' | 'PIECE' | 'DOZEN' | 'BOX' | 'PACK';
        tags: string[];
        isFeatured?: boolean;
        isTodaysSpecial?: boolean;
        description?: string;
    };

    const products: ProductInput[] = [
        // ═══════════════════════════════════════
        // COOKED PRAWNS
        // ═══════════════════════════════════════
        {
            name: 'Large Cooked King Prawns',
            slug: 'large-cooked-king-prawns',
            price: 38.00,
            categorySlug: 'cooked-prawns',
            imageUrls: [IMG('large-cooked-king-prawn.webp'), IMG('large-cooked-king-prawn-1.webp'), IMG('large-cooked-king-prawn-3.webp'), IMG('large-cooked-king-prawsn.webp')],
            unit: 'KG',
            tags: ['popular', 'best-seller'],
            isFeatured: true,
        },
        {
            name: 'Medium Cooked King Prawns',
            slug: 'medium-cooked-king-prawns',
            price: 28.00,
            categorySlug: 'cooked-prawns',
            imageUrls: [IMG('medium-cooked-king-prawn.webp')],
            unit: 'KG',
            tags: ['popular'],
        },
        {
            name: 'Large Cooked Tiger Prawns',
            slug: 'large-cooked-tiger-prawns',
            price: 42.00,
            categorySlug: 'cooked-prawns',
            imageUrls: [IMG('large-cooked-nq-tiger-prawn.webp'), IMG('cooked-tiger-prawns-2.webp')],
            unit: 'KG',
            tags: ['premium'],
            isFeatured: true,
        },
        {
            name: 'Medium Cooked Tiger Prawns',
            slug: 'medium-cooked-tiger-prawns',
            price: 32.00,
            categorySlug: 'cooked-prawns',
            imageUrls: [IMG('cooked-tiger-prawns-2.webp')],
            unit: 'KG',
            tags: [],
        },
        {
            name: 'Medium Cooked Endeavour Prawns',
            slug: 'medium-cooked-endeavour-prawns',
            price: 22.00,
            categorySlug: 'cooked-prawns',
            imageUrls: [IMG('cooked-endevour-prawn.webp'), IMG('ckd-endevour-prawns.webp')],
            unit: 'KG',
            tags: ['value'],
        },
        {
            name: 'Cooked School Prawns',
            slug: 'cooked-school-prawns',
            price: 18.00,
            categorySlug: 'cooked-prawns',
            imageUrls: [IMG('cooked-school-prawns.webp')],
            unit: 'KG',
            tags: ['value'],
        },

        // ═══════════════════════════════════════
        // RAW PRAWNS
        // ═══════════════════════════════════════
        {
            name: 'Jumbo Green King Prawns',
            slug: 'jumbo-green-king-prawns',
            price: 35.00,
            categorySlug: 'raw-prawns',
            imageUrls: [IMG('jumbo-raw-kung-prawns.webp'), IMG('xl-raw-king-prawn.webp')],
            unit: 'KG',
            tags: ['premium', 'popular'],
            isFeatured: true,
        },
        {
            name: 'Large Green King Prawns',
            slug: 'large-green-king-prawns',
            price: 28.00,
            categorySlug: 'raw-prawns',
            imageUrls: [IMG('large-headless-king-prawn.webp'), IMG('raw-headless-king-prawn-nsw.webp')],
            unit: 'KG',
            tags: ['popular'],
        },
        {
            name: 'Medium Green King Prawns',
            slug: 'medium-green-king-prawns',
            price: 22.00,
            categorySlug: 'raw-prawns',
            imageUrls: [IMG('medium-raw-king-prawn.webp')],
            unit: 'KG',
            tags: ['value'],
        },
        {
            name: 'Green King Prawn Cutlets',
            slug: 'green-king-prawn-cutlets',
            price: 30.00,
            categorySlug: 'raw-prawns',
            imageUrls: [IMG('green-king-prawn-cutlet.webp'), IMG('raw-prawn-cutlets-2.webp')],
            unit: 'KG',
            tags: [],
        },
        {
            name: 'Medium Green Tiger Prawns',
            slug: 'medium-green-tiger-prawns',
            price: 30.00,
            categorySlug: 'raw-prawns',
            imageUrls: [IMG('jumbo-raw-tiger-prawns.webp'), IMG('large-raw-nq-tiger-prawn.webp'), IMG('large-raw-nq-tiger.webp')],
            unit: 'KG',
            tags: [],
        },
        {
            name: 'Red Spot King Prawns Raw',
            slug: 'red-spot-king-prawns-raw',
            price: 32.00,
            categorySlug: 'raw-prawns',
            imageUrls: [IMG('red-spot-king-prawn-raw.webp')],
            unit: 'KG',
            tags: [],
        },

        // ═══════════════════════════════════════
        // COOKED CRABS
        // ═══════════════════════════════════════
        {
            name: 'Cooked Mud Crabs',
            slug: 'cooked-mud-crabs',
            price: 55.00,
            categorySlug: 'cooked-crabs',
            imageUrls: [IMG('mud-crab-cooked.webp')],
            unit: 'KG',
            tags: ['premium'],
            isFeatured: true,
        },
        {
            name: 'Cooked Sand Crabs',
            slug: 'cooked-sand-crabs',
            price: 25.00,
            categorySlug: 'cooked-crabs',
            imageUrls: [IMG('cooked-sand-crab.webp'), IMG('cooked-sand-crab-2.webp')],
            unit: 'KG',
            tags: ['popular'],
        },
        {
            name: 'Cooked Spanner Crabs',
            slug: 'cooked-spanner-crabs',
            price: 35.00,
            categorySlug: 'cooked-crabs',
            imageUrls: [IMG('cooked-local-spanner-crabs.webp'), IMG('cooked-spanner-crabs-2.webp'), IMG('xl-cooked-spanner-crabs.webp')],
            unit: 'KG',
            tags: ['local'],
        },
        {
            name: 'Cooked King Crab Legs',
            slug: 'cooked-king-crab-legs',
            price: 75.00,
            categorySlug: 'cooked-crabs',
            imageUrls: [IMG('3-spot-crab-cooked.webp')],
            unit: 'KG',
            tags: ['premium'],
        },

        // ═══════════════════════════════════════
        // RAW CRABS
        // ═══════════════════════════════════════
        {
            name: 'Green Sand Crabs',
            slug: 'green-sand-crabs',
            price: 18.00,
            categorySlug: 'raw-crabs',
            imageUrls: [IMG('raw-sand-crabs.webp'), IMG('raw-sadn.webp'), IMG('cooked-and-raw-sand-crabs.webp')],
            unit: 'KG',
            tags: ['value'],
        },

        // ═══════════════════════════════════════
        // COOKED BUGS
        // ═══════════════════════════════════════
        {
            name: 'Cooked Moreton Bay Bugs',
            slug: 'cooked-moreton-bay-bugs',
            price: 55.00,
            categorySlug: 'cooked-bugs',
            imageUrls: [IMG('large-cooked-moreton-bay-bugs.webp')],
            unit: 'KG',
            tags: ['premium', 'popular'],
            isFeatured: true,
        },
        {
            name: 'Cooked Balmain Bugs',
            slug: 'cooked-balmain-bugs',
            price: 45.00,
            categorySlug: 'cooked-bugs',
            imageUrls: [IMG('cooked-balmain-bug-nsw.webp'), IMG('cooked-balmain-bugs.webp')],
            unit: 'KG',
            tags: [],
        },
        {
            name: 'Cooked Honey Bugs',
            slug: 'cooked-honey-bugs',
            price: 50.00,
            categorySlug: 'cooked-bugs',
            imageUrls: [IMG('honey-bugs.webp')],
            unit: 'KG',
            tags: [],
        },

        // ═══════════════════════════════════════
        // RAW BUGS
        // ═══════════════════════════════════════
        {
            name: 'Green Moreton Bay Bugs',
            slug: 'green-moreton-bay-bugs',
            price: 45.00,
            categorySlug: 'raw-bugs',
            imageUrls: [IMG('raw-moreton-bay-bugs.webp')],
            unit: 'KG',
            tags: [],
        },

        // ═══════════════════════════════════════
        // CRAYFISH & LOBSTERS
        // ═══════════════════════════════════════
        {
            name: 'Cooked Western Crayfish',
            slug: 'cooked-western-crayfish',
            price: 90.00,
            categorySlug: 'crayfish-lobsters',
            imageUrls: [IMG('wa-cray-fish-cooked.webp')],
            unit: 'KG',
            tags: ['premium'],
            isFeatured: true,
        },
        {
            name: 'Cooked Local Rock Lobster',
            slug: 'cooked-local-rock-lobster',
            price: 95.00,
            categorySlug: 'crayfish-lobsters',
            imageUrls: [IMG('local-lobster-ckd.webp')],
            unit: 'KG',
            tags: ['premium', 'local'],
        },
        {
            name: 'Cooked Southern Rock Lobster',
            slug: 'cooked-southern-rock-lobster',
            price: 90.00,
            categorySlug: 'crayfish-lobsters',
            imageUrls: [IMG('local-lobster-ckd.webp')],
            unit: 'KG',
            tags: ['premium'],
        },
        {
            name: 'Green Local Rock Lobster',
            slug: 'green-local-rock-lobster',
            price: 85.00,
            categorySlug: 'crayfish-lobsters',
            imageUrls: [IMG('wa-cray-fish-live.webp')],
            unit: 'KG',
            tags: ['premium', 'local'],
        },
        {
            name: 'Green Southern Rock Lobster',
            slug: 'green-southern-rock-lobster',
            price: 85.00,
            categorySlug: 'crayfish-lobsters',
            imageUrls: [IMG('wa-cray-fish-live-2.webp')],
            unit: 'KG',
            tags: ['premium'],
        },
        {
            name: 'Green Lobster Tails',
            slug: 'green-lobster-tails',
            price: 70.00,
            categorySlug: 'crayfish-lobsters',
            imageUrls: [IMG('scampi.webp')],
            unit: 'KG',
            tags: ['premium'],
        },

        // ═══════════════════════════════════════
        // LIVE SPECIES
        // ═══════════════════════════════════════
        {
            name: 'Live Mud Crabs',
            slug: 'live-mud-crabs',
            price: 60.00,
            categorySlug: 'live-species',
            imageUrls: [IMG('live-mud-crabs.webp')],
            unit: 'KG',
            tags: ['premium', 'live'],
            isFeatured: true,
        },
        {
            name: 'Live Spanner Crabs',
            slug: 'live-spanner-crabs',
            price: 40.00,
            categorySlug: 'live-species',
            imageUrls: [IMG('live-spanner-crab.webp'), IMG('live-spanner-crabs-2.webp')],
            unit: 'KG',
            tags: ['live', 'local'],
        },
        {
            name: 'Live Local Rock Lobsters',
            slug: 'live-local-rock-lobsters',
            price: 95.00,
            categorySlug: 'live-species',
            imageUrls: [IMG('wa-cray-fish-live.webp')],
            unit: 'KG',
            tags: ['premium', 'live'],
        },
        {
            name: 'Live Pipis',
            slug: 'live-pipis',
            price: 12.00,
            categorySlug: 'live-species',
            imageUrls: [IMG('live-pipis.webp'), IMG('live-pipis-2.webp')],
            unit: 'KG',
            tags: ['live'],
        },

        // ═══════════════════════════════════════
        // OYSTERS
        // ═══════════════════════════════════════
        {
            name: 'Pacific Plate Oysters 1 Dozen',
            slug: 'pacific-plate-oysters-1-dozen',
            price: 24.00,
            categorySlug: 'oysters',
            imageUrls: [IMG('pacific-plate-oyster.webp'), IMG('pacific-plate-oysters.webp')],
            unit: 'DOZEN',
            tags: ['popular'],
            isFeatured: true,
        },
        {
            name: 'Pacific Jumbo Oysters 1 Dozen',
            slug: 'pacific-jumbo-oysters-1-dozen',
            price: 30.00,
            categorySlug: 'oysters',
            imageUrls: [IMG('jumbo-pacific-oyster.webp'), IMG('jumbo-pacific-oyster-2.webp')],
            unit: 'DOZEN',
            tags: ['premium'],
        },
        {
            name: 'Pacific Plate Unshucked Oysters 1 Dozen',
            slug: 'pacific-plate-unshucked-oysters-1-dozen',
            price: 18.00,
            categorySlug: 'oysters',
            imageUrls: [IMG('pacific-plate-oyster.webp')],
            unit: 'DOZEN',
            tags: ['value'],
        },
        {
            name: 'Sydney Rock Bistro Oysters 1 Dozen',
            slug: 'sydney-rock-bistro-oysters-1-dozen',
            price: 28.00,
            categorySlug: 'oysters',
            imageUrls: [IMG('oyster-opening.webp')],
            unit: 'DOZEN',
            tags: ['premium'],
        },
        {
            name: 'Kilpatrick Oysters Half Dozen',
            slug: 'kilpatrick-oysters-half-dozen',
            price: 18.00,
            categorySlug: 'oysters',
            imageUrls: [IMG('kil-patric-moynay.webp')],
            unit: 'PIECE',
            tags: ['prepared'],
        },
        {
            name: 'Mornay Oysters Half Dozen',
            slug: 'mornay-oysters-half-dozen',
            price: 18.00,
            categorySlug: 'oysters',
            imageUrls: [IMG('kil-patric-moynay.webp')],
            unit: 'PIECE',
            tags: ['prepared'],
        },
        {
            name: 'Oyster Vinaigrette',
            slug: 'oyster-vinaigrette',
            price: 20.00,
            categorySlug: 'oysters',
            imageUrls: [IMG('pacific-plate-oysters.webp')],
            unit: 'PIECE',
            tags: ['prepared'],
        },

        // ═══════════════════════════════════════
        // SCALLOPS
        // ═══════════════════════════════════════
        {
            name: 'Roe On Tassie Scallops',
            slug: 'roe-on-tassie-scallops',
            price: 45.00,
            categorySlug: 'scallops',
            imageUrls: [IMG('tasmania-scallops-meat.webp'), IMG('tassie-scollop-meats.webp')],
            unit: 'KG',
            tags: ['premium'],
            isFeatured: true,
        },
        {
            name: 'Roe Off Scallops',
            slug: 'roe-off-scallops',
            price: 55.00,
            categorySlug: 'scallops',
            imageUrls: [IMG('tasmania-scallops-meat.webp')],
            unit: 'KG',
            tags: [],
        },
        {
            name: 'Roe Off Half Shell Scallops',
            slug: 'roe-off-half-shell-scallops',
            price: 40.00,
            categorySlug: 'scallops',
            imageUrls: [IMG('tassie-scollop-meats.webp')],
            unit: 'DOZEN',
            tags: [],
        },

        // ═══════════════════════════════════════
        // MUSSELS
        // ═══════════════════════════════════════
        {
            name: 'Black Mussels 1kg Packs',
            slug: 'black-mussels-1kg-packs',
            price: 12.00,
            categorySlug: 'mussels',
            imageUrls: [IMG('fresh-black-mussels.webp')],
            unit: 'PACK',
            tags: ['value', 'popular'],
        },
        {
            name: 'Greenlip Mussels Loose',
            slug: 'greenlip-mussels-loose',
            price: 14.00,
            categorySlug: 'mussels',
            imageUrls: [IMG('fresh-black-mussels.webp')],
            unit: 'KG',
            tags: [],
        },
        {
            name: 'Greenlip Mussel Meat',
            slug: 'greenlip-mussel-meat',
            price: 18.00,
            categorySlug: 'mussels',
            imageUrls: [IMG('marinaria-mix.webp')],
            unit: 'KG',
            tags: [],
        },
        {
            name: 'Marinated Mussel Pot Original',
            slug: 'marinated-mussel-pot-original',
            price: 10.00,
            categorySlug: 'mussels',
            imageUrls: [IMG('fresh-black-mussels.webp')],
            unit: 'PIECE',
            tags: ['prepared'],
        },
        {
            name: 'Marinated Mussel Pot Chilli',
            slug: 'marinated-mussel-pot-chilli',
            price: 10.00,
            categorySlug: 'mussels',
            imageUrls: [IMG('fresh-black-mussels.webp')],
            unit: 'PIECE',
            tags: ['prepared'],
        },
        {
            name: 'Marinated Mussel Pot Garlic',
            slug: 'marinated-mussel-pot-garlic',
            price: 10.00,
            categorySlug: 'mussels',
            imageUrls: [IMG('fresh-black-mussels.webp')],
            unit: 'PIECE',
            tags: ['prepared'],
        },

        // ═══════════════════════════════════════
        // RAW FILLETS
        // ═══════════════════════════════════════
        {
            name: 'Salmon Fillets Skin On',
            slug: 'salmon-fillets-skin-on',
            price: 42.00,
            categorySlug: 'raw-fillets',
            imageUrls: [IMG('king-ora-salmon-whole.webp'), IMG('ocean-trout-fillets.webp')],
            unit: 'KG',
            tags: ['popular', 'best-seller'],
            isFeatured: true,
        },
        {
            name: 'Barramundi Fillets Skin Off',
            slug: 'barramundi-fillets-skin-off',
            price: 38.00,
            categorySlug: 'raw-fillets',
            imageUrls: [IMG('qld-barra-whole.webp')],
            unit: 'KG',
            tags: ['popular'],
        },
        {
            name: 'Barramundi Fillets Skin On',
            slug: 'barramundi-fillets-skin-on',
            price: 36.00,
            categorySlug: 'raw-fillets',
            imageUrls: [IMG('qld-barra-whole.webp')],
            unit: 'KG',
            tags: [],
        },
        {
            name: 'Local Snapper Fillets',
            slug: 'local-snapper-fillets',
            price: 45.00,
            categorySlug: 'raw-fillets',
            imageUrls: [IMG('red-snapper-fillet.webp'), IMG('local-snapper.webp')],
            unit: 'KG',
            tags: ['local', 'premium'],
        },
        {
            name: 'Gold Band Snapper Fillets',
            slug: 'gold-band-snapper-fillets',
            price: 40.00,
            categorySlug: 'raw-fillets',
            imageUrls: [IMG('gold-band-snapper-whole.webp')],
            unit: 'KG',
            tags: [],
        },
        {
            name: 'Red Snapper Fillets',
            slug: 'red-snapper-fillets',
            price: 38.00,
            categorySlug: 'raw-fillets',
            imageUrls: [IMG('red-snapper-fillet.webp')],
            unit: 'KG',
            tags: [],
        },
        {
            name: 'Flathead Fillets',
            slug: 'flathead-fillets',
            price: 35.00,
            categorySlug: 'raw-fillets',
            imageUrls: [IMG('tusky-flat-head-whole.webp')],
            unit: 'KG',
            tags: ['popular'],
        },
        {
            name: 'Ocean Trout Fillets',
            slug: 'ocean-trout-fillets',
            price: 40.00,
            categorySlug: 'raw-fillets',
            imageUrls: [IMG('ocean-trout-fillets.webp'), IMG('ocean-trout-whole.webp')],
            unit: 'KG',
            tags: [],
        },
        {
            name: 'Coral Trout Fillets',
            slug: 'coral-trout-fillets',
            price: 65.00,
            categorySlug: 'raw-fillets',
            imageUrls: [IMG('coraltrout-whole.webp')],
            unit: 'KG',
            tags: ['premium'],
        },
        {
            name: 'John Dory Fillets',
            slug: 'john-dory-fillets',
            price: 50.00,
            categorySlug: 'raw-fillets',
            imageUrls: [IMG('john-dory-fillets.webp'), IMG('john-dory-whole.webp'), IMG('john-dory-whole-2.webp')],
            unit: 'KG',
            tags: [],
        },
        {
            name: 'Mahi Mahi Fillets',
            slug: 'mahi-mahi-fillets',
            price: 38.00,
            categorySlug: 'raw-fillets',
            imageUrls: [IMG('mahi-mahi-fillet.webp'), IMG('mahi-mahi-fillet-2.webp'), IMG('mahi.webp')],
            unit: 'KG',
            tags: [],
        },
        {
            name: 'Harpuka Fillets',
            slug: 'harpuka-fillets',
            price: 42.00,
            categorySlug: 'raw-fillets',
            imageUrls: [IMG('harpuka-fillet.webp')],
            unit: 'KG',
            tags: [],
        },
        {
            name: 'Swordfish Steaks',
            slug: 'swordfish-steaks',
            price: 48.00,
            categorySlug: 'raw-fillets',
            imageUrls: [IMG('sword-fish-steak.webp'), IMG('sword-fish-steaks.webp')],
            unit: 'KG',
            tags: ['premium'],
        },
        {
            name: 'Spanish Mackerel Fillets',
            slug: 'spanish-mackerel-fillets',
            price: 32.00,
            categorySlug: 'raw-fillets',
            imageUrls: [IMG('spanish-mackerel-fillet.webp')],
            unit: 'KG',
            tags: [],
        },
        {
            name: 'Pearl Perch Fillets',
            slug: 'pearl-perch-fillets',
            price: 45.00,
            categorySlug: 'raw-fillets',
            imageUrls: [IMG('pearl-perch-whole.webp'), IMG('pearl-perch-bin.webp')],
            unit: 'KG',
            tags: ['local'],
        },
        {
            name: 'Sand Whiting Fillets',
            slug: 'sand-whiting-fillets',
            price: 42.00,
            categorySlug: 'raw-fillets',
            imageUrls: [IMG('sand-whiting-whole.webp')],
            unit: 'KG',
            tags: [],
        },
        {
            name: 'King George Whiting Fillets',
            slug: 'king-george-whiting-fillets',
            price: 55.00,
            categorySlug: 'raw-fillets',
            imageUrls: [IMG('king-george-whitining-whole.webp')],
            unit: 'KG',
            tags: ['premium'],
        },

        // ═══════════════════════════════════════
        // OCTOPUS, SQUID & CUTTLEFISH
        // ═══════════════════════════════════════
        {
            name: 'Large Cleaned Octopus',
            slug: 'large-cleaned-octopus',
            price: 28.00,
            categorySlug: 'octopus-squid-cuttlefish',
            imageUrls: [IMG('cleaned-octoupus-2.webp'), IMG('local-clean-and-tumbled-octpus.webp')],
            unit: 'KG',
            tags: ['popular'],
            isFeatured: true,
        },
        {
            name: 'Medium Cleaned Octopus',
            slug: 'medium-cleaned-octopus',
            price: 25.00,
            categorySlug: 'octopus-squid-cuttlefish',
            imageUrls: [IMG('local-clean-and-tumbled-octpus.webp')],
            unit: 'KG',
            tags: [],
        },
        {
            name: 'Small Cleaned Baby Octopus',
            slug: 'small-cleaned-baby-octopus',
            price: 20.00,
            categorySlug: 'octopus-squid-cuttlefish',
            imageUrls: [IMG('bbq-octupus.webp')],
            unit: 'KG',
            tags: [],
        },
        {
            name: 'Medium Uncleaned Squid',
            slug: 'medium-uncleaned-squid',
            price: 15.00,
            categorySlug: 'octopus-squid-cuttlefish',
            imageUrls: [IMG('fresh-local-squid.webp'), IMG('local-squid-whole.webp')],
            unit: 'KG',
            tags: ['value'],
        },
        {
            name: 'Cleaned Tenderised Squid Tubes',
            slug: 'cleaned-tenderised-squid-tubes',
            price: 22.00,
            categorySlug: 'octopus-squid-cuttlefish',
            imageUrls: [IMG('seine-squid-whole.webp'), IMG('southern-calimarii-whole.webp')],
            unit: 'KG',
            tags: [],
        },
        {
            name: 'Cleaned Tenderized Cuttlefish Meat',
            slug: 'cleaned-tenderized-cuttlefish-meat',
            price: 24.00,
            categorySlug: 'octopus-squid-cuttlefish',
            imageUrls: [IMG('clean-cuttle-fish-meat.webp'), IMG('whole-cuttle-fish.webp')],
            unit: 'KG',
            tags: [],
        },
        {
            name: 'Marinara Mix',
            slug: 'marinara-mix',
            price: 22.00,
            categorySlug: 'octopus-squid-cuttlefish',
            imageUrls: [IMG('marinaria-mix.webp')],
            unit: 'KG',
            tags: ['popular', 'value'],
        },

        // ═══════════════════════════════════════
        // SASHIMI, SUSHI & PLATTERS
        // ═══════════════════════════════════════
        {
            name: 'Salmon Sashimi',
            slug: 'salmon-sashimi',
            price: 55.00,
            categorySlug: 'sashimi-sushi-platters',
            imageUrls: [IMG('king-ora-salmon-whole.webp')],
            unit: 'KG',
            tags: ['sashimi', 'premium'],
            isFeatured: true,
        },
        {
            name: 'Tuna Sashimi',
            slug: 'tuna-sashimi',
            price: 60.00,
            categorySlug: 'sashimi-sushi-platters',
            imageUrls: [IMG('big-eye-tuna.webp'), IMG('yellow-fin-tuna-whole.webp'), IMG('big-eye-tuna-2.webp')],
            unit: 'KG',
            tags: ['sashimi', 'premium'],
        },
        {
            name: 'Kingfish Sashimi',
            slug: 'kingfish-sashimi',
            price: 55.00,
            categorySlug: 'sashimi-sushi-platters',
            imageUrls: [IMG('king-fish.webp'), IMG('hira-masa-king-fish-whole.webp')],
            unit: 'KG',
            tags: ['sashimi', 'premium'],
        },
        {
            name: 'Blanched Octopus Sashimi',
            slug: 'blanched-octopus-sashimi',
            price: 45.00,
            categorySlug: 'sashimi-sushi-platters',
            imageUrls: [IMG('bbq-octupus.webp')],
            unit: 'KG',
            tags: ['sashimi'],
        },
        {
            name: 'Salmon Avocado Sushi',
            slug: 'salmon-avocado-sushi',
            price: 15.00,
            categorySlug: 'sashimi-sushi-platters',
            imageUrls: [IMG('nigiri-setsushi.webp')],
            unit: 'PACK',
            tags: ['sushi'],
        },
        {
            name: 'Tuna Avocado Sushi',
            slug: 'tuna-avocado-sushi',
            price: 15.00,
            categorySlug: 'sashimi-sushi-platters',
            imageUrls: [IMG('nigiri-setsushi.webp')],
            unit: 'PACK',
            tags: ['sushi'],
        },
        {
            name: 'Prawn Avocado Sushi',
            slug: 'prawn-avocado-sushi',
            price: 15.00,
            categorySlug: 'sashimi-sushi-platters',
            imageUrls: [IMG('nigiri-setsushi.webp')],
            unit: 'PACK',
            tags: ['sushi'],
        },
        {
            name: 'Sashimi Platter Small',
            slug: 'sashimi-platter-small',
            price: 30.00,
            categorySlug: 'sashimi-sushi-platters',
            imageUrls: [IMG('nigiri-setsushi.webp')],
            unit: 'PIECE',
            tags: ['platter'],
            description: 'Assorted sashimi platter - perfect for 1-2 people',
        },
        {
            name: 'Sashimi Platter Medium',
            slug: 'sashimi-platter-medium',
            price: 60.00,
            categorySlug: 'sashimi-sushi-platters',
            imageUrls: [IMG('nigiri-setsushi.webp')],
            unit: 'PIECE',
            tags: ['platter'],
            description: 'Assorted sashimi platter - perfect for 2-4 people',
        },
        {
            name: 'Sashimi Platter Large',
            slug: 'sashimi-platter-large',
            price: 100.00,
            categorySlug: 'sashimi-sushi-platters',
            imageUrls: [IMG('nigiri-setsushi.webp')],
            unit: 'PIECE',
            tags: ['platter'],
            description: 'Assorted sashimi platter - perfect for 4-6 people',
        },
        {
            name: 'Sushi Platter Small',
            slug: 'sushi-platter-small',
            price: 50.00,
            categorySlug: 'sashimi-sushi-platters',
            imageUrls: [IMG('nigiri-setsushi.webp')],
            unit: 'PIECE',
            tags: ['platter', 'sushi'],
            description: 'Assorted sushi platter - perfect for 2-3 people',
        },
        {
            name: 'Sushi Platter Large',
            slug: 'sushi-platter-large',
            price: 100.00,
            categorySlug: 'sashimi-sushi-platters',
            imageUrls: [IMG('nigiri-setsushi.webp')],
            unit: 'PIECE',
            tags: ['platter', 'sushi'],
            description: 'Assorted sushi platter - perfect for 4-8 people',
        },

        // ═══════════════════════════════════════
        // SAUCES
        // ═══════════════════════════════════════
        {
            name: 'Tartare Sauce',
            slug: 'tartare-sauce',
            price: 6.00,
            categorySlug: 'sauces',
            imageUrls: [],
            unit: 'PIECE',
            tags: ['sauce'],
        },
        {
            name: 'Cocktail Sauce',
            slug: 'cocktail-sauce',
            price: 6.00,
            categorySlug: 'sauces',
            imageUrls: [],
            unit: 'PIECE',
            tags: ['sauce'],
        },
        {
            name: 'Sweet Chilli Sauce',
            slug: 'sweet-chilli-sauce',
            price: 6.00,
            categorySlug: 'sauces',
            imageUrls: [],
            unit: 'PIECE',
            tags: ['sauce'],
        },
        {
            name: 'Garlic Aioli',
            slug: 'garlic-aioli',
            price: 6.00,
            categorySlug: 'sauces',
            imageUrls: [],
            unit: 'PIECE',
            tags: ['sauce'],
        },
        {
            name: 'Lemon Butter Sauce',
            slug: 'lemon-butter-sauce',
            price: 6.00,
            categorySlug: 'sauces',
            imageUrls: [],
            unit: 'PIECE',
            tags: ['sauce'],
        },
        {
            name: 'Wasabi',
            slug: 'wasabi',
            price: 3.00,
            categorySlug: 'sauces',
            imageUrls: [],
            unit: 'PIECE',
            tags: ['sauce', 'sashimi'],
        },
        {
            name: 'Soy Sauce',
            slug: 'soy-sauce',
            price: 3.00,
            categorySlug: 'sauces',
            imageUrls: [],
            unit: 'PIECE',
            tags: ['sauce', 'sashimi'],
        },
        {
            name: 'Pickled Ginger',
            slug: 'pickled-ginger',
            price: 4.00,
            categorySlug: 'sauces',
            imageUrls: [],
            unit: 'PIECE',
            tags: ['sauce', 'sashimi'],
        },
        {
            name: 'Lemon Wedges',
            slug: 'lemon-wedges',
            price: 2.00,
            categorySlug: 'sauces',
            imageUrls: [],
            unit: 'PIECE',
            tags: ['garnish'],
        },
        {
            name: 'Seafood Seasoning',
            slug: 'seafood-seasoning',
            price: 5.00,
            categorySlug: 'sauces',
            imageUrls: [],
            unit: 'PIECE',
            tags: ['sauce'],
        },

        // ═══════════════════════════════════════
        // SMOKED & CURED FISH
        // ═══════════════════════════════════════
        {
            name: 'Smoked Sliced Salmon 200g',
            slug: 'smoked-sliced-salmon-200g',
            price: 14.00,
            categorySlug: 'smoked-cured-fish',
            imageUrls: [],
            unit: 'PACK',
            tags: ['smoked'],
        },
        {
            name: 'Smoked Sliced Salmon 1kg',
            slug: 'smoked-sliced-salmon-1kg',
            price: 55.00,
            categorySlug: 'smoked-cured-fish',
            imageUrls: [],
            unit: 'PACK',
            tags: ['smoked'],
        },
        {
            name: 'Smoked Whole Trout',
            slug: 'smoked-whole-trout',
            price: 25.00,
            categorySlug: 'smoked-cured-fish',
            imageUrls: [IMG('rainbow-trout-whole.webp')],
            unit: 'PIECE',
            tags: ['smoked'],
        },
    ];

    console.log(`Seeding ${products.length} products...`);

    for (const product of products) {
        const { categorySlug, ...productData } = product;
        await prisma.product.create({
            data: {
                ...productData,
                categoryId: categoryMap[categorySlug],
                stockQuantity: Math.floor(Math.random() * 50) + 10,
                isAvailable: true,
            },
        });
    }
    console.log(`Created ${products.length} products`);

    // ── Delete and recreate Wholesale Categories & Sample Items ──
    await prisma.wholesaleOrderItem.deleteMany({});
    await prisma.wholesaleOrder.deleteMany({});
    await prisma.wholesalePriceItem.deleteMany({});
    await prisma.wholesaleCategory.deleteMany({});

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
