# Partner Page Scroll Design

**Goal:** Replace the circular partner presentation on `/our-partner` with a scrolling-first layout that showcases all partners, adds the newly requested names, and removes `Pearl Seafoods`.

## Approved Direction

- Keep the existing hero and CTA sections.
- Remove the circular `SpinningLogos` experience from this page.
- Replace the current split presentation with a single scrolling partner showcase.
- Keep existing partner brands that already appear on the page.
- Add these partners:
  - `Oceanic Seafood`
  - `Raptis Fishing Company`
  - `Northern Wild Catch`
  - `Sea Harvest`
  - `Red Chamber Australia`
  - `Yarra Valley Caviar`
  - `Sea Farm Group`
  - `Oceanic Foods`
- Remove `Pearl Seafoods`.

## UI Approach

- Use horizontally scrolling partner cards instead of a circular animation.
- Reuse local logo assets where they already exist in `public/assets/partners`.
- For newly added partners without confirmed local assets, render polished text-based cards so every partner still appears in the scrolling layout.
- Present the full list across two marquee rows for better readability on desktop and mobile.

## Success Criteria

- No circular partner display remains on `/our-partner`.
- All partner entries appear in scrolling sections.
- New partner names are visible.
- `Pearl Seafoods` no longer appears on the page.
