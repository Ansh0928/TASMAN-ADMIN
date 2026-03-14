/**
 * March 2026 — Live Database Migration Script
 *
 * Applies category renames, product fixes (dedup, recategorize, rename, prices),
 * and adds ~70+ new products. Does NOT destroy orders or customer data.
 *
 * Usage:
 *   npx tsx prisma/scripts/march-2026-updates.ts
 *
 * Run against dev/staging first, then production.
 */
import 'dotenv/config';
import { PrismaClient } from '../../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const IMG = (name: string) => `/assets/products/${name}`;

async function main() {
    console.log('Starting March 2026 updates...');

    // ═══════════════════════════════════════════════════════════
    // PHASE A: Category Renames
    // ═══════════════════════════════════════════════════════════

    // A1: Rename "Crabs (Live)" → "Live Seafood"
    const liveSeafoodCat = await prisma.category.findFirst({ where: { slug: 'crabs-live' } });
    if (liveSeafoodCat) {
        await prisma.category.update({
            where: { id: liveSeafoodCat.id },
            data: { name: 'Live Seafood', slug: 'live-seafood' },
        });
        console.log('Renamed "Crabs (Live)" → "Live Seafood"');
    } else {
        console.log('Category "crabs-live" not found — may already be renamed');
    }

    // A2: Rename "Sauces & Condiments" → "Sauces, Condiments & Packaged Goods"
    const saucesCat = await prisma.category.findFirst({ where: { slug: 'sauces-condiments' } });
    if (saucesCat) {
        await prisma.category.update({
            where: { id: saucesCat.id },
            data: { name: 'Sauces, Condiments & Packaged Goods', slug: 'sauces-condiments-packaged' },
        });
        console.log('Renamed "Sauces & Condiments" → "Sauces, Condiments & Packaged Goods"');
    } else {
        console.log('Category "sauces-condiments" not found — may already be renamed');
    }

    // Get all category IDs for later use
    const allCategories = await prisma.category.findMany();
    const catMap: Record<string, string> = {};
    for (const c of allCategories) {
        catMap[c.slug] = c.id;
    }

    // ═══════════════════════════════════════════════════════════
    // PHASE B: Product Fixes
    // ═══════════════════════════════════════════════════════════

    // B2: Remove duplicate Alfonsino entries (keep alfonsino-whole)
    for (const slug of ['alfonsina-whole', 'alfonsino']) {
        const dup = await prisma.product.findFirst({ where: { slug } });
        if (dup) {
            // Move any order items to the kept product
            const kept = await prisma.product.findFirst({ where: { slug: 'alfonsino-whole' } });
            if (kept) {
                await prisma.orderItem.updateMany({
                    where: { productId: dup.id },
                    data: { productId: kept.id },
                });
            }
            await prisma.product.delete({ where: { id: dup.id } });
            console.log(`Removed duplicate: ${slug}`);
        }
    }
    // Update kept alfonsino-whole images
    const alfonsino = await prisma.product.findFirst({ where: { slug: 'alfonsino-whole' } });
    if (alfonsino) {
        await prisma.product.update({
            where: { id: alfonsino.id },
            data: { imageUrls: [IMG('alfonsino-whole.webp'), IMG('alfonsina-whole.webp'), IMG('alfonsino.webp')] },
        });
    }

    // B1: Remove duplicate Octopus (keep cleaned-octopus)
    const dupOccy = await prisma.product.findFirst({ where: { slug: 'local-clean-and-tumbled-octopus' } });
    if (dupOccy) {
        const keptOccy = await prisma.product.findFirst({ where: { slug: 'cleaned-octopus' } });
        if (keptOccy) {
            await prisma.orderItem.updateMany({
                where: { productId: dupOccy.id },
                data: { productId: keptOccy.id },
            });
        }
        await prisma.product.delete({ where: { id: dupOccy.id } });
        console.log('Removed duplicate: local-clean-and-tumbled-octopus');
    }

    // B3: Remove duplicate cutlet (keep raw-prawn-cutlets)
    const dupCutlet = await prisma.product.findFirst({ where: { slug: 'green-king-prawn-cutlet' } });
    if (dupCutlet) {
        const keptCutlet = await prisma.product.findFirst({ where: { slug: 'raw-prawn-cutlets' } });
        if (keptCutlet) {
            await prisma.orderItem.updateMany({
                where: { productId: dupCutlet.id },
                data: { productId: keptCutlet.id },
            });
        }
        await prisma.product.delete({ where: { id: dupCutlet.id } });
        console.log('Removed duplicate: green-king-prawn-cutlet');
    }

    // B4: Move Marinara Mix & BBQ Octopus → prepared-meals
    const prepMealsId = catMap['prepared-meals'];
    if (prepMealsId) {
        for (const slug of ['marinara-mix', 'bbq-octopus']) {
            const p = await prisma.product.findFirst({ where: { slug } });
            if (p) {
                await prisma.product.update({ where: { id: p.id }, data: { categories: { updateMany: { where: { isPrimary: true }, data: { categoryId: prepMealsId } } } } });
                console.log(`Moved ${slug} → prepared-meals`);
            }
        }
    }

    // B5: Rename "Housemade Salads" → "Seafood Salad"
    const salad = await prisma.product.findFirst({ where: { slug: 'housemade-salads' } });
    if (salad) {
        await prisma.product.update({
            where: { id: salad.id },
            data: { name: 'Seafood Salad', slug: 'seafood-salad' },
        });
        console.log('Renamed "Housemade Salads" → "Seafood Salad"');
    }

    // B6: Move products OUT of Frozen Traded
    const saucesId = catMap['sauces-condiments-packaged'] || catMap['sauces-condiments'];
    if (saucesId) {
        for (const slug of ['snowy-mountain-smoked-trout', 'pacific-west-crab-meat', 'mures-fish-stock', 'mures-prawn-bisque', 'mures-smoky-fish-chowder']) {
            const p = await prisma.product.findFirst({ where: { slug } });
            if (p) {
                await prisma.product.update({ where: { id: p.id }, data: { categories: { updateMany: { where: { isPrimary: true }, data: { categoryId: saucesId } } } } });
                console.log(`Moved ${slug} → sauces-condiments-packaged`);
            }
        }
    }

    // B9: Price updates
    const priceUpdates: Record<string, number> = {
        'gold-band-snapper-whole': 55.00,
        'john-dory-whole': 35.00,
        'rainbow-trout-whole': 35.00,
        'coral-trout-whole': 60.00,
        'blue-cod': 45.00,
        'qld-barramundi-whole': 25.00,
        'cooked-tiger-prawns': 41.00,
    };

    for (const [slug, price] of Object.entries(priceUpdates)) {
        const p = await prisma.product.findFirst({ where: { slug } });
        if (p) {
            await prisma.product.update({ where: { id: p.id }, data: { price } });
            console.log(`Updated price: ${slug} → $${price}`);
        }
    }

    // Add new images to existing products
    const imageUpdates: Record<string, string[]> = {
        'gold-band-snapper-whole': [IMG('gold-band-snapper-whole.webp'), IMG('gold-band-snapper-whole-2.webp')],
        'rainbow-trout-whole': [IMG('rainbow-trout-whole.webp'), IMG('rainbow-trout-whole-2.webp')],
        'coral-trout-whole': [IMG('coraltrout-whole.webp'), IMG('coral-trout-whole-2.webp')],
        'blue-cod': [IMG('blue-code-gg.webp'), IMG('blue-cod-whole-2.webp')],
        'qld-barramundi-whole': [IMG('qld-barra-whole.webp'), IMG('barramundi-whole-2.webp')],
        'king-ora-salmon-whole': [IMG('king-ora-salmon-whole.webp'), IMG('salmon-whole-2.webp')],
    };

    for (const [slug, urls] of Object.entries(imageUpdates)) {
        const p = await prisma.product.findFirst({ where: { slug } });
        if (p) {
            await prisma.product.update({ where: { id: p.id }, data: { imageUrls: urls } });
            console.log(`Updated images: ${slug}`);
        }
    }

    // ═══════════════════════════════════════════════════════════
    // PHASE C: New Products
    // ═══════════════════════════════════════════════════════════

    type NewProduct = {
        name: string;
        slug: string;
        price: number;
        categorySlug: string;
        imageUrls: string[];
        unit: 'KG' | 'PIECE' | 'DOZEN' | 'BOX' | 'PACK';
        description: string;
    };

    const newProducts: NewProduct[] = [
        // C1: Fish (Whole)
        { name: 'Silver Trevally Whole', slug: 'silver-trevally-whole', price: 30, categorySlug: 'fish-whole', imageUrls: [IMG('silver-trevally-whole.webp')], unit: 'KG', description: 'Whole silver trevally — a versatile Australian fish with firm, white flesh and a mild, slightly sweet flavour.' },
        { name: 'Bonito Whole', slug: 'bonito-whole', price: 25, categorySlug: 'fish-whole', imageUrls: [IMG('bonito-whole.webp')], unit: 'KG', description: 'Whole bonito — a smaller tuna relative with rich, dark flesh and bold flavour.' },
        { name: 'Gurnard Whole', slug: 'gurnard-whole', price: 30, categorySlug: 'fish-whole', imageUrls: [IMG('gurnard-whole.webp')], unit: 'KG', description: 'Whole gurnard — a striking fish with firm, sweet white flesh.' },
        { name: 'Murray Cod Whole', slug: 'murray-cod-whole', price: 40, categorySlug: 'fish-whole', imageUrls: [IMG('murray-cod-whole.webp')], unit: 'KG', description: "Whole Murray cod — Australia's largest freshwater fish with firm, white, mild flesh." },
        { name: 'QLD Grouper Whole', slug: 'qld-grouper-whole', price: 40, categorySlug: 'fish-whole', imageUrls: [IMG('qld-grouper-whole.webp')], unit: 'KG', description: 'Whole Queensland grouper — a large reef fish with firm, moist white flesh.' },
        { name: 'Baby Barra Whole', slug: 'baby-barra-whole', price: 20, categorySlug: 'fish-whole', imageUrls: [IMG('baby-barra-whole.webp')], unit: 'KG', description: 'Whole baby barramundi — small, tender barramundi perfect for single-serve portions.' },
        { name: 'Ocean Perch Whole', slug: 'ocean-perch-whole', price: 0, categorySlug: 'fish-whole', imageUrls: [IMG('img0821.webp')], unit: 'KG', description: 'Whole ocean perch — price set in store.' },
        { name: 'Silver Bream Whole', slug: 'silver-bream-whole', price: 0, categorySlug: 'fish-whole', imageUrls: [IMG('img0821.webp')], unit: 'KG', description: 'Whole silver bream — price set in store.' },
        { name: 'Smoked Trout', slug: 'smoked-trout', price: 18, categorySlug: 'fish-whole', imageUrls: [IMG('snowy-mountain-smoked-trout.webp')], unit: 'KG', description: 'Smoked trout — delicately smoked whole trout with a rich, smoky flavour.' },

        // C2: Fish (Fillets & Steaks)
        { name: 'Gold Band Snapper Fillet', slug: 'gold-band-snapper-fillet', price: 65, categorySlug: 'fish-fillets-steaks', imageUrls: [IMG('img0907.webp')], unit: 'KG', description: 'Gold band snapper fillet — premium deep-water snapper.' },
        { name: 'Local Snapper Fillet', slug: 'local-snapper-fillet', price: 65, categorySlug: 'fish-fillets-steaks', imageUrls: [IMG('local-snapper-fillet.webp')], unit: 'KG', description: 'Local snapper fillet — wild-caught snapper filleted fresh daily.' },
        { name: 'Tuna Steak', slug: 'tuna-steak', price: 55, categorySlug: 'fish-fillets-steaks', imageUrls: [IMG('img5217.webp')], unit: 'KG', description: 'Tuna steak — thick-cut tuna with deep red flesh.' },
        { name: 'Monkfish Fillet', slug: 'monkfish-fillet', price: 45, categorySlug: 'fish-fillets-steaks', imageUrls: [IMG('monkfish-fillet.webp')], unit: 'KG', description: "Monkfish fillet — known as poor man's lobster for its firm, sweet flesh." },
        { name: 'Gurnard Fillet', slug: 'gurnard-fillet', price: 50, categorySlug: 'fish-fillets-steaks', imageUrls: [IMG('img2266.webp')], unit: 'KG', description: 'Gurnard fillet — sweet, firm white fillets.' },
        { name: 'Salon Barramundi Fillet', slug: 'salon-barramundi-fillet', price: 45, categorySlug: 'fish-fillets-steaks', imageUrls: [IMG('img0866.webp')], unit: 'KG', description: 'Salon (farmed) barramundi fillet.' },
        { name: 'Wild Barramundi Fillet', slug: 'wild-barramundi-fillet', price: 70, categorySlug: 'fish-fillets-steaks', imageUrls: [IMG('img1949.webp')], unit: 'KG', description: 'Wild barramundi fillet — wild-caught with complex flavour.' },
        { name: 'Mangrove Jack Fillet', slug: 'mangrove-jack-fillet', price: 50, categorySlug: 'fish-fillets-steaks', imageUrls: [IMG('img5446.webp')], unit: 'KG', description: 'Mangrove jack fillet — a tropical species with firm, sweet white flesh.' },
        { name: 'Mackerel Cutlets', slug: 'mackerel-cutlets', price: 45, categorySlug: 'fish-fillets-steaks', imageUrls: [IMG('img6680.webp')], unit: 'KG', description: 'Mackerel cutlets — thick, meaty cutlets rich in omega-3s.' },
        { name: 'Salmon Sides', slug: 'salmon-sides', price: 50, categorySlug: 'fish-fillets-steaks', imageUrls: [IMG('img0821.webp')], unit: 'KG', description: 'Salmon sides — whole side of premium salmon.' },
        { name: 'Salmon Portions', slug: 'salmon-portions', price: 55, categorySlug: 'fish-fillets-steaks', imageUrls: [IMG('salmon-portions.webp')], unit: 'KG', description: 'Salmon portions — individually portioned premium salmon fillets.' },
        { name: 'Barra Fillet', slug: 'barra-fillet', price: 50, categorySlug: 'fish-fillets-steaks', imageUrls: [IMG('barra-fillet.webp')], unit: 'KG', description: "Barramundi fillet — Australia's most popular fish." },
        { name: 'Barra Sides', slug: 'barra-sides', price: 45, categorySlug: 'fish-fillets-steaks', imageUrls: [IMG('img5402.webp')], unit: 'KG', description: 'Barramundi sides — whole side of barramundi.' },
        { name: 'Coral Trout Fillet', slug: 'coral-trout-fillet', price: 120, categorySlug: 'fish-fillets-steaks', imageUrls: [IMG('coral-trout-fillet.webp')], unit: 'KG', description: "Coral trout fillet — Queensland's most prized reef fish fillet." },
        { name: 'Flathead Fillet', slug: 'flathead-fillet', price: 65, categorySlug: 'fish-fillets-steaks', imageUrls: [IMG('flathead-fillet.webp')], unit: 'KG', description: "Flathead fillet — Australia's favourite fish for fish and chips." },
        { name: 'Ling Fillet', slug: 'ling-fillet', price: 50, categorySlug: 'fish-fillets-steaks', imageUrls: [IMG('ling-fillet.webp')], unit: 'KG', description: 'Ling fillet — a deep-water fish with firm, white flesh.' },
        { name: 'Jewfish Fillet', slug: 'jewfish-fillet', price: 50, categorySlug: 'fish-fillets-steaks', imageUrls: [IMG('jewfish-fillet.webp')], unit: 'KG', description: 'Jewfish fillet — also known as mulloway, with firm, white flesh.' },
        { name: 'Sockeye Salmon Fillet (Fresh)', slug: 'sockeye-salmon-fillet-fresh', price: 28, categorySlug: 'fish-fillets-steaks', imageUrls: [IMG('sockeye-salmon-fillet.webp')], unit: 'KG', description: 'Fresh sockeye salmon fillet — wild-caught with deep red flesh.' },

        // C3: Prawns (Cooked)
        { name: 'Jumbo Cooked King Prawns', slug: 'jumbo-cooked-king-prawns', price: 42, categorySlug: 'prawns-cooked', imageUrls: [IMG('img4908.webp')], unit: 'KG', description: 'Jumbo cooked king prawns — extra-large, sweet and succulent.' },

        // C4: Prawns (Raw)
        { name: 'Prawn Meat', slug: 'prawn-meat', price: 30, categorySlug: 'prawns-raw', imageUrls: [IMG('img0314.webp')], unit: 'KG', description: 'Raw prawn meat — peeled, deveined and ready to cook.' },
        { name: 'Garlic Prawns', slug: 'garlic-prawns', price: 28, categorySlug: 'prawns-raw', imageUrls: [IMG('img5525.webp')], unit: 'KG', description: 'Garlic prawns — marinated in garlic butter and ready to cook.' },

        // C5: Oysters
        { name: 'Sydney Rock Plate Oysters', slug: 'sydney-rock-plate-oysters', price: 35, categorySlug: 'oysters', imageUrls: [IMG('img0362.webp')], unit: 'DOZEN', description: "Sydney Rock plate oysters — Australia's native oyster." },
        { name: 'Sydney Rock Bistro Oysters', slug: 'sydney-rock-bistro-oysters', price: 30, categorySlug: 'oysters', imageUrls: [IMG('img0362.webp')], unit: 'DOZEN', description: 'Sydney Rock bistro oysters — great value.' },
        { name: 'Sydney Rock Cocktail Oysters', slug: 'sydney-rock-cocktail-oysters', price: 25, categorySlug: 'oysters', imageUrls: [IMG('img0362.webp')], unit: 'DOZEN', description: 'Sydney Rock cocktail oysters — petite-sized.' },
        { name: 'Live Unshucked Oysters', slug: 'live-unshucked-oysters', price: 25, categorySlug: 'oysters', imageUrls: [IMG('live-unshucked-oysters.webp')], unit: 'DOZEN', description: 'Live unshucked oysters — the freshest way to enjoy oysters.' },
        { name: 'Oyster Vinaigrette', slug: 'oyster-vinaigrette', price: 3, categorySlug: 'oysters', imageUrls: [IMG('img0362.webp')], unit: 'PIECE', description: 'Oyster vinaigrette — classic French-style accompaniment.' },

        // C6: Shellfish & Molluscs
        { name: 'Roe Off Scallop', slug: 'roe-off-scallop', price: 90, categorySlug: 'shellfish-molluscs', imageUrls: [IMG('img0861.webp')], unit: 'KG', description: 'Roe off scallop — premium scallop meat without the roe.' },
        { name: 'Mussel Pack 1kg', slug: 'mussel-pack-1kg', price: 19, categorySlug: 'shellfish-molluscs', imageUrls: [IMG('fresh-black-mussels.webp')], unit: 'PACK', description: 'Fresh mussel pack — 1kg.' },
        { name: 'Cooked Vongole Pack 1kg', slug: 'cooked-vongole-pack-1kg', price: 40, categorySlug: 'shellfish-molluscs', imageUrls: [IMG('img4822.webp')], unit: 'PACK', description: 'Cooked vongole — pre-cooked clams.' },
        { name: 'Greenlip Mussels Half Shell', slug: 'greenlip-mussels-half-shell', price: 25, categorySlug: 'shellfish-molluscs', imageUrls: [IMG('img1343.webp')], unit: 'KG', description: 'Greenlip mussels on half shell.' },
        { name: 'Greenlip Mussels Whole Shell', slug: 'greenlip-mussels-whole-shell', price: 19, categorySlug: 'shellfish-molluscs', imageUrls: [IMG('img1343.webp')], unit: 'KG', description: 'Greenlip mussels in whole shell.' },
        { name: 'Greenlip Mussel Meat', slug: 'greenlip-mussel-meat', price: 35, categorySlug: 'shellfish-molluscs', imageUrls: [IMG('img1343.webp')], unit: 'KG', description: 'Greenlip mussel meat — shelled NZ mussel meat.' },
        { name: 'Cooked Greenlip Half Shell', slug: 'cooked-greenlip-half-shell', price: 25, categorySlug: 'shellfish-molluscs', imageUrls: [IMG('img1343.webp')], unit: 'KG', description: 'Cooked greenlip mussels on half shell.' },
        { name: 'Mussel Pots', slug: 'mussel-pots', price: 12, categorySlug: 'shellfish-molluscs', imageUrls: [IMG('img3372.webp')], unit: 'PIECE', description: 'Mussel pots — individual ready-to-heat mussel pots.' },

        // C7: Bugs, Lobsters & Crayfish
        { name: 'Live Local Lobsters', slug: 'live-local-lobsters', price: 95, categorySlug: 'bugs-lobsters-crayfish', imageUrls: [IMG('img1424.webp')], unit: 'KG', description: 'Live local lobsters — the freshest lobster experience.' },
        { name: 'Lobster Tails', slug: 'lobster-tails', price: 90, categorySlug: 'bugs-lobsters-crayfish', imageUrls: [IMG('img6426.webp')], unit: 'KG', description: 'Lobster tails — premium tails perfect for grilling.' },
        { name: 'Lobster Mornay', slug: 'lobster-mornay', price: 45, categorySlug: 'bugs-lobsters-crayfish', imageUrls: [IMG('img1424.webp')], unit: 'PIECE', description: 'Lobster mornay — lobster in a rich cheese sauce.' },
        { name: 'Bug Meat', slug: 'bug-meat', price: 65, categorySlug: 'bugs-lobsters-crayfish', imageUrls: [IMG('img1344.webp')], unit: 'KG', description: 'Bug meat — shelled Moreton Bay bug tail meat.' },
        { name: 'Cooked Crabs', slug: 'cooked-crabs', price: 30, categorySlug: 'bugs-lobsters-crayfish', imageUrls: [IMG('img6849.webp')], unit: 'KG', description: 'Cooked crabs — freshly cooked and ready to crack.' },
        { name: 'King Crab Clusters', slug: 'king-crab-clusters', price: 85, categorySlug: 'bugs-lobsters-crayfish', imageUrls: [IMG('img6849.webp')], unit: 'KG', description: 'King crab clusters — impressive, meaty crab legs.' },
        { name: 'Crab Meat Jar', slug: 'crab-meat-jar', price: 25, categorySlug: 'bugs-lobsters-crayfish', imageUrls: [IMG('img6849.webp')], unit: 'PIECE', description: 'Crab meat jar — ready-to-use crab meat.' },

        // C8: Squid, Octopus & Cuttlefish
        { name: 'Baby Octopus', slug: 'baby-octopus', price: 20, categorySlug: 'squid-octopus-cuttlefish', imageUrls: [IMG('img5293.webp')], unit: 'KG', description: 'Fresh baby octopus — tender, bite-sized.' },
        { name: 'Large Octopus', slug: 'large-octopus', price: 25, categorySlug: 'squid-octopus-cuttlefish', imageUrls: [IMG('img5334.webp')], unit: 'KG', description: 'Large octopus — great for slow-cooking.' },

        // C9: Frozen Traded
        { name: '1kg Roe Off Scallop (Frozen)', slug: 'frozen-roe-off-scallop-1kg', price: 45, categorySlug: 'frozen-traded', imageUrls: [IMG('img5571.webp')], unit: 'PACK', description: 'Frozen roe off scallop — 1kg pack.' },
        { name: '500g Spanner Meat Packs', slug: 'frozen-spanner-meat-packs', price: 35, categorySlug: 'frozen-traded', imageUrls: [IMG('cooked-spanner-crabs-2.webp')], unit: 'PACK', description: 'Frozen spanner crab meat — 500g packs.' },
        { name: 'Frozen Lobster Tails', slug: 'frozen-lobster-tails', price: 55, categorySlug: 'frozen-traded', imageUrls: [IMG('img6426.webp')], unit: 'PACK', description: 'Frozen lobster tails — individually frozen.' },
        { name: '5kg Large Cooked King Prawn Box', slug: 'frozen-5kg-cooked-king-box', price: 180, categorySlug: 'frozen-traded', imageUrls: [IMG('img6063.webp')], unit: 'BOX', description: '5kg box of large cooked king prawns.' },
        { name: '5kg Raw Large Tiger Prawn Box', slug: 'frozen-5kg-raw-tiger-box', price: 160, categorySlug: 'frozen-traded', imageUrls: [IMG('img2265.webp')], unit: 'BOX', description: '5kg box of raw large tiger prawns.' },
        { name: 'WA Crayfish Cooked (Frozen)', slug: 'wa-crayfish-cooked-frozen', price: 75, categorySlug: 'frozen-traded', imageUrls: [IMG('wa-cray-fish-cooked.webp')], unit: 'KG', description: 'Frozen cooked WA crayfish.' },
        { name: 'Squid Tubes (Frozen)', slug: 'frozen-squid-tubes', price: 18, categorySlug: 'frozen-traded', imageUrls: [IMG('img2284.webp')], unit: 'PACK', description: 'Frozen squid tubes — cleaned and ready.' },

        // C10: Sauces, Condiments & Packaged Goods
        { name: 'Cocktail Sauce (Small)', slug: 'cocktail-sauce-small', price: 4, categorySlug: 'sauces-condiments-packaged', imageUrls: [IMG('img3304.webp')], unit: 'PIECE', description: 'Cocktail sauce — single-serve.' },
        { name: 'Tartare Sauce (Small)', slug: 'tartare-sauce-small', price: 4, categorySlug: 'sauces-condiments-packaged', imageUrls: [IMG('img3304.webp')], unit: 'PIECE', description: 'Tartare sauce — single-serve.' },
        { name: 'Garlic Aioli (Small)', slug: 'garlic-aioli-small', price: 4, categorySlug: 'sauces-condiments-packaged', imageUrls: [IMG('img3304.webp')], unit: 'PIECE', description: 'Garlic aioli — single-serve.' },
        { name: 'Sweet Soy Sauce (Small)', slug: 'sweet-soy-sauce-small', price: 4, categorySlug: 'sauces-condiments-packaged', imageUrls: [IMG('img3304.webp')], unit: 'PIECE', description: 'Sweet soy sauce — single-serve.' },
        { name: 'Cocktail Sauce (Bottle)', slug: 'cocktail-sauce-bottle', price: 8, categorySlug: 'sauces-condiments-packaged', imageUrls: [IMG('img3304.webp')], unit: 'PIECE', description: 'Cocktail sauce bottle — family size.' },
        { name: 'Tartare Sauce (Bottle)', slug: 'tartare-sauce-bottle', price: 8, categorySlug: 'sauces-condiments-packaged', imageUrls: [IMG('img3304.webp')], unit: 'PIECE', description: 'Tartare sauce bottle — family size.' },
        { name: 'Sriracha Mayo', slug: 'sriracha-mayo', price: 8, categorySlug: 'sauces-condiments-packaged', imageUrls: [IMG('img3304.webp')], unit: 'PIECE', description: 'Sriracha mayo — spicy, creamy sauce.' },
        { name: 'Japanese Mayo', slug: 'japanese-mayo', price: 8, categorySlug: 'sauces-condiments-packaged', imageUrls: [IMG('img3304.webp')], unit: 'PIECE', description: 'Japanese mayo — Kewpie-style.' },
        { name: 'Ranch Sauce', slug: 'ranch-sauce', price: 8, categorySlug: 'sauces-condiments-packaged', imageUrls: [IMG('img3304.webp')], unit: 'PIECE', description: 'Ranch sauce — creamy, herby.' },
        { name: 'Chilli Mussel Cooking Sauce', slug: 'chilli-mussel-cooking-sauce', price: 10, categorySlug: 'sauces-condiments-packaged', imageUrls: [IMG('img3304.webp')], unit: 'PIECE', description: 'Chilli mussel cooking sauce.' },
        { name: 'Marinara Cooking Sauce', slug: 'marinara-cooking-sauce', price: 10, categorySlug: 'sauces-condiments-packaged', imageUrls: [IMG('img3304.webp')], unit: 'PIECE', description: 'Marinara cooking sauce.' },
        { name: 'Green Curry Cooking Sauce', slug: 'green-curry-cooking-sauce', price: 10, categorySlug: 'sauces-condiments-packaged', imageUrls: [IMG('img3304.webp')], unit: 'PIECE', description: 'Green curry cooking sauce.' },
        { name: 'Red Curry Cooking Sauce', slug: 'red-curry-cooking-sauce', price: 10, categorySlug: 'sauces-condiments-packaged', imageUrls: [IMG('img3304.webp')], unit: 'PIECE', description: 'Red curry cooking sauce.' },
        { name: 'Sardine Fillets (Packaged)', slug: 'sardine-fillets-packaged', price: 8, categorySlug: 'sauces-condiments-packaged', imageUrls: [IMG('img4817.webp')], unit: 'PACK', description: 'Sardine fillets — premium canned.' },
        { name: 'Sardine Trunks (Packaged)', slug: 'sardine-trunks-packaged', price: 8, categorySlug: 'sauces-condiments-packaged', imageUrls: [IMG('img4817.webp')], unit: 'PACK', description: 'Sardine trunks — whole sardines packed in oil.' },
        { name: '200g Smoked Salmon Trays', slug: 'smoked-salmon-trays-200g', price: 14, categorySlug: 'sauces-condiments-packaged', imageUrls: [IMG('blue-wave-sliced-smoked-salmon.webp')], unit: 'PACK', description: '200g smoked salmon trays.' },
        { name: 'Marinated Octopus Pots', slug: 'marinated-octopus-pots', price: 12, categorySlug: 'sauces-condiments-packaged', imageUrls: [IMG('img5334.webp')], unit: 'PIECE', description: 'Marinated octopus pots — tapas-style.' },
        { name: 'Marinated Sardine Pots', slug: 'marinated-sardine-pots', price: 10, categorySlug: 'sauces-condiments-packaged', imageUrls: [IMG('img4817.webp')], unit: 'PIECE', description: 'Marinated sardine pots.' },
    ];

    let created = 0;
    let skipped = 0;
    for (const product of newProducts) {
        const existing = await prisma.product.findFirst({ where: { slug: product.slug } });
        if (existing) {
            skipped++;
            continue;
        }

        const catId = catMap[product.categorySlug];
        if (!catId) {
            console.warn(`Category not found for slug "${product.categorySlug}" — skipping ${product.name}`);
            skipped++;
            continue;
        }

        const { categorySlug, ...data } = product;
        await prisma.product.create({
            data: {
                ...data,
                categories: { create: { categoryId: catId, isPrimary: true } },
                tags: [],
                stockQuantity: Math.floor(Math.random() * 50) + 10,
                isAvailable: true,
            },
        });
        created++;
    }
    console.log(`Created ${created} new products, skipped ${skipped} (already exist)`);

    console.log('\nMarch 2026 updates complete!');
}

main()
    .then(async () => {
        await prisma.$disconnect();
        await pool.end();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        await pool.end();
        process.exit(1);
    });
