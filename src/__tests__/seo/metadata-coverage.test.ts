import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const APP_DIR = path.join(process.cwd(), 'src/app');

// Pages that MUST have metadata (in page.tsx or layout.tsx in same dir)
const PAGES_REQUIRING_METADATA = [
  'layout.tsx',
  'about/page.tsx',
  'our-partner/page.tsx',
  'our-products/page.tsx',
  'deals/page.tsx',
  'search/page.tsx',
  'product/[slug]/page.tsx',
  'our-business/online-delivery/page.tsx',
  'our-business/retail-stores/page.tsx',
  'our-business/wholesale/page.tsx',
  'our-business/transport/page.tsx',
];

// Directories that must have noindex (check layout.tsx or page.tsx)
const NOINDEX_DIRS = [
  'auth/login',
  'auth/register',
  'auth/forgot-password',
  'auth/reset-password',
  'auth/error',
  'checkout',
  'order-confirmation',
  'account',
  'account/orders',
  'account/addresses',
  'wholesale/login',
  'wholesale/pending',
  'wholesale/prices',
  'wholesale/order',
];

function dirHasMetadata(dir: string): boolean {
  for (const file of ['page.tsx', 'layout.tsx']) {
    const filePath = path.join(APP_DIR, dir, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('export const metadata') || content.includes('generateMetadata')) {
        return true;
      }
    }
  }
  return false;
}

function dirHasNoindex(dir: string): boolean {
  for (const file of ['page.tsx', 'layout.tsx']) {
    const filePath = path.join(APP_DIR, dir, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('index: false')) {
        return true;
      }
    }
  }
  return false;
}

describe('Metadata Coverage', () => {
  for (const page of PAGES_REQUIRING_METADATA) {
    it(`${page} has metadata defined`, () => {
      const filePath = path.join(APP_DIR, page);
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(
        content.includes('export const metadata') || content.includes('generateMetadata')
      ).toBe(true);
    });
  }
});

describe('Noindex Pages', () => {
  for (const dir of NOINDEX_DIRS) {
    it(`${dir} has metadata with noindex`, () => {
      expect(dirHasMetadata(dir)).toBe(true);
      expect(dirHasNoindex(dir)).toBe(true);
    });
  }
});

describe('Root Layout SEO Config', () => {
  it('has metadataBase defined', () => {
    const content = fs.readFileSync(path.join(APP_DIR, 'layout.tsx'), 'utf-8');
    expect(content).toContain('metadataBase');
    expect(content).toContain('tasman-admin.vercel.app');
  });

  it('has title template', () => {
    const content = fs.readFileSync(path.join(APP_DIR, 'layout.tsx'), 'utf-8');
    expect(content).toContain('template');
    expect(content).toContain('Tasman Star Seafoods');
  });

  it('has Twitter card config', () => {
    const content = fs.readFileSync(path.join(APP_DIR, 'layout.tsx'), 'utf-8');
    expect(content).toContain('twitter');
    expect(content).toContain('summary_large_image');
  });

  it('has robots config with googleBot', () => {
    const content = fs.readFileSync(path.join(APP_DIR, 'layout.tsx'), 'utf-8');
    expect(content).toContain('googleBot');
    expect(content).toContain('max-image-preview');
  });
});

describe('Brand Consistency', () => {
  it('root layout uses "Tasman Star Seafoods" not "Tasman Star Market"', () => {
    const content = fs.readFileSync(path.join(APP_DIR, 'layout.tsx'), 'utf-8');
    expect(content).not.toContain("'Tasman Star Market");
    expect(content).toContain('Tasman Star Seafoods');
  });
});
