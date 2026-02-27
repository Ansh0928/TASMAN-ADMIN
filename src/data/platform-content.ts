/**
 * Tasman Star Seafood — Complete Platform Content Specification
 *
 * Production-ready content powering the entire e-commerce frontend.
 * Modelled after Licious.in with Australian seafood focus.
 *
 * Covers:
 *  - Brand identity & design tokens
 *  - Homepage content (hero banners, category grid, curated rows, testimonials, trust pillars, footer)
 *  - Category / listing page (filters, sort options, sub-category tabs)
 *  - 12 complete product definitions
 *  - Flagship PDP layout (Atlantic Salmon Fillet)
 */

// ─────────────────────────────────────────────
// 1. BRAND IDENTITY
// ─────────────────────────────────────────────

export const brand = {
    name: 'Tasman Star Seafoods',
    tagline: 'Ocean to Plate, Gold Coast Fresh',
    shortTagline: 'Freshness You Can Trust',
    tone: 'premium-casual' as const,
    description:
        'Family-owned Gold Coast seafood business supplying restaurant-quality fish, prawns, and shellfish direct from Australian waters to your kitchen.',
    contact: {
        phone: '(07) 5529 0844',
        email: 'info@tasmanstarseafood.com.au',
        website: 'https://tasmanstarseafood.com.au',
    },
    stores: [
        {
            name: 'Labrador Store',
            address: '213 Brisbane Rd, Labrador QLD 4215',
            hours: 'Mon–Sat 7am–6pm, Sun 7am–3pm',
            coordinates: { lat: -27.7503, lng: 153.3937 },
        },
        {
            name: 'Varsity Lakes Store',
            address: '201 Varsity Parade, Varsity Lakes QLD 4227',
            hours: 'Mon–Sat 7am–6pm, Sun 7am–3pm',
            coordinates: { lat: -28.0825, lng: 153.4127 },
        },
    ],
    social: {
        instagram: 'https://instagram.com/tasmanstarseafood',
        facebook: 'https://facebook.com/tasmanstarseafood',
        tiktok: 'https://tiktok.com/@tasmanstarseafood',
    },
    colors: {
        primary: '#FF8543',
        primaryHover: '#E2743A',
        coral: '#FF7F50',
        darkBg: '#020C1B',
        darkCard: '#0A192F',
        darkTertiary: '#112240',
    },
};

// ─────────────────────────────────────────────
// 2. HOMEPAGE CONTENT
// ─────────────────────────────────────────────

export const homepage = {
    // ── 2a. Navigation ──
    nav: {
        logo: '/logo.svg',
        links: [
            { label: 'Home', href: '/' },
            { label: 'Our Business', href: '/our-business' },
            { label: 'Shop Online', href: '/our-business/online-delivery' },
            { label: 'Our Products', href: '/our-products' },
            { label: 'Wholesale', href: '/wholesale' },
            { label: 'Deals', href: '/deals' },
        ],
        cta: { label: 'Order Now', href: '/our-business/online-delivery' },
    },

    // ── 2b. Hero Banners (3 rotating) ──
    heroBanners: [
        {
            id: 'hero-1',
            headline: 'Fresh Catch, Delivered Daily',
            subline: 'Premium Australian seafood from trawler to table in under 24 hours. Free delivery on orders over $150.',
            cta: { label: 'Shop Now', href: '/our-business/online-delivery' },
            image: '/assets/hero/hero-fresh-catch.jpg',
            bgGradient: 'from-[#0A192F] via-[#0A192F]/90 to-transparent',
            badge: 'Same Day Delivery',
        },
        {
            id: 'hero-2',
            headline: 'Best Buys This Week',
            subline: 'Hand-picked deals on prawns, fillets, and shellfish. Prices you won\'t find anywhere else on the Gold Coast.',
            cta: { label: 'View Deals', href: '/deals' },
            image: '/assets/hero/hero-best-buys.jpg',
            bgGradient: 'from-[#112240] via-[#112240]/90 to-transparent',
            badge: 'Up to 30% Off',
        },
        {
            id: 'hero-3',
            headline: 'Seafood Platters for Every Occasion',
            subline: 'Impress your guests with our signature seafood platters — perfect for Christmas, birthdays, and weekend entertaining.',
            cta: { label: 'Browse Platters', href: '/our-products?category=platters' },
            image: '/assets/hero/hero-platters.jpg',
            bgGradient: 'from-[#0A192F] via-[#0A192F]/80 to-transparent',
            badge: 'Pre-Order Available',
        },
    ],

    // ── 2c. Category Icon Grid (8 circles) ──
    categoryGrid: [
        { label: 'Prawns', slug: 'prawns', icon: '🦐', imageUrl: '/assets/products/prawns.png' },
        { label: 'Fish Fillets', slug: 'fish-fillet', icon: '🐟', imageUrl: '/assets/products/fillets.png' },
        { label: 'Oysters', slug: 'oyster', icon: '🦪', imageUrl: '/assets/products/oysters-mornay.png' },
        { label: 'Crabs & Lobsters', slug: 'crabs-lobsters-bugs', icon: '🦀', imageUrl: '/assets/products/crabs.png' },
        { label: 'Shellfish', slug: 'shellfish', icon: '🐚', imageUrl: '/assets/products/scallops.png' },
        { label: 'Sushi/Sashimi', slug: 'sushi-sashimi', icon: '🍣', imageUrl: '/assets/products/salmon.png' },
        { label: 'Squid & Octopus', slug: 'squid-octopus', icon: '🦑', imageUrl: '/assets/products/octopus.png' },
        { label: 'Whole Fish', slug: 'whole-fish', icon: '🎣', imageUrl: '/assets/products/fillets.png' },
    ],

    // ── 2d. Curated Product Rows (3 rows × 4 products) ──
    curatedRows: [
        {
            id: 'best-buys',
            title: 'Best Buys',
            subtitle: 'Our top picks — quality meets value',
            viewAllHref: '/our-products',
            badge: 'Best Buy',
            productSlugs: [
                'tiger-prawns-1kg',
                'barramundi-fillets-1kg',
                'fresh-scallops-500g',
                'oysters-mornay-each',
            ],
        },
        {
            id: 'fresh-pickups',
            title: 'Fresh Pickups',
            subtitle: 'Today\'s freshest from the trawler',
            viewAllHref: '/deals',
            badge: 'Fresh Pick',
            productSlugs: [
                'cooked-spanner-crab-meat-500g',
                'fresh-sashimi-kingfish-300g',
                'crab-soft-shell-1kg',
                'fresh-sashimi-kingfish-500g-sliced',
            ],
        },
        {
            id: 'family-favourites',
            title: 'Family Favourites',
            subtitle: 'Crowd-pleasers for weekend dinners',
            viewAllHref: '/our-products',
            productSlugs: [
                'salmon-fillet-fresh-1kg',
                'cooked-prawns-1kg',
                'blue-eye-cod-fillets-1kg',
                'octopus-whole-1kg',
            ],
        },
    ],

    // ── 2e. Testimonials (5) ──
    testimonials: [
        {
            id: 't1',
            name: 'Sarah M.',
            location: 'Burleigh Heads',
            rating: 5,
            text: 'The freshest prawns I\'ve ever had delivered. You can taste the difference — they were on the trawler that morning. Amazing service from the Labrador store team.',
            product: 'Tiger Prawns 1kg',
            avatar: '/assets/avatars/sarah.jpg',
        },
        {
            id: 't2',
            name: 'James L.',
            location: 'Southport',
            rating: 5,
            text: 'We order every Friday for our restaurant. Tasman Star\'s wholesale quality is unmatched. The barramundi fillets are always perfectly portioned and crystal fresh.',
            product: 'Barramundi Fillets',
            avatar: '/assets/avatars/james.jpg',
        },
        {
            id: 't3',
            name: 'Emily T.',
            location: 'Robina',
            rating: 5,
            text: 'Ordered the seafood platter for Christmas and it was absolutely stunning. Everyone asked where we got it. Will definitely be ordering again for every celebration.',
            product: 'Seafood Platter',
            avatar: '/assets/avatars/emily.jpg',
        },
        {
            id: 't4',
            name: 'Michael R.',
            location: 'Palm Beach',
            rating: 4,
            text: 'The sashimi-grade kingfish is restaurant quality at retail prices. I make poke bowls every week with it. Delivery is always on time and well packaged.',
            product: 'Sashimi Kingfish',
            avatar: '/assets/avatars/michael.jpg',
        },
        {
            id: 't5',
            name: 'Lisa K.',
            location: 'Broadbeach',
            rating: 5,
            text: 'I\'ve tried every fishmonger on the Gold Coast. Tasman Star is the real deal — properly sourced, properly handled, properly priced. The blue eye cod is incredible.',
            product: 'Blue Eye Cod',
            avatar: '/assets/avatars/lisa.jpg',
        },
    ],

    // ── 2f. Trust Pillars (3) ──
    trustPillars: [
        {
            id: 'tp1',
            icon: 'Anchor',
            title: 'Boat to Door in 24hrs',
            description: 'Our seafood goes from trawler to your table within 24 hours. Temperature-controlled at every step of the cold chain.',
        },
        {
            id: 'tp2',
            icon: 'Shield',
            title: '100% Quality Guarantee',
            description: 'Not happy with your order? We\'ll replace it or refund you — no questions asked. That\'s our freshness promise.',
        },
        {
            id: 'tp3',
            icon: 'Truck',
            title: 'Free Delivery Over $150',
            description: 'Free insulated delivery across the Gold Coast for orders over $150. Same-day delivery available for orders placed before 10am.',
        },
    ],

    // ── 2g. Footer ──
    footer: {
        about:
            'Tasman Star Seafoods is a family-owned Gold Coast business bringing you the freshest Australian seafood since 2005. We work directly with local fishermen to deliver premium quality fish, prawns, and shellfish to your table.',
        columns: [
            {
                title: 'Shop',
                links: [
                    { label: 'All Products', href: '/our-products' },
                    { label: 'Best Buys', href: '/our-products' },
                    { label: 'Fresh Pickups', href: '/deals' },
                    { label: 'Platters', href: '/our-products?category=platters' },
                    { label: 'Gift Cards', href: '/gift-cards' },
                ],
            },
            {
                title: 'Our Business',
                links: [
                    { label: 'About Us', href: '/our-business' },
                    { label: 'Online & Delivery', href: '/our-business/online-delivery' },
                    { label: 'Retail Stores', href: '/our-business/retail-stores' },
                    { label: 'Wholesale', href: '/wholesale' },
                    { label: 'Careers', href: '/careers' },
                ],
            },
            {
                title: 'Help',
                links: [
                    { label: 'Delivery Info', href: '/delivery' },
                    { label: 'Returns & Refunds', href: '/returns' },
                    { label: 'FAQs', href: '/faq' },
                    { label: 'Contact Us', href: '/contact' },
                    { label: 'Privacy Policy', href: '/privacy' },
                ],
            },
        ],
        badges: [
            { label: 'Australian Owned', icon: '🇦🇺' },
            { label: 'Sustainable Sourcing', icon: '🌊' },
            { label: 'HACCP Certified', icon: '✅' },
        ],
        copyright: '© 2025 Tasman Star Seafoods Pty Ltd. All rights reserved. ABN 12 345 678 901.',
    },
};

// ─────────────────────────────────────────────
// 3. CATEGORY / LISTING PAGE CONTENT
// ─────────────────────────────────────────────

export const categoryPage = {
    // ── 3a. Filter Groups (9) ──
    filters: [
        {
            id: 'category',
            label: 'Category',
            type: 'checkbox' as const,
            options: [
                { value: 'prawns', label: 'Prawns', count: 2 },
                { value: 'fish-fillet', label: 'Fish Fillets', count: 4 },
                { value: 'oyster', label: 'Oysters', count: 1 },
                { value: 'crabs-lobsters-bugs', label: 'Crabs, Lobsters & Bugs', count: 4 },
                { value: 'shellfish', label: 'Shellfish', count: 2 },
                { value: 'sushi-sashimi', label: 'Sushi / Sashimi', count: 2 },
                { value: 'squid-octopus', label: 'Squid & Octopus', count: 1 },
                { value: 'whole-fish', label: 'Whole Fish', count: 0 },
                { value: 'frozen-products', label: 'Frozen', count: 0 },
                { value: 'platters', label: 'Platters', count: 0 },
                { value: 'family-value-packs', label: 'Family Value Packs', count: 0 },
                { value: 'condiments-sauces', label: 'Condiments & Sauces', count: 0 },
                { value: 'smoked-cured-fish', label: 'Smoked & Cured', count: 0 },
            ],
        },
        {
            id: 'price-range',
            label: 'Price Range',
            type: 'radio' as const,
            options: [
                { value: '0-20', label: 'Under $20' },
                { value: '20-40', label: '$20 – $40' },
                { value: '40-60', label: '$40 – $60' },
                { value: '60-80', label: '$60 – $80' },
                { value: '80+', label: '$80+' },
            ],
        },
        {
            id: 'preparation',
            label: 'Preparation',
            type: 'checkbox' as const,
            options: [
                { value: 'raw', label: 'Raw / Fresh' },
                { value: 'cooked', label: 'Cooked' },
                { value: 'marinated', label: 'Marinated' },
                { value: 'smoked', label: 'Smoked' },
                { value: 'crumbed', label: 'Crumbed' },
                { value: 'sashimi-grade', label: 'Sashimi Grade' },
            ],
        },
        {
            id: 'weight',
            label: 'Pack Size',
            type: 'checkbox' as const,
            options: [
                { value: '250g', label: '250g' },
                { value: '300g', label: '300g' },
                { value: '500g', label: '500g' },
                { value: '1kg', label: '1kg' },
                { value: '2kg', label: '2kg+' },
            ],
        },
        {
            id: 'sourcing',
            label: 'Sourcing',
            type: 'checkbox' as const,
            options: [
                { value: 'wild-caught', label: 'Wild Caught' },
                { value: 'sustainably-farmed', label: 'Sustainably Farmed' },
                { value: 'local-qld', label: 'Local QLD' },
                { value: 'australian', label: 'Australian' },
                { value: 'imported', label: 'Imported' },
            ],
        },
        {
            id: 'dietary',
            label: 'Dietary',
            type: 'checkbox' as const,
            options: [
                { value: 'gluten-free', label: 'Gluten Free' },
                { value: 'high-protein', label: 'High Protein' },
                { value: 'low-fat', label: 'Low Fat' },
                { value: 'omega-3-rich', label: 'Omega-3 Rich' },
                { value: 'keto-friendly', label: 'Keto Friendly' },
            ],
        },
        {
            id: 'availability',
            label: 'Availability',
            type: 'radio' as const,
            options: [
                { value: 'in-stock', label: 'In Stock' },
                { value: 'pre-order', label: 'Pre-Order' },
                { value: 'all', label: 'Show All' },
            ],
        },
        {
            id: 'specials',
            label: 'Specials',
            type: 'checkbox' as const,
            options: [
                { value: 'best-buy', label: 'Best Buys' },
                { value: 'fresh-pick', label: 'Fresh Picks' },
                { value: 'on-sale', label: 'On Sale' },
                { value: 'new-arrival', label: 'New Arrivals' },
            ],
        },
        {
            id: 'serves',
            label: 'Serves',
            type: 'radio' as const,
            options: [
                { value: '1-2', label: '1–2 people' },
                { value: '3-4', label: '3–4 people' },
                { value: '5-6', label: '5–6 people' },
                { value: '6+', label: '6+ people' },
            ],
        },
    ],

    // ── 3b. Sort Options (6) ──
    sortOptions: [
        { value: 'relevance', label: 'Relevance' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'newest', label: 'Newest First' },
        { value: 'popularity', label: 'Popularity' },
        { value: 'rating', label: 'Highest Rated' },
    ],

    // ── 3c. Sub-Category Tabs (7) ──
    subCategoryTabs: [
        { value: 'all', label: 'All' },
        { value: 'prawns', label: 'Prawns' },
        { value: 'fish-fillet', label: 'Fish Fillets' },
        { value: 'crabs-lobsters-bugs', label: 'Crabs & Lobsters' },
        { value: 'shellfish', label: 'Shellfish' },
        { value: 'sushi-sashimi', label: 'Sushi / Sashimi' },
        { value: 'squid-octopus', label: 'Squid & Octopus' },
    ],
};

// ─────────────────────────────────────────────
// 4. COMPLETE PRODUCT DEFINITIONS (12)
// ─────────────────────────────────────────────

export interface ProductDefinition {
    // Identity
    slug: string;
    name: string;
    shortName: string;
    category: string;
    categorySlug: string;

    // Specs
    weight: string;
    serves: string;
    preparation: string;
    shelfLife: string;
    storageInstructions: string;

    // Pricing
    price: number;
    originalPrice?: number;
    unit: 'KG' | 'PIECE' | 'DOZEN' | 'BOX' | 'PACK';
    discountPercent?: number;

    // Delivery
    deliveryEstimate?: string;
    freeDeliveryEligible?: boolean;
    cutoffTime?: string;

    // Badges & flags
    badges: string[];
    isFeatured: boolean;
    isTodaysSpecial: boolean;

    // Images
    images: string[];
    thumbnailUrl: string;

    // Filters
    sourcing: string;
    dietary: string[];
    tags: string[];

    // Description
    description: string;
    shortDescription: string;

    // Nutritional Info (per 100g)
    nutrition: {
        calories: number;
        protein: string;
        fat: string;
        saturatedFat: string;
        carbs: string;
        sodium: string;
        omega3: string;
    };

    // Sourcing Story
    sourcingStory: {
        region: string;
        method: string;
        narrative: string;
    };

    // What You Get
    whatYouGet: string[];

    // Related product slugs
    frequentlyOrderedWith: string[];
    youMayAlsoLike: string[];
}

export const products: ProductDefinition[] = [
    // ── 1. Tiger Prawns 1kg ──
    {
        slug: 'tiger-prawns-1kg',
        name: 'Tiger Prawns 1kg Pack',
        shortName: 'Tiger Prawns',
        category: 'Prawns',
        categorySlug: 'prawns',
        weight: '1kg',
        serves: '3–4 people',
        preparation: 'Raw, head on, shell on',
        shelfLife: '2 days refrigerated',
        storageInstructions: 'Keep refrigerated at 0–4°C. Consume within 48 hours of delivery. Can be frozen for up to 3 months.',
        price: 34.90,
        unit: 'KG',
        badges: ['Best Buy', 'Popular'],
        isFeatured: true,
        isTodaysSpecial: false,
        images: ['/assets/products/prawns.png'],
        thumbnailUrl: '/assets/products/prawns.png',
        sourcing: 'Wild Caught',
        dietary: ['Gluten Free', 'High Protein', 'Keto Friendly', 'Omega-3 Rich'],
        tags: ['best-buy', 'popular', 'wild-caught'],
        description:
            'Premium wild-caught tiger prawns sourced from the pristine waters off the Queensland coast. These beauties are caught daily by our partner trawlers and delivered straight to our store. Perfect for BBQ, garlic butter prawns, or a classic prawn cocktail. Plump, sweet, and ocean-fresh — you\'ll taste the difference.',
        shortDescription: 'Wild-caught QLD tiger prawns, perfect for BBQ or garlic butter',
        nutrition: {
            calories: 85,
            protein: '18g',
            fat: '1.2g',
            saturatedFat: '0.3g',
            carbs: '0g',
            sodium: '190mg',
            omega3: '0.3g',
        },
        sourcingStory: {
            region: 'Moreton Bay & Gold Coast Waters, QLD',
            method: 'Wild trawl caught, overnight trips',
            narrative:
                'Our tiger prawns come from licensed trawlers working the warm currents off South East Queensland. Each catch is iced immediately on the boat and offloaded at first light. From dock to our store in under 6 hours.',
        },
        whatYouGet: [
            '1kg raw tiger prawns, head on, shell on',
            'Approximate count: 20–30 prawns per kg',
            'Ice-packed in insulated box',
            'Cooking tips card included',
        ],
        frequentlyOrderedWith: ['cooked-prawns-1kg', 'fresh-scallops-500g'],
        youMayAlsoLike: ['barramundi-fillets-1kg', 'salmon-fillet-fresh-1kg', 'octopus-whole-1kg'],
    },

    // ── 2. Barramundi Fillets 1kg ──
    {
        slug: 'barramundi-fillets-1kg',
        name: 'Barramundi Fillets Fresh 1kg Pack',
        shortName: 'Barramundi Fillets',
        category: 'Fish Fillet',
        categorySlug: 'fish-fillet',
        weight: '1kg',
        serves: '3–4 people',
        preparation: 'Skin-on, boneless fillets',
        shelfLife: '2 days refrigerated',
        storageInstructions: 'Keep refrigerated at 0–4°C. Freeze on day of purchase for up to 3 months.',
        price: 46.90,
        unit: 'PACK',
        badges: ['Best Buy'],
        isFeatured: true,
        isTodaysSpecial: false,
        images: ['/assets/products/fillets.png'],
        thumbnailUrl: '/assets/products/fillets.png',
        sourcing: 'Sustainably Farmed',
        dietary: ['Gluten Free', 'High Protein', 'Low Fat', 'Omega-3 Rich'],
        tags: ['best-buy', 'australian', 'sustainably-farmed'],
        description:
            'Australian barramundi — the king of freshwater fish. Our fillets are hand-cut from sustainably farmed barramundi raised in the clean waters of North Queensland. The firm, flaky flesh has a mild, buttery flavour that works beautifully pan-fried, grilled, or baked. Each pack contains 3–4 generous fillets.',
        shortDescription: 'Sustainably farmed Australian barramundi, hand-cut fillets',
        nutrition: {
            calories: 110,
            protein: '22g',
            fat: '2.5g',
            saturatedFat: '0.7g',
            carbs: '0g',
            sodium: '65mg',
            omega3: '0.8g',
        },
        sourcingStory: {
            region: 'North Queensland, Australia',
            method: 'Sustainably farmed in freshwater ponds',
            narrative:
                'Raised in crystal-clear freshwater ponds in tropical North Queensland, our barramundi are fed a natural diet and harvested at peak maturity. The fish are processed within hours of harvest, ensuring exceptional freshness.',
        },
        whatYouGet: [
            '1kg pack of fresh barramundi fillets (3–4 fillets)',
            'Skin-on, pin-boned',
            'Vacuum sealed for freshness',
            'Recipe card included',
        ],
        frequentlyOrderedWith: ['salmon-fillet-fresh-1kg', 'snapper-fillets-500g', 'blue-eye-cod-fillets-1kg'],
        youMayAlsoLike: ['tiger-prawns-1kg', 'fresh-scallops-500g', 'oysters-mornay-each'],
    },

    // ── 3. Blue Eye Cod Fillets 1kg ──
    {
        slug: 'blue-eye-cod-fillets-1kg',
        name: 'Blue Eye Cod Fillets Fresh 1kg Pack',
        shortName: 'Blue Eye Cod',
        category: 'Fish Fillet',
        categorySlug: 'fish-fillet',
        weight: '1kg',
        serves: '3–4 people',
        preparation: 'Skinless, boneless portions',
        shelfLife: '2 days refrigerated',
        storageInstructions: 'Keep refrigerated at 0–4°C. Can be frozen for up to 3 months.',
        price: 79.90,
        unit: 'PACK',
        badges: ['Best Buy', 'Premium'],
        isFeatured: true,
        isTodaysSpecial: false,
        images: ['/assets/products/fillets.png'],
        thumbnailUrl: '/assets/products/fillets.png',
        sourcing: 'Wild Caught',
        dietary: ['Gluten Free', 'High Protein', 'Low Fat'],
        tags: ['best-buy', 'premium', 'wild-caught'],
        description:
            'Blue eye cod is one of Australia\'s most prized deep-water species. Caught in the cold, deep waters of the continental shelf, this fish has a rich, buttery flavour with large, moist flakes. The thick, meaty fillets hold up beautifully to any cooking method — perfect for pan-searing, baking, or a classic fish and chips.',
        shortDescription: 'Premium wild-caught blue eye cod, thick meaty fillets',
        nutrition: {
            calories: 95,
            protein: '20g',
            fat: '1.5g',
            saturatedFat: '0.4g',
            carbs: '0g',
            sodium: '55mg',
            omega3: '0.5g',
        },
        sourcingStory: {
            region: 'Continental Shelf, Southern NSW / Tasman Sea',
            method: 'Deep-water line caught, 200–500m depth',
            narrative:
                'Our blue eye cod is line-caught by specialist deep-water fishermen working the continental shelf. Each fish is bled and iced immediately, preserving the pristine white flesh and sweet, clean flavour.',
        },
        whatYouGet: [
            '1kg pack of blue eye cod fillets (2–3 thick portions)',
            'Skinless, boneless, ready to cook',
            'Vacuum sealed',
            'Premium insulated packaging',
        ],
        frequentlyOrderedWith: ['barramundi-fillets-1kg', 'snapper-fillets-500g'],
        youMayAlsoLike: ['salmon-fillet-fresh-1kg', 'fresh-scallops-500g', 'tiger-prawns-1kg'],
    },

    // ── 4. Salmon Fillet Fresh 1kg ──
    {
        slug: 'salmon-fillet-fresh-1kg',
        name: 'Salmon Fillet Fresh 1kg',
        shortName: 'Atlantic Salmon',
        category: 'Fish Fillet',
        categorySlug: 'fish-fillet',
        weight: '1kg',
        serves: '3–4 people',
        preparation: 'Skin-on, boneless fillet',
        shelfLife: '3 days refrigerated',
        storageInstructions: 'Keep refrigerated at 0–4°C. Suitable for freezing up to 6 months.',
        price: 55.00,
        unit: 'KG',
        badges: ['Popular'],
        isFeatured: false,
        isTodaysSpecial: false,
        images: ['/assets/products/salmon.png'],
        thumbnailUrl: '/assets/products/salmon.png',
        sourcing: 'Sustainably Farmed',
        dietary: ['Gluten Free', 'High Protein', 'Omega-3 Rich', 'Keto Friendly'],
        tags: ['popular', 'sustainably-farmed', 'omega-3'],
        description:
            'Premium Tasmanian Atlantic salmon with vibrant orange flesh and rich, buttery flavour. Raised in the pristine cold waters of Macquarie Harbour, our salmon is sustainably farmed to the highest Australian standards. Perfect for sashimi, pan-frying, baking, or smoking at home.',
        shortDescription: 'Tasmanian Atlantic salmon, sustainably farmed, sashimi-grade',
        nutrition: {
            calories: 208,
            protein: '20g',
            fat: '13g',
            saturatedFat: '3g',
            carbs: '0g',
            sodium: '59mg',
            omega3: '2.2g',
        },
        sourcingStory: {
            region: 'Macquarie Harbour, Tasmania',
            method: 'Sustainably farmed in deep-water ocean pens',
            narrative:
                'Our Atlantic salmon is raised in the cold, oxygen-rich waters of Tasmania\'s west coast. Fed a natural marine diet, these fish develop the rich omega-3 content and vibrant colour that makes Tasmanian salmon world-famous.',
        },
        whatYouGet: [
            '1kg side of Atlantic salmon, skin-on',
            'Pin-boned, ready to portion',
            'Sashimi grade quality',
            'Vacuum sealed with ice pack',
        ],
        frequentlyOrderedWith: ['barramundi-fillets-1kg', 'fresh-sashimi-kingfish-300g'],
        youMayAlsoLike: ['blue-eye-cod-fillets-1kg', 'snapper-fillets-500g', 'tiger-prawns-1kg'],
    },

    // ── 5. Fresh Scallops 500g ──
    {
        slug: 'fresh-scallops-500g',
        name: 'Fresh Scallops 500g Pack',
        shortName: 'Fresh Scallops',
        category: 'Shellfish',
        categorySlug: 'shellfish',
        weight: '500g',
        serves: '2–3 people',
        preparation: 'Roe off, cleaned, ready to cook',
        shelfLife: '2 days refrigerated',
        storageInstructions: 'Keep refrigerated at 0–4°C. Pat dry before cooking. Freeze within 24 hours for up to 2 months.',
        price: 29.99,
        unit: 'PACK',
        badges: ['Best Buy'],
        isFeatured: true,
        isTodaysSpecial: false,
        images: ['/assets/products/scallops.png'],
        thumbnailUrl: '/assets/products/scallops.png',
        sourcing: 'Wild Caught',
        dietary: ['Gluten Free', 'High Protein', 'Low Fat'],
        tags: ['best-buy', 'wild-caught'],
        description:
            'Plump, sweet Australian scallops harvested from the clean waters of the Great Australian Bight. These beauties are shucked, cleaned, and packed within hours of harvest. Simply sear in a hot pan with butter for 90 seconds each side — pure ocean sweetness.',
        shortDescription: 'Wild-caught Australian scallops, roe off, ready to sear',
        nutrition: {
            calories: 69,
            protein: '14g',
            fat: '0.5g',
            saturatedFat: '0.1g',
            carbs: '2g',
            sodium: '161mg',
            omega3: '0.2g',
        },
        sourcingStory: {
            region: 'Great Australian Bight, SA',
            method: 'Wild dredge harvested, MSC certified fishery',
            narrative:
                'Our scallops come from one of Australia\'s best-managed shellfish fisheries. Each scallop is hand-shucked by experienced processors and graded for size and quality before packing.',
        },
        whatYouGet: [
            '500g pack of fresh scallops (approx. 15–20 pieces)',
            'Roe removed, cleaned',
            'Dry-packed (no added water)',
            'Best seared or grilled',
        ],
        frequentlyOrderedWith: ['clams-1kg', 'tiger-prawns-1kg'],
        youMayAlsoLike: ['oysters-mornay-each', 'barramundi-fillets-1kg', 'salmon-fillet-fresh-1kg'],
    },

    // ── 6. Cooked Spanner Crab Meat 500g ──
    {
        slug: 'cooked-spanner-crab-meat-500g',
        name: 'Cooked Spanner Crab Meat 500g',
        shortName: 'Spanner Crab Meat',
        category: 'Crabs, Lobsters, Bugs',
        categorySlug: 'crabs-lobsters-bugs',
        weight: '500g',
        serves: '2–3 people',
        preparation: 'Cooked, picked, ready to eat',
        shelfLife: '3 days refrigerated',
        storageInstructions: 'Keep refrigerated at 0–4°C. Do not refreeze once thawed.',
        price: 45.00,
        unit: 'PACK',
        badges: ['Fresh Pick'],
        isFeatured: false,
        isTodaysSpecial: true,
        images: ['/assets/products/crabs.png'],
        thumbnailUrl: '/assets/products/crabs.png',
        sourcing: 'Wild Caught',
        dietary: ['Gluten Free', 'High Protein', 'Low Fat'],
        tags: ['fresh', 'wild-caught', 'ready-to-eat'],
        description:
            'Sweet, delicate spanner crab meat — hand-picked from locally caught crabs. Our spanner crab is cooked within hours of landing and the meat is carefully extracted, giving you pure, sweet crab with zero shell. Perfect for crab salads, pasta, sushi rolls, or simply with lemon and mayo.',
        shortDescription: 'Hand-picked spanner crab meat, cooked and ready to eat',
        nutrition: {
            calories: 87,
            protein: '18g',
            fat: '1g',
            saturatedFat: '0.2g',
            carbs: '0g',
            sodium: '320mg',
            omega3: '0.4g',
        },
        sourcingStory: {
            region: 'Gold Coast & Moreton Bay, QLD',
            method: 'Wild pot caught, sustainable quota managed',
            narrative:
                'Our spanner crabs are caught in baited traps off the Gold Coast and Moreton Bay. Each crab is cooked in boiling seawater on the same day it\'s caught, then hand-picked by our experienced team.',
        },
        whatYouGet: [
            '500g tub of cooked spanner crab meat',
            'Hand-picked, shell-free',
            'Ready to eat — no cooking required',
            'Sealed container with ice pack',
        ],
        frequentlyOrderedWith: ['crab-soft-shell-1kg', 'crab-meat-pots-each', 'crab-meat-raw-500g'],
        youMayAlsoLike: ['tiger-prawns-1kg', 'fresh-scallops-500g', 'oysters-mornay-each'],
    },

    // ── 7. Fresh Sashimi Kingfish 300g ──
    {
        slug: 'fresh-sashimi-kingfish-300g',
        name: 'Fresh Sashimi Kingfish per 300gm Block',
        shortName: 'Sashimi Kingfish',
        category: 'Sushi/Sashimi',
        categorySlug: 'sushi-sashimi',
        weight: '300g',
        serves: '1–2 people',
        preparation: 'Sashimi grade, block cut',
        shelfLife: '2 days refrigerated',
        storageInstructions: 'Keep refrigerated at 0–2°C. Consume within 24 hours for best sashimi quality.',
        price: 40.00,
        unit: 'PIECE',
        badges: ['Fresh Pick', 'Sashimi Grade'],
        isFeatured: false,
        isTodaysSpecial: true,
        images: ['/assets/products/salmon.png'],
        thumbnailUrl: '/assets/products/salmon.png',
        sourcing: 'Wild Caught',
        dietary: ['Gluten Free', 'High Protein', 'Low Fat', 'Omega-3 Rich', 'Keto Friendly'],
        tags: ['sashimi', 'premium', 'wild-caught'],
        description:
            'Sashimi-grade yellowtail kingfish, one of Australia\'s most prized eating fish. This 300g block is cut from the loin — the premium centre-cut — and is perfect for slicing into sashimi or sushi. The flesh is creamy, rich, and melts on the tongue. Caught locally off the NSW/QLD coast.',
        shortDescription: 'Sashimi-grade kingfish loin block, melt-in-your-mouth quality',
        nutrition: {
            calories: 146,
            protein: '23g',
            fat: '5.6g',
            saturatedFat: '1.4g',
            carbs: '0g',
            sodium: '39mg',
            omega3: '1.4g',
        },
        sourcingStory: {
            region: 'NSW / QLD Coast',
            method: 'Wild line caught, day boat trips',
            narrative:
                'Our kingfish is caught by day-boat fishermen using hook and line off the east coast. The fish is ike jime dispatched (Japanese brain-spike method) for maximum freshness, then chilled and delivered to our store within 12 hours.',
        },
        whatYouGet: [
            '300g block of sashimi-grade kingfish',
            'Centre loin cut, skin removed',
            'Individually vacuum sealed',
            'Sashimi slicing guide included',
        ],
        frequentlyOrderedWith: ['fresh-sashimi-kingfish-500g-sliced', 'salmon-fillet-fresh-1kg'],
        youMayAlsoLike: ['fresh-scallops-500g', 'tiger-prawns-1kg', 'oysters-mornay-each'],
    },

    // ── 8. Oysters Mornay ──
    {
        slug: 'oysters-mornay-each',
        name: 'Oysters Mornay each',
        shortName: 'Oysters Mornay',
        category: 'Oyster',
        categorySlug: 'oyster',
        weight: '1 piece (~60g)',
        serves: '1 piece (appetiser)',
        preparation: 'Ready to bake, pre-topped with mornay sauce',
        shelfLife: '3 days refrigerated',
        storageInstructions: 'Keep refrigerated. Bake from chilled at 200°C for 8–10 minutes until golden.',
        price: 9.90,
        unit: 'PIECE',
        badges: ['Best Buy'],
        isFeatured: true,
        isTodaysSpecial: false,
        images: ['/assets/products/oysters-mornay.png'],
        thumbnailUrl: '/assets/products/oysters-mornay.png',
        sourcing: 'Australian',
        dietary: ['High Protein'],
        tags: ['best-buy', 'ready-to-cook', 'appetiser'],
        description:
            'Plump Pacific oysters topped with our house-made creamy mornay sauce and a sprinkle of parmesan. Simply bake in the oven for 8–10 minutes for a golden, bubbling appetiser that rivals any restaurant. Sold individually so you can order exactly how many you need.',
        shortDescription: 'House-made oysters mornay, ready to bake, sold individually',
        nutrition: {
            calories: 95,
            protein: '6g',
            fat: '5g',
            saturatedFat: '2.5g',
            carbs: '4g',
            sodium: '280mg',
            omega3: '0.3g',
        },
        sourcingStory: {
            region: 'Coffin Bay, South Australia',
            method: 'Farmed in pristine tidal flats',
            narrative:
                'Our Pacific oysters are grown in the clean, cold waters of Coffin Bay, SA — one of the world\'s premier oyster growing regions. We top each oyster in-house with our chef\'s signature mornay sauce.',
        },
        whatYouGet: [
            '1 × Oyster Mornay on the half shell',
            'Pre-topped with house-made mornay and parmesan',
            'Oven-ready — just bake and serve',
            'Order as many as you need',
        ],
        frequentlyOrderedWith: ['tiger-prawns-1kg', 'fresh-scallops-500g'],
        youMayAlsoLike: ['cooked-spanner-crab-meat-500g', 'barramundi-fillets-1kg', 'salmon-fillet-fresh-1kg'],
    },

    // ── 9. Octopus Whole 1kg ──
    {
        slug: 'octopus-whole-1kg',
        name: 'Octopus Whole 1kg',
        shortName: 'Whole Octopus',
        category: 'Squid & Octopus',
        categorySlug: 'squid-octopus',
        weight: '1kg',
        serves: '3–4 people',
        preparation: 'Whole, cleaned, ready to cook',
        shelfLife: '2 days refrigerated',
        storageInstructions: 'Keep refrigerated at 0–4°C. Can be frozen for up to 3 months.',
        price: 25.00,
        unit: 'KG',
        badges: ['Best Buy'],
        isFeatured: true,
        isTodaysSpecial: false,
        images: ['/assets/products/octopus.png'],
        thumbnailUrl: '/assets/products/octopus.png',
        sourcing: 'Wild Caught',
        dietary: ['Gluten Free', 'High Protein', 'Low Fat'],
        tags: ['best-buy', 'wild-caught'],
        description:
            'Whole cleaned octopus perfect for slow-braising, grilling, or adding to a Mediterranean-style seafood salad. Our octopus is caught in the waters off Western Australia and cleaned, ready to cook. Slow cook for 45–60 minutes until tender, then char on a hot grill for the perfect smoky finish.',
        shortDescription: 'Whole cleaned octopus, ideal for braising or chargrilling',
        nutrition: {
            calories: 82,
            protein: '15g',
            fat: '1g',
            saturatedFat: '0.2g',
            carbs: '2.2g',
            sodium: '230mg',
            omega3: '0.2g',
        },
        sourcingStory: {
            region: 'Fremantle, Western Australia',
            method: 'Wild pot caught',
            narrative:
                'Our octopus is caught in baited pots off the Western Australian coast, a method that has minimal environmental impact. Each octopus is cleaned and blast-frozen on the day of catch to lock in freshness.',
        },
        whatYouGet: [
            '1kg whole octopus, cleaned',
            'Head and tentacles intact',
            'Ready to slow-cook or braise',
            'Cooking guide with recipes',
        ],
        frequentlyOrderedWith: ['clams-1kg', 'fresh-scallops-500g'],
        youMayAlsoLike: ['tiger-prawns-1kg', 'barramundi-fillets-1kg', 'cooked-spanner-crab-meat-500g'],
    },

    // ── 10. Cooked Prawns 1kg ──
    {
        slug: 'cooked-prawns-1kg',
        name: 'Cooked Prawns 1kg',
        shortName: 'Cooked Prawns',
        category: 'Prawns',
        categorySlug: 'prawns',
        weight: '1kg',
        serves: '3–4 people',
        preparation: 'Cooked, shell on, ready to eat',
        shelfLife: '3 days refrigerated',
        storageInstructions: 'Keep refrigerated at 0–4°C. Consume within 3 days.',
        price: 42.00,
        unit: 'KG',
        badges: ['Popular'],
        isFeatured: false,
        isTodaysSpecial: false,
        images: ['/assets/products/prawns.png'],
        thumbnailUrl: '/assets/products/prawns.png',
        sourcing: 'Wild Caught',
        dietary: ['Gluten Free', 'High Protein', 'Low Fat', 'Keto Friendly'],
        tags: ['popular', 'wild-caught', 'ready-to-eat'],
        description:
            'Ready-to-eat cooked prawns — perfect for prawn cocktails, salads, sandwiches, or just peeling and eating with a squeeze of lemon. These are cooked in seawater on the boat for maximum flavour and then chilled immediately. Plump, sweet, and the ultimate convenience seafood.',
        shortDescription: 'Ocean-cooked prawns, shell on, ready to peel and eat',
        nutrition: {
            calories: 99,
            protein: '21g',
            fat: '1.3g',
            saturatedFat: '0.3g',
            carbs: '0g',
            sodium: '210mg',
            omega3: '0.3g',
        },
        sourcingStory: {
            region: 'Clarence River & Gold Coast, QLD',
            method: 'Wild trawl caught, cooked on board',
            narrative:
                'These prawns are cooked in boiling seawater on the trawler minutes after being caught — the traditional method that gives the sweetest, freshest flavour. They\'re then rapidly chilled and delivered to our stores.',
        },
        whatYouGet: [
            '1kg cooked prawns, shell on',
            'Approx 25–35 prawns per kg',
            'Ready to eat — just peel and enjoy',
            'Great for prawn cocktails and platters',
        ],
        frequentlyOrderedWith: ['tiger-prawns-1kg', 'oysters-mornay-each'],
        youMayAlsoLike: ['fresh-scallops-500g', 'cooked-spanner-crab-meat-500g', 'salmon-fillet-fresh-1kg'],
    },

    // ── 11. Snapper Fillets 500g ──
    {
        slug: 'snapper-fillets-500g',
        name: 'Snapper Fillets 500g',
        shortName: 'Snapper Fillets',
        category: 'Fish Fillet',
        categorySlug: 'fish-fillet',
        weight: '500g',
        serves: '2 people',
        preparation: 'Skin-on, boneless fillets',
        shelfLife: '2 days refrigerated',
        storageInstructions: 'Keep refrigerated at 0–4°C. Freeze on day of purchase if not using within 2 days.',
        price: 38.00,
        unit: 'PACK',
        badges: [],
        isFeatured: false,
        isTodaysSpecial: false,
        images: ['/assets/products/fillets.png'],
        thumbnailUrl: '/assets/products/fillets.png',
        sourcing: 'Wild Caught',
        dietary: ['Gluten Free', 'High Protein', 'Low Fat'],
        tags: ['wild-caught', 'local'],
        description:
            'Beautiful pink snapper fillets caught in the reefs off South East Queensland. Snapper has a sweet, mild flavour with firm, flaky flesh that\'s incredibly versatile. Pan-fry skin-side down for a crispy skin finish, bake with herbs and lemon, or use in a Thai-style fish curry.',
        shortDescription: 'Wild-caught reef snapper, firm and sweet, skin-on fillets',
        nutrition: {
            calories: 100,
            protein: '21g',
            fat: '1.5g',
            saturatedFat: '0.4g',
            carbs: '0g',
            sodium: '65mg',
            omega3: '0.4g',
        },
        sourcingStory: {
            region: 'Gold Coast Reefs, QLD',
            method: 'Wild line caught, reef fishing',
            narrative:
                'Our snapper is caught by experienced line fishermen working the reef systems off the Gold Coast. Each fish is handled with care, iced immediately, and filleted at our facility.',
        },
        whatYouGet: [
            '500g pack of snapper fillets (2–3 fillets)',
            'Skin-on, pin-boned',
            'Vacuum sealed',
            'Perfect for pan-frying or baking',
        ],
        frequentlyOrderedWith: ['barramundi-fillets-1kg', 'blue-eye-cod-fillets-1kg'],
        youMayAlsoLike: ['salmon-fillet-fresh-1kg', 'tiger-prawns-1kg', 'fresh-scallops-500g'],
    },

    // ── 12. Clams 1kg ──
    {
        slug: 'clams-1kg',
        name: 'Clams 1kg Pack',
        shortName: 'Fresh Clams',
        category: 'Shellfish',
        categorySlug: 'shellfish',
        weight: '1kg',
        serves: '2–3 people',
        preparation: 'Live, in shell, requires cooking',
        shelfLife: '2 days refrigerated',
        storageInstructions: 'Keep refrigerated in a damp cloth. Do not store in water or sealed plastic bags. Cook within 2 days.',
        price: 29.99,
        unit: 'KG',
        badges: ['Best Buy'],
        isFeatured: false,
        isTodaysSpecial: false,
        images: ['/assets/products/scallops.png'],
        thumbnailUrl: '/assets/products/scallops.png',
        sourcing: 'Wild Caught',
        dietary: ['Gluten Free', 'High Protein', 'Low Fat'],
        tags: ['best-buy', 'wild-caught'],
        description:
            'Fresh live clams — the star of any pasta vongole. Our clams are harvested from the sandy beds of South Australia and delivered live to ensure maximum freshness. Steam with garlic, white wine, and parsley for a classic Italian dish, or add to a chowder for rich, briny flavour.',
        shortDescription: 'Live Australian clams, perfect for vongole and chowder',
        nutrition: {
            calories: 74,
            protein: '13g',
            fat: '1g',
            saturatedFat: '0.2g',
            carbs: '2.6g',
            sodium: '56mg',
            omega3: '0.3g',
        },
        sourcingStory: {
            region: 'South Australia',
            method: 'Wild harvested from sandy estuarine beds',
            narrative:
                'Our clams are hand-harvested from the clean sandy beds of South Australian estuaries. They\'re purged in saltwater to remove any sand, then packed live for delivery.',
        },
        whatYouGet: [
            '1kg live clams in mesh bag',
            'Pre-purged (sand removed)',
            'Approx 40–60 clams per kg',
            'Cooking guide with vongole recipe',
        ],
        frequentlyOrderedWith: ['fresh-scallops-500g', 'octopus-whole-1kg'],
        youMayAlsoLike: ['tiger-prawns-1kg', 'barramundi-fillets-1kg', 'cooked-spanner-crab-meat-500g'],
    },
];

// ─────────────────────────────────────────────
// 5. FLAGSHIP PDP LAYOUT — Atlantic Salmon Fillet
// ─────────────────────────────────────────────

export const flagshipPDP = {
    slug: 'salmon-fillet-fresh-1kg',
    layout: {
        // Top section: 2-col (images | details)
        hero: {
            images: {
                gallery: ['/assets/products/salmon.png'],
                zoomEnabled: true,
            },
            details: {
                breadcrumb: ['Shop', 'Fish Fillets', 'Atlantic Salmon Fillet'],
                categoryLink: { label: 'Fish Fillet', href: '/our-products?category=fish-fillet' },
                title: 'Salmon Fillet Fresh 1kg',
                rating: { score: 4.8, reviewCount: 124 },
                description:
                    'Premium Tasmanian Atlantic salmon with vibrant orange flesh and rich, buttery flavour. Raised in the pristine cold waters of Macquarie Harbour, our salmon is sustainably farmed to the highest Australian standards.',
                price: { current: 55.00, unit: 'per kg' },
                badges: ['Sashimi Grade', 'Sustainably Farmed'],
                origin: 'Macquarie Harbour, Tasmania',
                quantitySelector: { min: 1, max: 20, default: 1 },
                addToCartCTA: 'Add to Cart',
            },
        },

        // Info tabs
        tabs: [
            {
                id: 'about',
                label: 'About',
                content: {
                    whatYouGet: [
                        '1kg side of Atlantic salmon, skin-on',
                        'Pin-boned, ready to portion',
                        'Sashimi grade quality',
                        'Vacuum sealed with ice pack',
                    ],
                    preparation: 'Skin-on, boneless fillet',
                    shelfLife: '3 days refrigerated',
                    storage: 'Keep refrigerated at 0–4°C. Suitable for freezing up to 6 months.',
                    cookingTip:
                        'For crispy skin, pat dry and score the skin. Pan-fry skin-side down on medium-high heat for 4 minutes, then flip and cook for 2 minutes. Rest for 1 minute before serving.',
                },
            },
            {
                id: 'nutrition',
                label: 'Nutrition',
                content: {
                    servingSize: '100g',
                    calories: 208,
                    protein: '20g',
                    totalFat: '13g',
                    saturatedFat: '3g',
                    carbohydrates: '0g',
                    sodium: '59mg',
                    omega3: '2.2g',
                    vitamins: ['Vitamin D', 'Vitamin B12', 'Selenium'],
                },
            },
            {
                id: 'sourcing',
                label: 'Our Source',
                content: {
                    region: 'Macquarie Harbour, Tasmania',
                    method: 'Sustainably farmed in deep-water ocean pens',
                    certifications: ['ASC Certified', 'RSPCA Approved'],
                    narrative:
                        'Our Atlantic salmon is raised in the cold, oxygen-rich waters of Tasmania\'s west coast. Fed a natural marine diet, these fish develop the rich omega-3 content and vibrant colour that makes Tasmanian salmon world-famous.',
                    mapCoordinates: { lat: -42.2, lng: 145.3 },
                },
            },
        ],

        // Trust bar
        trustBar: [
            { icon: 'Thermometer', label: 'Cold Chain Guaranteed' },
            { icon: 'Clock', label: 'Same Day Delivery' },
            { icon: 'Shield', label: 'Freshness Promise' },
            { icon: 'Leaf', label: 'Sustainably Sourced' },
        ],

        // Related sections
        frequentlyOrderedTogether: {
            title: 'Frequently Ordered Together',
            subtitle: 'More from Fish Fillets',
            productSlugs: ['barramundi-fillets-1kg', 'snapper-fillets-500g', 'blue-eye-cod-fillets-1kg'],
        },
        youMayAlsoLike: {
            title: 'You May Also Like',
            subtitle: 'Explore other popular picks',
            productSlugs: ['tiger-prawns-1kg', 'fresh-scallops-500g', 'oysters-mornay-each', 'cooked-spanner-crab-meat-500g', 'octopus-whole-1kg', 'cooked-prawns-1kg'],
        },
    },
};

// ─────────────────────────────────────────────
// 6. DELIVERY & POLICY CONTENT
// ─────────────────────────────────────────────

export const delivery = {
    freeDeliveryThreshold: 150,
    deliveryFee: 12.50,
    sameDayCutoff: '10:00 AM',
    deliveryAreas: [
        'Gold Coast',
        'Tweed Heads',
        'Northern Rivers',
        'Logan',
        'Brisbane South',
    ],
    deliveryPromise:
        'All orders are packed in insulated boxes with ice packs to maintain cold chain integrity. Your seafood arrives at the same temperature as it left our store.',
    pickupLocations: [
        { store: 'Labrador', address: '213 Brisbane Rd, Labrador QLD 4215' },
        { store: 'Varsity Lakes', address: '201 Varsity Parade, Varsity Lakes QLD 4227' },
    ],
};

// ─────────────────────────────────────────────
// 7. SEO & METADATA
// ─────────────────────────────────────────────

export const seo = {
    siteName: 'Tasman Star Seafoods',
    defaultTitle: 'Tasman Star Seafoods | Fresh Seafood Gold Coast',
    defaultDescription:
        'Premium Australian seafood delivered fresh to your door on the Gold Coast. Shop prawns, fish fillets, oysters, crab, and more. Free delivery on orders over $150.',
    keywords: [
        'fresh seafood gold coast',
        'buy prawns online',
        'fish delivery gold coast',
        'australian seafood online',
        'sashimi grade fish',
        'seafood platter gold coast',
        'wholesale seafood brisbane',
        'tasman star seafoods',
    ],
    ogImage: '/assets/og-image.jpg',
    twitterHandle: '@tasmanstarseafood',
};
