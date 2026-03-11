# Product description guideline — market research & SEO

This document summarises market research (competitor copy, keywords, and best-practice structure) and gives concrete, SEO-friendly rules for Tasman Star Seafood product descriptions. Use it when writing or editing the `description` field for products (admin or seed).

**Product assets:** Product images live in `public/assets/products/`. The canonical product and category list is in `prisma/seed.ts`. Descriptions are used for page meta, Open Graph, JSON-LD Product schema, and on-page body in `src/app/product/[slug]/`.

---

## 1. Product copy rules (SEO best practice)

### Meta description (used in `<meta name="description">` and Open Graph)

- **Length:** 150–160 characters. Stay under 160 so search results don’t truncate; mobile often truncates around 120–140, so front-load the main message.
- **Content:** Include the **primary keyword** (e.g. “large cooked king prawns”) in the first 120 characters, plus one clear **benefit or CTA** (e.g. “fresh from the Gold Coast”, “order online for delivery”).
- **Uniqueness:** Every product should have a unique meta description. When `description` is empty, the site uses a generic fallback (“Buy fresh {name} from Tasman Star Seafoods…”); add a real description so snippets stand out.
- **Tone:** Benefit-driven, no keyword stuffing. Use power words sparingly (e.g. “Fresh”, “Premium”, “Delivered”).

### On-page description (body + schema)

- **First 1–2 sentences:** Can mirror or align with the meta (≈155 chars) so meta and visible copy are consistent.
- **Length by product type:**
  - **Hero / featured / high-value products:** 100–300+ words. Use short paragraphs or bullets; add origin, taste/use, storage, serving.
  - **Standard SKUs:** 50–150 words. At least 2–3 sentences: what it is, why it’s good, how to use or order.
- **Readability:** Short sentences, scannable structure. No keyword stuffing; use primary and secondary terms naturally.
- **Schema:** The site outputs `Product` JSON-LD with `description`. Use the same (or a trimmed) version as the on-page description so search engines and rich results match the page.

### Do’s and don’ts

| Do | Don’t |
|----|--------|
| Put primary keyword in the first sentence | Stuff keywords into every line |
| Mention Gold Coast / Queensland / Australia where relevant | Use a single generic line for every product |
| Include origin, freshness, or preparation where it adds value | Copy competitor text verbatim |
| Add a simple CTA or trust line (e.g. delivery, family business) | Exceed 160 characters for the meta-style opening |
| Keep tone consistent with Tasman Star (premium, local, fresh) | Make unverifiable health or sustainability claims |

---

## 2. Keywords by category

Use these to choose **primary** (in title/first sentence) and **secondary** (naturally in body) terms when writing. Geo focus: **Gold Coast, Queensland, Australia**.

| Category | Primary / high-intent terms | Secondary terms |
|----------|-----------------------------|------------------|
| **Cooked Prawns** | fresh cooked king prawns, cooked king prawns Gold Coast, buy cooked prawns online, tiger prawns cooked | king prawns, endeavour prawns, school prawns, Queensland prawns, delivery, per kg |
| **Raw Prawns** | raw king prawns, green king prawns, raw tiger prawns, buy prawns online Australia | NQ tiger prawns, cutlets, wild caught, fresh prawns Gold Coast |
| **Cooked Crabs** | cooked mud crab, cooked sand crab, cooked spanner crab, king crab legs | Gold Coast crabs, Queensland, fresh cooked, seafood delivery |
| **Raw Crabs** | green sand crabs, raw crabs, live crabs | mud crab, spanner, local |
| **Cooked Bugs** | Moreton Bay bugs cooked, Balmain bugs, honey bugs | flathead lobster, Queensland bugs, cooked bugs Gold Coast |
| **Raw Bugs** | green Moreton Bay bugs, raw Moreton Bay bugs | wild caught, Queensland |
| **Crayfish & Lobsters** | Western Australian crayfish, rock lobster, lobster tails | WA cray, local rock lobster, southern rock lobster, cooked lobster |
| **Live Species** | live mud crabs, live spanner crabs, live rock lobster, live pipis | Gold Coast live seafood, order live crabs |
| **Oysters** | Pacific oysters, Sydney rock oysters, oysters Gold Coast, oysters dozen | Coffin Bay, Kilpatrick, Mornay, fresh oysters delivery |
| **Scallops** | Tasmanian scallops, scallops roe on, scallops roe off | Tassie scallops, half shell, fresh scallops |
| **Mussels** | fresh mussels, black mussels | live mussels, kg, seafood |
| **Raw Fillets** | fresh fish fillets, snapper fillet, barramundi fillet | local fish, wild caught, skin on/off |
| **Octopus, Squid & Cuttlefish** | fresh octopus, squid, cuttlefish | cleaned octopus, calamari, seafood |
| **Sashimi, Sushi & Platters** | sashimi platter, sushi platter, seafood platter Gold Coast | fresh sashimi, party platter, delivery |
| **Sauces** | seafood sauce, oyster sauce, accompaniments | |
| **Smoked & Cured Fish** | smoked fish, cured salmon | |

### Hero products — extra keywords (2–3 examples)

- **Large Cooked King Prawns:** large cooked king prawns, best cooked king prawns Gold Coast, king prawns per kg, fresh cooked prawns delivery.
- **Cooked Moreton Bay Bugs:** Moreton Bay bugs cooked, buy Moreton Bay bugs, Queensland bugs, flathead lobster.
- **Pacific Plate Oysters 1 Dozen:** Pacific oysters dozen, fresh oysters Gold Coast, oysters delivery, 1 dozen oysters.

---

## 3. Competitor product copy patterns

Research was done on Australian seafood e‑commerce (e.g. The Fishmonger’s Son, Gem Pier Seafood, ATP Seafood, Aussie Seafood House, Blue Harvest). Patterns to use (and how Tasman Star can differentiate):

### Structure they use

- **Short lead:** One clear sentence on what the product is and key benefit (e.g. “Locally caught King George Whiting. Expertly butterflied and de-boned, ready for a quick dip in flour and into the pan.”).
- **Origin:** “Fresh fish from Australia”, “Locally caught”, “Wild caught Queensland” — always state origin or source.
- **Specs:** Weight or portion (e.g. “Approx. 80–100 g per fillet”), unit (per kg, per dozen).
- **Storage & freshness:** “Keep refrigerated and consume within 2–3 days.”
- **Ordering:** Order cutoff or delivery info (e.g. “Order online before 8pm for pick up the next day”) where relevant.

### Themes to emulate

- **Origin / provenance:** Queensland, Gold Coast, local, wild caught, own trawlers (Tasman Star differentiator).
- **Freshness:** “Fresh”, “same day”, “delivered fresh”.
- **Use case:** Cooking method, serving idea, occasion (e.g. “perfect for salads”, “ideal for BBQ”).
- **Trust:** Family business, Gold Coast fish market, delivery area (e.g. Palm Beach to Upper Coomera).

### Example competitor snippet (anonymised style)

> “Locally caught [product]. [Preparation/format]. Fresh [product type] from Australia. Approx. [weight] per [unit]. Keep refrigerated and consume within 2–3 days. [Order/delivery note].”

**Tasman Star angle:** Lead with your own trawlers and Gold Coast base; add “Wed & Fri delivery” or “order by 4pm Tue/Thu” where it fits.

---

## 4. Template and checklist

Use this when writing or reviewing a product description.

### Opening (meta-friendly — aim for ~155 chars)

- [ ] Product name + primary keyword in first sentence.
- [ ] One benefit or differentiator (fresh, Gold Coast, delivery, quality).
- [ ] Fits in 150–160 characters if used as meta.

### Body (on-page)

- [ ] Origin or source (e.g. Queensland, our trawlers, Tasmanian).
- [ ] Brief taste/use or preparation idea (e.g. “perfect for …”, “ready to …”).
- [ ] Unit/size if helpful (per kg, per dozen, approx. weight).
- [ ] Storage/freshness in one short line if relevant.
- [ ] Optional: CTA or trust (e.g. “Order by 4pm Tue/Thu for Wed/Fri delivery”, “Gold Coast’s trusted fish market”).

### Final check

- [ ] No keyword stuffing; primary and secondary terms used naturally.
- [ ] Unique to this product (not copied from another SKU).
- [ ] Matches Tasman Star tone (premium, local, honest).

---

## 5. Sample descriptions

Three examples written to this guideline. Use them as style and structure references for other products.

### Sample 1: Large Cooked King Prawns

**Suggested meta (155 chars):**  
“Large cooked king prawns from the Gold Coast. Fresh, sweet and ready to eat. Order online for Wed & Fri delivery — Tasman Star Seafoods.”

**On-page description:**

Large cooked king prawns from Tasman Star Seafoods are the star of any platter or salad. Sourced from our own trawlers and cooked to perfection, they’re sweet, firm and ready to serve — no prep needed.

Ideal for entertaining, seafood platters, or a simple prawn cocktail. Sold per kg. Keep refrigerated and consume within 2–3 days. Order by 4pm Tuesday or Thursday for Wednesday or Friday delivery across the Gold Coast.

---

### Sample 2: Cooked Sand Crabs

**Suggested meta (158 chars):**  
“Cooked sand crabs — fresh from the Gold Coast. Sweet, delicate meat, perfect for salads and cold dishes. Order online for delivery. Tasman Star Seafoods.”

**On-page description:**

Our cooked sand crabs are a Gold Coast favourite: sweet, delicate white meat with a clean, briny flavour. They’re cooked fresh and ready to pick and serve in salads, sandwiches or with a squeeze of lemon.

Sold per kg. Keep refrigerated and use within 2–3 days. Order online by 4pm Tue/Thu for Wed/Fri delivery from Palm Beach to Upper Coomera.

---

### Sample 3: Pacific Plate Oysters 1 Dozen

**Suggested meta (152 chars):**  
“Pacific Plate oysters 1 dozen — fresh shucked, Gold Coast delivery. Clean, briny and perfect for parties. Order online. Tasman Star Seafoods.”

**On-page description:**

Pacific Plate oysters, one dozen, shucked and ready to enjoy. Clean, briny and perfect with a squeeze of lemon or a dash of vinaigrette. A crowd-pleaser for gatherings or a treat at home.

Fresh from the Gold Coast. Keep chilled and consume within 1–2 days. Order by 4pm Tuesday or Thursday for Wednesday or Friday delivery.

---

## Applying this to all products

- **Guideline only:** Use this doc when writing or editing descriptions in the admin panel or in `prisma/seed.ts`. No code changes required.
- **Bulk drafts:** For first-pass copy on every product, you can export the product list (name, category, unit, tags), then generate one description per product using this guideline and the keyword table, and import or paste into admin/seed.
- **Optional later:** If you want a different meta description from the on-page body, add a `metaDescription` (or `shortDescription`) field to the Product model and use it only for `<meta>` and Open Graph; keep `description` for the on-page body and JSON-LD.
