/**
 * Bulk update product descriptions and countryOfOrigin in the database.
 * Safe for production — only updates description and countryOfOrigin fields.
 *
 * Usage: npx tsx scripts/update-descriptions.ts
 */
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const updates: Record<string, { description: string; countryOfOrigin?: string }> = {
  // ── COOKED PRAWNS ──
  'large-cooked-king-prawns': {
    description: 'Large cooked king prawns from Tasman Star Seafoods — sweet, firm and ready to serve straight from the box. Sourced from Australian waters and cooked to perfection, these premium king prawns are the centrepiece of any seafood platter, prawn cocktail or summer salad. Each prawn is generously sized with a satisfying snap and clean ocean flavour. Sold per kg. Keep refrigerated and consume within 2–3 days of purchase. Order online by 4pm Tuesday or Thursday for Wednesday or Friday delivery across the Gold Coast, from Palm Beach to Upper Coomera.',
  },
  'medium-cooked-king-prawns': {
    description: 'Medium cooked king prawns offering great value without compromising on taste. These Australian prawns are cooked fresh and ready to peel and eat — ideal for sandwiches, pasta dishes or a casual family seafood night. Sold per kg by Tasman Star Seafoods with Gold Coast delivery available.',
  },
  'large-cooked-tiger-prawns': {
    description: 'Large cooked tiger prawns from North Queensland — bold, distinctive stripes and a rich, sweet flavour that sets them apart. These premium Australian tiger prawns are cooked and ready to enjoy on platters, in salads or simply with a squeeze of lemon and cocktail sauce. Their firm, meaty texture makes them a favourite for entertaining. Sold per kg from Tasman Star Seafoods. Keep refrigerated and use within 2–3 days. Order by 4pm Tue/Thu for next-day Gold Coast delivery.',
  },
  'medium-cooked-tiger-prawns': {
    description: 'Medium cooked tiger prawns with the same bold flavour and firm bite as their larger counterparts, at a friendlier price point. Sourced from North Queensland and cooked fresh, they work beautifully in stir-fries, rice paper rolls or served chilled on a platter. Sold per kg from Tasman Star Seafoods.',
  },
  'medium-cooked-endeavour-prawns': {
    description: 'Medium cooked endeavour prawns — a terrific value option with delicate sweetness and tender flesh. These smaller Australian prawns are perfect for pasta sauces, fried rice, or piling onto crusty bread with aioli. Cooked and ready to eat, sold per kg from Tasman Star Seafoods with Gold Coast delivery.',
  },
  'cooked-school-prawns': {
    description: 'Cooked school prawns — bite-sized and bursting with sweet, briny flavour. A classic Australian favourite, these little prawns are best enjoyed peeled at the table with a cold drink and good company. Ideal for casual gatherings or tossed through a warm salad. Sold per kg from Tasman Star Seafoods.',
  },

  // ── RAW PRAWNS ──
  'jumbo-green-king-prawns': {
    description: 'Jumbo green king prawns — the ultimate raw prawn for home cooks and BBQ enthusiasts. These wild-caught Australian king prawns are impressively sized with firm, translucent flesh that turns beautifully pink when cooked. Perfect for grilling whole on the barbecue, butterflying for garlic prawns, or tossing into a laksa or curry. Their natural sweetness intensifies with heat. Sold per kg from Tasman Star Seafoods. Keep refrigerated or frozen until ready to cook. Order by 4pm Tue/Thu for Wed/Fri Gold Coast delivery.',
  },
  'large-green-king-prawns': {
    description: 'Large green king prawns — versatile raw prawns ideal for pan-frying, grilling or adding to stir-fries. Wild caught from Australian waters, these headless prawns offer meaty flesh and clean flavour. A popular choice for weeknight cooking. Sold per kg from Tasman Star Seafoods.',
  },
  'medium-green-king-prawns': {
    description: 'Medium green king prawns at a great value price — perfect for curries, pasta sauces, fried rice and chowders where you want generous prawn pieces throughout. Raw and ready to cook, these Australian prawns deliver reliable flavour. Sold per kg from Tasman Star Seafoods.',
  },
  'green-king-prawn-cutlets': {
    description: 'Green king prawn cutlets — peeled, deveined and butterflied with the tail left on for easy cooking and elegant presentation. These prep-ready raw prawn cutlets are ideal for tempura, crumbing, or quick pan-frying with garlic butter. Sold per kg from Tasman Star Seafoods with Gold Coast delivery.',
  },
  'medium-green-tiger-prawns': {
    description: 'Medium green tiger prawns from North Queensland — raw and ready to cook with their signature striped shell and robust, sweet flesh. These wild-caught tiger prawns hold up well on the barbecue or in a hot wok. Sold per kg from Tasman Star Seafoods.',
  },
  'red-spot-king-prawns-raw': {
    description: 'Red spot king prawns — a prized Australian species with distinctive red markings and exceptionally sweet, tender meat. These raw prawns are a favourite among chefs for their delicate flavour that shines in simple preparations like garlic prawns or grilled with herbs. Sold per kg from Tasman Star Seafoods.',
  },

  // ── COOKED CRABS ──
  'cooked-mud-crabs': {
    description: "Cooked mud crabs from Queensland — rich, sweet crab meat packed into impressively large claws and a meaty body. These premium Australian mud crabs are cooked fresh and ready to crack and enjoy. Perfect as a showpiece for special occasions or a luxurious weekend seafood feast. Mud crab meat is prized for its buttery sweetness and firm, flaky texture. Sold per kg from Tasman Star Seafoods. Keep refrigerated and consume within 2 days. Order by 4pm Tue/Thu for Wed/Fri delivery across the Gold Coast.",
  },
  'cooked-sand-crabs': {
    description: 'Cooked sand crabs — a Gold Coast favourite with sweet, delicate white meat and a clean, briny flavour. Cooked fresh and ready to pick, they are wonderful in salads, sandwiches or simply with a squeeze of lemon. An affordable way to enjoy quality Queensland crab. Sold per kg from Tasman Star Seafoods.',
  },
  'cooked-spanner-crabs': {
    description: 'Cooked local spanner crabs — sustainably caught off the Gold Coast and Southern Queensland coast. Spanner crabs offer a unique, sweet flavour with delicate white flesh that breaks apart easily. Served cold with lemon and seafood sauce, they make an elegant addition to any platter. Sold per kg from Tasman Star Seafoods.',
  },
  'cooked-king-crab-legs': {
    description: 'Cooked king crab legs — impressively large, snow-white meat with a rich, buttery sweetness. These premium crab legs are pre-cooked and ready to serve cold or gently warmed with drawn butter. A true luxury seafood experience. Sold per kg from Tasman Star Seafoods.',
  },

  // ── RAW CRABS ──
  'green-sand-crabs': {
    description: 'Green sand crabs — raw and ready to cook at home for the freshest possible crab experience. Steam or boil these Queensland sand crabs and enjoy their sweet, delicate meat with a simple dipping sauce. An excellent value option for crab lovers. Sold per kg from Tasman Star Seafoods.',
  },

  // ── COOKED BUGS ──
  'cooked-moreton-bay-bugs': {
    description: "Cooked Moreton Bay bugs — a quintessential Queensland delicacy with sweet, lobster-like tail meat that rivals any crustacean in the sea. Wild caught from the waters off South East Queensland, these iconic bugs are cooked and ready to split, then served chilled with lemon and aioli or warmed with garlic butter. Their firm, white flesh is incredibly versatile — perfect on platters, in pasta, or grilled on the barbecue. Sold per kg from Tasman Star Seafoods. Keep refrigerated and consume within 2 days. Order by 4pm Tue/Thu for Wed/Fri delivery across the Gold Coast.",
  },
  'cooked-balmain-bugs': {
    description: 'Cooked Balmain bugs — a wider, flatter species than Moreton Bay bugs with equally sweet and succulent tail meat. Caught off the NSW coast and cooked fresh, they are wonderful served cold on a seafood platter or halved and grilled with herb butter. Sold per kg from Tasman Star Seafoods.',
  },
  'cooked-honey-bugs': {
    description: 'Cooked honey bugs — named for their golden-brown shell and exceptionally sweet, delicate meat. These premium bugs are a rare treat, cooked and ready to enjoy. Their tender tail flesh pairs beautifully with citrus dressings or a light mango salsa. Sold per kg from Tasman Star Seafoods.',
  },

  // ── RAW BUGS ──
  'green-moreton-bay-bugs': {
    description: 'Green Moreton Bay bugs — raw and wild caught, ready for you to cook at home for maximum freshness. Split the tails and grill, barbecue or poach these Queensland bugs for a restaurant-quality meal. Their sweet, firm flesh is best kept simple with butter, garlic and lemon. Sold per kg from Tasman Star Seafoods.',
  },

  // ── CRAYFISH & LOBSTERS ──
  'cooked-western-crayfish': {
    description: "Cooked Western Australian crayfish — one of Australia's finest crustaceans with succulent, sweet tail meat and a vibrant red shell. These premium WA rock lobsters are cooked and ready to serve as the star of any celebration. Split and serve chilled with lemon mayonnaise, or gently warm the tail meat in garlic butter for an unforgettable dish. Their firm, clean-flavoured flesh is unmatched. Sold per kg from Tasman Star Seafoods. Keep refrigerated and consume within 2 days. Order by 4pm Tue/Thu for Gold Coast delivery.",
  },
  'cooked-local-rock-lobster': {
    description: 'Cooked local rock lobster — sourced from Queensland waters and cooked to perfection. This premium Australian lobster delivers rich, sweet meat with a firm, satisfying texture. Serve cold on a platter with fresh lemon and herb aioli, or use in a decadent lobster thermidor. Sold per kg from Tasman Star Seafoods.',
  },
  'cooked-southern-rock-lobster': {
    description: 'Cooked southern rock lobster — prized for its clean, sweet flavour and dense, white tail meat. Sourced from the cold southern waters of Australia, these lobsters have a distinctive richness. Ready to serve chilled or gently reheated with butter. Sold per kg from Tasman Star Seafoods.',
  },
  'green-local-rock-lobster': {
    description: 'Green local rock lobster — raw and fresh for you to cook at home. Split and grill on the barbecue, poach gently in a court bouillon, or roast in the oven with garlic and herbs. Queensland-sourced lobster at its freshest. Sold per kg from Tasman Star Seafoods.',
  },
  'green-southern-rock-lobster': {
    description: 'Green southern rock lobster — raw and ready for your kitchen. These cold-water Australian lobsters are ideal for boiling, steaming or grilling. The dense tail meat cooks beautifully and holds its shape. A premium choice for home chefs. Sold per kg from Tasman Star Seafoods.',
  },
  'green-lobster-tails': {
    description: 'Green lobster tails — raw, shell-on tails perfect for grilling, broiling or baking. Butterfly and grill with garlic butter for an impressive dinner centrepiece. These Australian lobster tails offer sweet, firm meat without the work of a whole lobster. Sold per kg from Tasman Star Seafoods.',
  },

  // ── LIVE SPECIES ──
  'live-mud-crabs': {
    description: "Live mud crabs — the freshest possible way to enjoy Queensland's most prized crab. These live Australian mud crabs arrive vigorous and ready to cook, ensuring maximum sweetness and flavour in every bite. Steam or boil at home for a truly special seafood experience. Live mud crabs are perfect for Asian-style chilli crab, black pepper crab, or simply steamed with ginger and shallots. Sold per kg from Tasman Star Seafoods. Collection recommended for live species — contact us for Gold Coast delivery availability.",
  },
  'live-spanner-crabs': {
    description: 'Live spanner crabs — locally caught off the Gold Coast and delivered alive for unbeatable freshness. Cook at home by steaming or boiling, then enjoy the sweet, flaky white meat. A local delicacy that tastes best the day it is cooked. Sold per kg from Tasman Star Seafoods.',
  },
  'live-local-rock-lobsters': {
    description: 'Live local rock lobsters — the ultimate in freshness for a truly memorable meal. These premium Australian lobsters are sold live, ready for you to cook by steaming, boiling or grilling. Nothing compares to the flavour of a lobster cooked moments after purchase. Sold per kg from Tasman Star Seafoods.',
  },
  'live-pipis': {
    description: 'Live pipis — small, sweet Australian clams perfect for pasta vongole, chowders or steaming open with white wine and garlic. These live shellfish are harvested fresh and deliver a wonderful briny, ocean flavour. Sold per kg from Tasman Star Seafoods.',
  },

  // ── OYSTERS ──
  'pacific-plate-oysters-1-dozen': {
    description: 'Pacific plate oysters — freshly shucked and presented on the half shell, ready to slurp. These plump, creamy Pacific oysters have a mild, clean brininess that makes them perfect for oyster newcomers and aficionados alike. Served by the dozen, they are ideal for sharing on a platter with lemon wedges and mignonette. Sourced from premium Australian oyster farms and delivered fresh to the Gold Coast by Tasman Star Seafoods. Keep chilled and consume on the day of purchase for the best experience. Order by 4pm Tue/Thu for Wed/Fri delivery.',
  },
  'pacific-jumbo-oysters-1-dozen': {
    description: 'Pacific jumbo oysters — extra-large, meaty and wonderfully creamy. These oversized Pacific oysters make a real statement on any seafood platter. Freshly shucked on the half shell, sold by the dozen. Premium quality from Tasman Star Seafoods.',
  },
  'pacific-plate-unshucked-oysters-1-dozen': {
    description: 'Pacific plate oysters sold unshucked by the dozen — great value for those who enjoy opening their own oysters at home. These whole Pacific oysters keep longer in the shell and are perfect for barbecuing, grilling or shucking fresh at the table. From Tasman Star Seafoods.',
  },
  'sydney-rock-bistro-oysters-1-dozen': {
    description: "Sydney rock oysters — Australia's native oyster species with a distinctive mineral flavour and firmer texture than Pacific oysters. These bistro-grade rocks have a complex, briny sweetness that oyster lovers crave. Shucked on the half shell, sold by the dozen from Tasman Star Seafoods.",
  },
  'kilpatrick-oysters-half-dozen': {
    description: 'Kilpatrick oysters — six freshly prepared oysters topped with bacon, Worcestershire sauce and a touch of tomato, ready to grill or bake until bubbling. A classic Australian pub favourite, made fresh by Tasman Star Seafoods. Simply heat and serve.',
  },
  'mornay-oysters-half-dozen': {
    description: 'Mornay oysters — six fresh oysters topped with a rich, cheesy bechamel sauce ready for the oven or grill. Bake until golden and bubbling for a warm, indulgent starter. Prepared fresh by Tasman Star Seafoods on the Gold Coast.',
  },
  'oyster-vinaigrette': {
    description: 'Oyster vinaigrette — fresh shucked oysters dressed with a delicate vinaigrette of red wine vinegar, shallots and herbs. An elegant, ready-to-serve appetiser for dinner parties and special occasions. Prepared fresh by Tasman Star Seafoods.',
  },

  // ── SCALLOPS ──
  'roe-on-tassie-scallops': {
    description: 'Roe-on Tasmanian scallops — plump, sweet scallop meats with their bright orange roe still attached for extra richness and visual appeal. Sourced from the pristine cold waters of Tasmania, these premium Australian scallops are perfect for pan-searing until golden on the outside and silky within. The roe adds a delicate, creamy contrast to the sweet white flesh. Serve on a bed of pea puree or with brown butter and capers. Sold per kg from Tasman Star Seafoods. Keep refrigerated and cook within 1–2 days. Order by 4pm Tue/Thu for Gold Coast delivery.',
  },
  'roe-off-scallops': {
    description: 'Roe-off scallops — pure, clean scallop meats with a buttery sweetness and melt-in-the-mouth texture. These Tasmanian scallops are trimmed and ready to sear, grill or use in ceviche. Their mild, delicate flavour makes them one of the most versatile shellfish available. Sold per kg from Tasman Star Seafoods.',
  },
  'roe-off-half-shell-scallops': {
    description: 'Roe-off half shell scallops — presented on their natural shell for elegant oven baking or grilling. Top with garlic butter and breadcrumbs, or a drizzle of miso glaze, then bake until just set. Sold by the dozen from Tasman Star Seafoods.',
  },

  // ── MUSSELS ──
  'black-mussels-1kg-packs': {
    description: 'Fresh black mussels in convenient 1kg packs — an affordable and delicious shellfish option. Steam open with white wine, garlic and parsley for a classic moules mariniere, or add to pasta, paella and soups. These Australian black mussels have plump, orange flesh with a sweet, briny flavour. Sold per 1kg pack from Tasman Star Seafoods.',
  },
  'greenlip-mussels-loose': {
    description: 'New Zealand greenlip mussels — larger and meatier than standard black mussels with a distinctive green-lipped shell. These premium mussels have a rich, sweet flavour and are wonderful steamed, baked or added to chowders. Sold loose per kg from Tasman Star Seafoods.',
    countryOfOrigin: 'New Zealand',
  },
  'greenlip-mussel-meat': {
    description: 'New Zealand greenlip mussel meat — shelled and ready to use in your favourite recipes. These plump, orange mussel meats are perfect for pasta sauces, seafood pies, fritters and stir-fries. No prep needed — just cook and enjoy. Sold per kg from Tasman Star Seafoods.',
    countryOfOrigin: 'New Zealand',
  },
  'marinated-mussel-pot-original': {
    description: 'Marinated mussel pot in original herb marinade — tender mussel meats marinated in a classic blend of olive oil, vinegar and herbs. Ready to eat straight from the pot as a snack, appetiser or tossed through a salad. Prepared fresh by Tasman Star Seafoods.',
  },
  'marinated-mussel-pot-chilli': {
    description: 'Marinated mussel pot with chilli — plump mussel meats in a spicy chilli and herb marinade. A zesty, ready-to-eat snack or appetiser with a pleasant kick of heat. Great on crusty bread or stirred through pasta. From Tasman Star Seafoods.',
  },
  'marinated-mussel-pot-garlic': {
    description: 'Marinated mussel pot with garlic — tender mussel meats soaked in a fragrant garlic and herb oil. Enjoy straight from the pot, pile onto bruschetta, or warm gently and serve as a tapas-style starter. From Tasman Star Seafoods.',
  },

  // ── RAW FILLETS ──
  'salmon-fillets-skin-on': {
    description: "Fresh Atlantic salmon fillets with skin on — Australia's most popular fish fillet, and for good reason. Rich in omega-3 fatty acids with a buttery, melt-in-the-mouth texture and vibrant orange flesh. Pan-fry skin-side down for a crispy finish, oven bake with herbs, or poach gently for a lighter meal. These premium salmon fillets from Tasman Star Seafoods are incredibly versatile and cook in minutes. Sold per kg. Keep refrigerated and use within 2 days. Order by 4pm Tue/Thu for Wed/Fri Gold Coast delivery, from Palm Beach to Upper Coomera.",
  },
  'barramundi-fillets-skin-off': {
    description: "Fresh barramundi fillets with skin removed — Queensland's iconic table fish with firm, white flesh and a mild, buttery flavour. Skinless fillets are ready to pan-fry, steam, bake or crumb. A family-friendly fish that works in virtually any recipe. Sold per kg from Tasman Star Seafoods.",
  },
  'barramundi-fillets-skin-on': {
    description: "Fresh barramundi fillets with skin on — pan-fry skin-side down for a golden, crispy finish that contrasts beautifully with the moist, flaky flesh. Queensland barramundi is one of Australia's finest eating fish. Sold per kg from Tasman Star Seafoods.",
  },
  'local-snapper-fillets': {
    description: "Local snapper fillets — wild caught off the Gold Coast with firm, pink-white flesh and a clean, sweet flavour. Snapper is one of Australia's most prized table fish, perfect for pan-frying, baking whole-style fillets, or steaming Asian-style with ginger and soy. Sold per kg from Tasman Star Seafoods.",
  },
  'gold-band-snapper-fillets': {
    description: 'Gold band snapper fillets — a deep-water snapper species with delicate, moist flesh and a subtle sweetness. These fillets hold together well when baking or grilling and are a favourite in Asian and Mediterranean-inspired dishes. Sold per kg from Tasman Star Seafoods.',
  },
  'red-snapper-fillets': {
    description: 'Red snapper fillets — firm, lean white flesh with a mild, slightly sweet flavour. An excellent all-rounder for pan-frying, grilling or baking. Red snapper holds its shape well during cooking, making it ideal for fish tacos, curries and baked dishes. Sold per kg from Tasman Star Seafoods.',
  },
  'flathead-fillets': {
    description: 'Flathead fillets — the classic Australian fish and chips fillet. Wild caught with thin, delicate flesh that crisps up perfectly when battered or crumbed. Flathead has a mild, sweet flavour that appeals to the whole family. Also wonderful pan-fried with a squeeze of lemon. Sold per kg from Tasman Star Seafoods.',
  },
  'ocean-trout-fillets': {
    description: 'Fresh ocean trout fillets — similar to salmon but with a deeper colour and richer, more complex flavour. Australian ocean trout is high in omega-3s and wonderful pan-seared, oven-roasted or served raw as sashimi. A premium alternative to salmon. Sold per kg from Tasman Star Seafoods.',
  },
  'coral-trout-fillets': {
    description: "Coral trout fillets — one of Queensland's most prized reef fish with delicate, sweet white flesh and a clean oceanic flavour. Wild caught from the Great Barrier Reef region, coral trout is best prepared simply to let its natural flavour shine — steam with ginger, pan-fry lightly, or bake with herbs. Sold per kg from Tasman Star Seafoods.",
  },
  'john-dory-fillets': {
    description: 'John Dory fillets — thin, delicate fillets with a fine, sweet flavour prized by chefs worldwide. This elegant fish is perfect for pan-frying in brown butter, poaching or baking en papillote. The flesh is firm yet tender with a clean, refined taste. Sold per kg from Tasman Star Seafoods.',
  },
  'mahi-mahi-fillets': {
    description: 'Mahi mahi fillets — firm, lean fillets with a mild, slightly sweet flavour and large, moist flakes. Also known as dolphinfish, mahi mahi is excellent grilled, blackened with Cajun spice, or used in fish tacos. A popular choice for healthy, high-protein meals. Sold per kg from Tasman Star Seafoods.',
  },
  'harpuka-fillets': {
    description: 'Harpuka fillets — a deep-water Australian species with firm, white flesh and a mild, clean flavour. Harpuka (also known as hapuku or groper) is excellent for pan-frying, roasting or grilling. Its dense, meaty texture holds up well to robust sauces and marinades. Sold per kg from Tasman Star Seafoods.',
  },
  'swordfish-steaks': {
    description: 'Swordfish steaks — thick, meaty steaks with a firm, steak-like texture that holds up perfectly on the barbecue or grill pan. Swordfish has a mild, slightly sweet flavour and is often compared to a fine cut of meat. Marinate with lemon, olive oil and herbs, then grill to medium. Sold per kg from Tasman Star Seafoods.',
  },
  'spanish-mackerel-fillets': {
    description: 'Spanish mackerel fillets — a rich, full-flavoured Queensland fish with firm, oily flesh that is high in omega-3s. Wonderful grilled, smoked or pan-fried. Spanish mackerel stands up well to bold flavours like chilli, lime and coriander. Sold per kg from Tasman Star Seafoods.',
  },
  'pearl-perch-fillets': {
    description: 'Pearl perch fillets — a highly regarded Queensland reef fish with moist, white flesh and a delicate, sweet flavour. Locally caught and perfect for pan-frying, baking or steaming. Pearl perch is a favourite among Gold Coast chefs for its consistent quality. Sold per kg from Tasman Star Seafoods.',
  },
  'sand-whiting-fillets': {
    description: 'Sand whiting fillets — a prized Australian species with fine, sweet white flesh and a delicate texture. Sand whiting is wonderful pan-fried in a light flour dusting, or crumbed and shallow-fried for a refined take on fish and chips. Sold per kg from Tasman Star Seafoods.',
  },
  'king-george-whiting-fillets': {
    description: "King George whiting fillets — widely considered Australia's finest eating fish. These premium fillets have delicate, sweet white flesh with a subtle nutty flavour. Pan-fry gently in butter for one of the simplest and most satisfying seafood dishes you can make. Sold per kg from Tasman Star Seafoods.",
  },

  // ── OCTOPUS, SQUID & CUTTLEFISH ──
  'large-cleaned-octopus': {
    description: 'Large cleaned octopus — tenderised and ready to cook for a restaurant-quality result at home. These Australian octopus have been cleaned, tumbled and prepared so all you need to do is char-grill, slow-braise or roast until tender. Octopus is a spectacular centrepiece on a mezze platter served with olive oil, lemon and smoked paprika. Rich in protein and low in fat. Sold per kg from Tasman Star Seafoods. Keep refrigerated or frozen. Order by 4pm Tue/Thu for Wed/Fri Gold Coast delivery.',
  },
  'medium-cleaned-octopus': {
    description: 'Medium cleaned octopus — tenderised and prepped, ideal for slicing into salads, adding to paella, or grilling as part of a seafood barbecue spread. These Australian octopus cook quickly and deliver a wonderful charred, smoky flavour. Sold per kg from Tasman Star Seafoods.',
  },
  'small-cleaned-baby-octopus': {
    description: 'Small cleaned baby octopus — tender, bite-sized and perfect for quick-cooking on a hot grill or wok. Toss with garlic, chilli and olive oil for a simple Mediterranean-style dish, or thread onto skewers for the barbecue. Sold per kg from Tasman Star Seafoods.',
  },
  'medium-uncleaned-squid': {
    description: 'Medium uncleaned squid — whole, fresh squid at a great value price. Clean and prepare at home for the freshest possible calamari. Stuff whole, slice into rings for frying, or separate the tubes and tentacles for grilling. Locally caught and sold per kg from Tasman Star Seafoods.',
  },
  'cleaned-tenderised-squid-tubes': {
    description: 'Cleaned and tenderised squid tubes — ready to score, slice into rings and fry for golden calamari, or stuff with breadcrumbs and herbs for baked stuffed squid. These pre-tenderised tubes cook quickly and stay tender. Sold per kg from Tasman Star Seafoods.',
  },
  'cleaned-tenderized-cuttlefish-meat': {
    description: 'Cleaned and tenderised cuttlefish meat — thicker and meatier than squid with a similar mild, sweet flavour. Excellent grilled, stir-fried or braised in a rich tomato and wine sauce. Cuttlefish absorbs marinades beautifully. Sold per kg from Tasman Star Seafoods.',
  },
  'marinara-mix': {
    description: 'Marinara mix — a ready-to-cook blend of prawns, squid, mussels and fish pieces, perfect for pasta marinara, paella, seafood risotto or chowder. This convenient mix saves preparation time while delivering a variety of seafood flavours in every bite. Sold per kg from Tasman Star Seafoods.',
  },

  // ── SASHIMI, SUSHI & PLATTERS ──
  'salmon-sashimi': {
    description: "Premium salmon sashimi grade — silky, rich and vibrant orange, sliced from the finest Australian Atlantic salmon. This sashimi-grade salmon has been carefully handled to ensure it meets the highest standards for raw consumption. Serve thinly sliced with soy sauce, wasabi and pickled ginger for an authentic Japanese experience. The buttery, melt-on-the-tongue texture makes this one of Tasman Star Seafoods' most popular products. Sold per kg. Keep refrigerated and consume on the day of purchase for the best flavour and texture.",
  },
  'tuna-sashimi': {
    description: 'Sashimi-grade tuna — deep ruby-red flesh with a clean, meaty flavour and smooth, buttery texture. Sourced from premium yellowfin or bigeye tuna, this sashimi fish is ideal for slicing paper-thin and serving with soy and wasabi, or searing briefly for tataki. Sold per kg from Tasman Star Seafoods.',
  },
  'kingfish-sashimi': {
    description: 'Sashimi-grade kingfish (hiramasa) — pale pink flesh with a delicate, clean flavour and a subtle richness. Australian yellowtail kingfish is prized in Japanese cuisine for its refined taste and silky texture. Serve raw with yuzu, ponzu or a drizzle of good olive oil and sea salt. Sold per kg from Tasman Star Seafoods.',
  },
  'blanched-octopus-sashimi': {
    description: 'Blanched octopus for sashimi — lightly poached to set the texture while keeping the flesh tender and flavourful. Slice thinly and serve Japanese-style with ponzu and sesame, or use in a Mediterranean octopus salad. Ready to slice and serve. Sold per kg from Tasman Star Seafoods.',
  },
  'salmon-avocado-sushi': {
    description: 'Salmon avocado sushi pack — freshly made sushi rolls with premium salmon and creamy avocado, wrapped in seasoned rice and nori. A convenient, ready-to-eat lunch or snack made fresh by Tasman Star Seafoods. Keep refrigerated.',
  },
  'tuna-avocado-sushi': {
    description: 'Tuna avocado sushi pack — hand-rolled sushi featuring sashimi-grade tuna and ripe avocado in seasoned sushi rice. A fresh, healthy option for lunch or a light dinner. Made fresh by Tasman Star Seafoods.',
  },
  'prawn-avocado-sushi': {
    description: 'Prawn avocado sushi pack — cooked prawn and creamy avocado rolled in seasoned rice and nori. A family-friendly sushi option that is fresh, flavourful and ready to enjoy. Made by Tasman Star Seafoods.',
  },
  'sashimi-platter-small': {
    description: 'Small sashimi platter from Tasman Star Seafoods — an assortment of premium sashimi-grade salmon, tuna and kingfish, beautifully presented and ready to serve. Ideal for 1–2 people as a starter or light meal. Accompanied by soy sauce, wasabi and pickled ginger.',
  },
  'sashimi-platter-medium': {
    description: 'Medium sashimi platter — a generous selection of sashimi-grade salmon, tuna and kingfish sliced by our team at Tasman Star Seafoods. Perfect for 2–4 people as a shared starter or centrepiece. Served with soy, wasabi and pickled ginger.',
  },
  'sashimi-platter-large': {
    description: 'Large sashimi platter — an impressive spread of premium sashimi-grade fish including salmon, tuna and kingfish, expertly sliced and arranged for 4–6 guests. The perfect centrepiece for a dinner party or celebration. Prepared fresh by Tasman Star Seafoods with accompaniments included.',
  },
  'sushi-platter-small': {
    description: 'Small sushi platter — a curated assortment of nigiri and maki rolls made fresh by Tasman Star Seafoods. Features a mix of salmon, tuna, prawn and vegetable pieces. Perfect for 2–3 people as a shared meal or party starter.',
  },
  'sushi-platter-large': {
    description: 'Large sushi platter — a showstopping selection of fresh nigiri, maki rolls and sashimi for 4–8 guests. Hand-crafted by Tasman Star Seafoods with premium seafood, this platter is ideal for parties, corporate catering or family gatherings on the Gold Coast. Order by 4pm Tue/Thu for next-day delivery.',
  },

  // ── SAUCES ──
  'tartare-sauce': {
    description: 'Classic tartare sauce — the essential accompaniment for fish and chips, crumbed fillets and seafood platters. Our creamy tartare is made with pickles, capers and herbs for a tangy, savoury kick. Add to your Tasman Star Seafoods order for the perfect finishing touch.',
  },
  'cocktail-sauce': {
    description: 'Seafood cocktail sauce — a classic blend of tomato, horseradish and lemon that pairs perfectly with cooked prawns, oysters and crab. No seafood platter is complete without it. Add to your Tasman Star Seafoods order.',
  },
  'sweet-chilli-sauce': {
    description: 'Sweet chilli sauce — a sticky, sweet and mildly spicy dipping sauce that complements prawns, bugs, calamari and spring rolls. A crowd-pleasing addition to any seafood spread from Tasman Star Seafoods.',
  },
  'garlic-aioli': {
    description: 'Garlic aioli — a rich, creamy garlic sauce that elevates grilled fish, prawns and seafood platters. The perfect dipping sauce for calamari or drizzled over a fish burger. Available from Tasman Star Seafoods.',
  },
  'lemon-butter-sauce': {
    description: 'Lemon butter sauce — a silky, citrusy sauce that enhances any pan-fried or baked fish fillet. Drizzle over salmon, barramundi or snapper for a simple yet elegant finish. From Tasman Star Seafoods.',
  },
  'wasabi': {
    description: 'Wasabi paste — the essential sashimi and sushi condiment with a sharp, sinus-clearing heat. A small dab adds an authentic Japanese punch to salmon, tuna and kingfish sashimi. From Tasman Star Seafoods.',
  },
  'soy-sauce': {
    description: 'Soy sauce — the classic dipping sauce for sashimi, sushi and dumplings. Add to your sashimi platter order for a complete experience. From Tasman Star Seafoods.',
  },
  'pickled-ginger': {
    description: 'Pickled ginger (gari) — thinly sliced pink ginger used as a palate cleanser between different pieces of sashimi and sushi. A must-have accompaniment for any sashimi platter order from Tasman Star Seafoods.',
  },
  'lemon-wedges': {
    description: 'Fresh lemon wedges — the simplest and most essential seafood accompaniment. A squeeze of lemon brightens oysters, prawns, fish fillets and calamari. Add to your Tasman Star Seafoods order.',
  },
  'seafood-seasoning': {
    description: 'Seafood seasoning blend — a fragrant mix of herbs and spices designed specifically for fish and shellfish. Rub onto fillets before grilling, sprinkle over prawns, or mix into crumb coatings. From Tasman Star Seafoods.',
  },

  // ── SMOKED & CURED FISH ──
  'smoked-sliced-salmon-200g': {
    description: 'Smoked sliced salmon 200g pack — silky, cold-smoked salmon sliced thinly and ready to serve. Perfect on bagels with cream cheese, draped over scrambled eggs, or layered into canapes for entertaining. A 200g pack is ideal for 2–3 servings. From Tasman Star Seafoods.',
  },
  'smoked-sliced-salmon-1kg': {
    description: 'Smoked sliced salmon 1kg bulk pack — the same premium cold-smoked salmon in a larger format, perfect for catering, platters and larger gatherings. Rich, buttery and delicately smoky, this sliced salmon is ready to serve straight from the pack. Great value from Tasman Star Seafoods.',
  },
  'smoked-whole-trout': {
    description: 'Smoked whole trout — a beautifully golden, hot-smoked rainbow trout with flaky, moist flesh and a delicate smoky flavour. Serve whole as a centrepiece, flake into salads or pasta, or enjoy with crusty bread and horseradish cream. Sold per piece from Tasman Star Seafoods.',
  },
};

async function main() {
  console.log(`Updating ${Object.keys(updates).length} product descriptions...`);
  let updated = 0;
  let notFound = 0;

  for (const [slug, data] of Object.entries(updates)) {
    try {
      await prisma.product.update({
        where: { slug },
        data: {
          description: data.description,
          ...(data.countryOfOrigin && { countryOfOrigin: data.countryOfOrigin }),
        },
      });
      updated++;
    } catch {
      console.warn(`  ⚠ Product not found: ${slug}`);
      notFound++;
    }
  }

  console.log(`\nDone: ${updated} updated, ${notFound} not found.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
