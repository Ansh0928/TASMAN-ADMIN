# Partner Page Scroll Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update `/our-partner` so every partner is shown in scrolling partner rails instead of a circular layout.

**Architecture:** Keep the page as a server-rendered Next.js route and swap the circular component usage for a unified scrolling card section. Reuse local partner logo assets where available, and fall back to text-based partner cards for newly added names that do not yet have local artwork.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, existing `InfiniteSlider` UI component

---

### Task 1: Replace the page-level partner presentation

**Files:**
- Modify: `src/app/our-partner/page.tsx`

**Step 1: Define the full partner dataset**

- Combine the existing page partners with the additional requested names.
- Remove `Pearl Seafoods` from the displayed list.
- Attach local logo asset paths only where confirmed.

**Step 2: Build scrolling partner rails**

- Replace `LogoCloud` + `SpinningLogos` usage with one scrolling-first section.
- Render partner cards inside `InfiniteSlider`.
- Split the list into two rows for better density and readability.

**Step 3: Add graceful fallback cards**

- Show a logo when a local asset exists.
- Show a branded initials badge and partner name when no local asset exists.

**Step 4: Verify route quality**

- Run lint diagnostics on `src/app/our-partner/page.tsx`.
- Fix any introduced issues before completion.
