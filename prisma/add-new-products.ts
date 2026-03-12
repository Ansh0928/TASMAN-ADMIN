import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const IMG = (name: string) => `/assets/products/${name}`;

async function main() {
    // Get category IDs
    const categories = await prisma.category.findMany();
    const catMap: Record<string, string> = {};
    for (const c of categories) catMap[c.slug] = c.id;

    // Update Frozen Traded category image
    if (catMap['frozen-traded']) {
        await prisma.category.update({
            where: { id: catMap['frozen-traded'] },
            data: { imageUrl: IMG('frozen-lobster-meat.webp') },
        });
        console.log('Updated Frozen Traded category image');
    }

    // Update Sushi products with new images
    const nigiri = await prisma.product.findUnique({ where: { slug: 'nigiri-sushi-set' } });
    if (nigiri && !nigiri.imageUrls.includes(IMG('sushi-nigiri-set.webp'))) {
        await prisma.product.update({
            where: { slug: 'nigiri-sushi-set' },
            data: { imageUrls: [...nigiri.imageUrls, IMG('sushi-nigiri-set.webp')] },
        });
        console.log('Updated Nigiri Sushi Set images');
    }

    const sushiPlatter = await prisma.product.findUnique({ where: { slug: 'sushi-platter' } });
    if (sushiPlatter && !sushiPlatter.imageUrls.includes(IMG('sushi-nigiri-set.webp'))) {
        await prisma.product.update({
            where: { slug: 'sushi-platter' },
            data: { imageUrls: [...sushiPlatter.imageUrls, IMG('sushi-nigiri-set.webp')] },
        });
        console.log('Updated Sushi Platter images');
    }

    // Add Sashimi Platter if it doesn't exist
    const existingSashimi = await prisma.product.findUnique({ where: { slug: 'sashimi-platter' } });
    if (!existingSashimi && catMap['sashimi']) {
        await prisma.product.create({
            data: {
                name: 'Sashimi Platter',
                slug: 'sashimi-platter',
                price: 35.00,
                categoryId: catMap['sashimi'],
                imageUrls: [IMG('sashimi-platter.webp')],
                unit: 'PIECE',
                tags: [],
                description: 'Sashimi platter — a premium selection of thinly sliced raw fish, beautifully arranged. Made to order with the freshest catches at Tasman Star Seafoods.',
                stockQuantity: 20,
                isAvailable: true,
            },
        });
        console.log('Created Sashimi Platter');
    }

    // Add Frozen Traded products
    const frozenProducts = [
        { name: 'Baby Octopus 1kg', slug: 'baby-octopus-1kg', price: 18.00, image: 'baby-octopus-1kg.webp', unit: 'PACK' as const, description: 'Frozen baby octopus — tender, bite-sized octopus perfect for grilling, stir-frying or adding to salads. 1kg pack.' },
        { name: 'Blue Wave Pineapple Cut Squid Fillets', slug: 'blue-wave-pineapple-cut-squid-fillets', price: 16.00, image: 'blue-wave-raw-pineapple-cut-squid-fillets.webp', unit: 'PACK' as const, description: 'Blue Wave raw pineapple cut squid fillets — scored and ready to cook. Great for stir-fries, grilling or deep frying.' },
        { name: 'Blue Wave Sliced Smoked Salmon', slug: 'blue-wave-sliced-smoked-salmon', price: 14.00, image: 'blue-wave-sliced-smoked-salmon.webp', unit: 'PACK' as const, description: 'Blue Wave sliced smoked salmon — premium cold-smoked salmon, thinly sliced. Perfect for platters, bagels and canapés.' },
        { name: 'Frozen Cooked Octopus', slug: 'frozen-cooked-octopus', price: 22.00, image: 'frozen-cooked-octopus.webp', unit: 'KG' as const, description: 'Frozen cooked octopus — pre-cooked and ready to slice for salads, char-grill or add to pasta dishes.' },
        { name: 'Frozen Lobster Meat', slug: 'frozen-lobster-meat', price: 55.00, image: 'frozen-lobster-meat.webp', unit: 'PACK' as const, description: 'Frozen lobster meat — premium shelled lobster meat, perfect for lobster rolls, pasta, bisques or served with butter.' },
        { name: 'Frozen Whole Octopus', slug: 'frozen-whole-octopus', price: 20.00, image: 'frozen-whole-octopus.webp', unit: 'KG' as const, description: 'Frozen whole octopus — perfect for slow-cooking, braising or char-grilling. Tenderises beautifully when cooked low and slow.' },
        { name: 'Le Patron Salt & Pepper Squid', slug: 'le-patron-salt-pepper-squid', price: 15.00, image: 'le-patron-salt-and-pepper-squid.webp', unit: 'PACK' as const, description: 'Le Patron salt & pepper squid — crumbed and seasoned squid rings, ready to deep fry or air fry.' },
        { name: "Mure's Fish Stock", slug: 'mures-fish-stock', price: 9.00, image: 'mures-fish-stock.webp', unit: 'PACK' as const, description: "Mure's fish stock — rich, flavourful fish stock. The perfect base for seafood soups, risottos and sauces." },
        { name: "Mure's Prawn Bisque", slug: 'mures-prawn-bisque', price: 12.00, image: 'mures-prawn-bisque.webp', unit: 'PACK' as const, description: "Mure's prawn bisque — a rich, creamy prawn soup ready to heat and serve." },
        { name: "Mure's Smoky Fish Chowder", slug: 'mures-smoky-fish-chowder', price: 12.00, image: 'mures-smoky-fish-chowder.webp', unit: 'PACK' as const, description: "Mure's smoky fish chowder — a hearty, smoky chowder with chunks of fish and vegetables." },
        { name: 'Nori Seaweed Sheets', slug: 'nori-seaweed-sheets', price: 8.00, image: 'nori-seaweed-sheets.webp', unit: 'PACK' as const, description: 'Nori seaweed sheets — premium roasted seaweed for sushi rolls, onigiri and snacking.' },
        { name: 'Oceanic Raw Prawn Cutlets', slug: 'oceanic-raw-prawn-cutlets', price: 16.00, image: 'oceanic-raw-prawn-cutlets.webp', unit: 'PACK' as const, description: 'Oceanic raw prawn cutlets — peeled, deveined and butterflied prawns ready for cooking.' },
        { name: 'Pacific West Crab Meat', slug: 'pacific-west-crab-meat', price: 12.00, image: 'pacific-west-crab-meat.webp', unit: 'PACK' as const, description: 'Pacific West crab meat — ready-to-use crab meat for crab cakes, salads, pasta or dips.' },
        { name: 'Sea Gift Raw Prawns', slug: 'sea-gift-raw-prawns', price: 14.00, image: 'sea-gift-raw-prawns.webp', unit: 'PACK' as const, description: 'Sea Gift raw prawns — frozen raw prawns ready for your favourite recipes. Great value for everyday cooking.' },
        { name: 'Snowy Mountain Smoked Trout', slug: 'snowy-mountain-smoked-trout', price: 16.00, image: 'snowy-mountain-smoked-trout.webp', unit: 'PACK' as const, description: 'Snowy Mountain smoked trout — Australian smoked trout with a delicate, smoky flavour. Perfect for salads and platters.' },
        { name: 'Sockeye Salmon Fillet', slug: 'sockeye-salmon-fillet', price: 28.00, image: 'sockeye-salmon-fillet.webp', unit: 'PACK' as const, description: 'Sockeye salmon fillet — wild-caught sockeye salmon with deep red flesh and rich flavour.' },
        { name: 'Spring Bay Mussels', slug: 'spring-bay-mussels', price: 10.00, image: 'spring-bay-mussels.webp', unit: 'PACK' as const, description: 'Spring Bay mussels — Tasmanian rope-grown mussels, frozen for convenience.' },
        { name: 'Talleys Greenshell Mussels Chilli', slug: 'talleys-greenshell-mussels-chilli', price: 11.00, image: 'talleys-greenshell-mussels-chilli.webp', unit: 'PACK' as const, description: 'Talleys greenshell mussels with chilli — New Zealand half-shell mussels with a spicy chilli topping. Oven-ready.' },
        { name: 'Talleys Greenshell Mussels Cook & Go', slug: 'talleys-greenshell-mussels-cook-and-go', price: 11.00, image: 'talleys-greenshell-mussels-cook-and-go.webp', unit: 'PACK' as const, description: 'Talleys greenshell mussels cook & go — New Zealand half-shell mussels ready for the oven or barbecue.' },
        { name: 'Talleys Greenshell Mussels Garlic', slug: 'talleys-greenshell-mussels-garlic', price: 11.00, image: 'talleys-greenshell-mussels-garlic.webp', unit: 'PACK' as const, description: 'Talleys greenshell mussels with garlic — New Zealand half-shell mussels with garlic butter topping.' },
        { name: 'Talleys Greenshell Mussels Original', slug: 'talleys-greenshell-mussels-original', price: 10.00, image: 'talleys-greenshell-mussels-original.webp', unit: 'PACK' as const, description: 'Talleys greenshell mussels original — New Zealand half-shell mussels, natural and unflavoured.' },
        { name: 'Tobiko Fish Roe', slug: 'tobiko-fish-roe', price: 18.00, image: 'tobiko-fish-roe.webp', unit: 'PACK' as const, description: 'Tobiko fish roe — vibrant orange flying fish roe with a mild, slightly sweet flavour. Essential for sushi and garnishing.' },
    ];

    let created = 0;
    for (const p of frozenProducts) {
        const exists = await prisma.product.findUnique({ where: { slug: p.slug } });
        if (!exists && catMap['frozen-traded']) {
            await prisma.product.create({
                data: {
                    name: p.name,
                    slug: p.slug,
                    price: p.price,
                    categoryId: catMap['frozen-traded'],
                    imageUrls: [IMG(p.image)],
                    unit: p.unit,
                    tags: [],
                    description: p.description,
                    stockQuantity: Math.floor(Math.random() * 50) + 10,
                    isAvailable: true,
                },
            });
            created++;
            console.log(`Created: ${p.name}`);
        } else if (exists) {
            console.log(`Skipped (exists): ${p.name}`);
        }
    }

    console.log(`\nDone! Created ${created} new Frozen Traded products.`);
    await pool.end();
}

main().catch(console.error);
