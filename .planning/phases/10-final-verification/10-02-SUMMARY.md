---
phase: 10-final-verification
plan: 02
subsystem: ui
tags: [map, next-link, responsive-layout, product-navigation, regional-data]

requires:
  - phase: none
    provides: existing RegionalMap component
provides:
  - Side-by-side map layout on desktop with info panel adjacent to map
  - Product-linked species cards navigating to /product/{slug}
  - Curated species data matching actual product catalog
affects: [map, product-pages, navigation]

tech-stack:
  added: []
  patterns: [side-by-side responsive layout with lg breakpoint, shared content component for mobile/desktop panels]

key-files:
  created: []
  modified: [src/components/map/RegionalMap.tsx]

key-decisions:
  - "Adjusted isMobile breakpoint from 768 to 1024 to match Tailwind lg: for side-by-side layout"
  - "Removed 6 species without matching products (Blue Swimmer Crab, Pearl Meat, Dhufish, Abalone, Gummy Shark, Hoki)"
  - "Removed categorySlug property — replaced per-region category links with per-species product links"
  - "Used shared infoPanelContent variable to avoid duplicating panel markup between mobile and desktop"

patterns-established:
  - "Side-by-side layout: flex-col lg:flex-row with hidden lg:block / lg:hidden for panel visibility"

requirements-completed: []

duration: 2min
completed: 2026-03-09
---

# Phase 10 Plan 02: Map Layout and Product-Linked Species Summary

**Side-by-side map layout on desktop with species cards linking directly to product pages, curated to only show species Tasman Star actually sells**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-09T03:57:31Z
- **Completed:** 2026-03-09T03:59:39Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Restructured map layout: info panel renders adjacent (right side) on desktop, stacks below on mobile
- Removed 6 species with no matching products (Blue Swimmer Crab, Pearl Meat, Dhufish, Abalone, Gummy Shark, Hoki)
- Species cards are now Link components navigating to /product/{slug} with hover "View Product" indicator
- Added desktop placeholder state showing "Select a Region" when no region is active
- Preserved 3D isometric transform on desktop map -- only outer layout container changed

## Task Commits

Each task was committed atomically:

1. **Task 1: Restructure map layout and update species data with product links** - `766ff68` (feat)

**Plan metadata:** pending (docs: complete plan)

## Files Created/Modified
- `src/components/map/RegionalMap.tsx` - Side-by-side layout, product-linked species, curated species data

## Decisions Made
- Adjusted isMobile breakpoint from 768px to 1024px to align with Tailwind lg: breakpoint for the side-by-side layout
- Removed categorySlug entirely since per-species product links replace per-region category links
- Used a shared infoPanelContent variable rendered in both desktop (static) and mobile (AnimatePresence) containers to avoid code duplication
- Trimmed image arrays for regions that lost species (SA, WA, VIC, NZ) to remove irrelevant product images

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Map component ready for visual verification
- All species link to existing product slugs from the database

---
*Phase: 10-final-verification*
*Completed: 2026-03-09*

## Self-Check: PASSED
