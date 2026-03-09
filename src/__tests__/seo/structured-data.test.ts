import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const APP_DIR = path.join(process.cwd(), 'src/app');

describe('Structured Data - Organization Schema', () => {
  it('root layout contains Organization JSON-LD', () => {
    const content = fs.readFileSync(path.join(APP_DIR, 'layout.tsx'), 'utf-8');
    expect(content).toContain('Organization');
    expect(content).toContain('Tasman Star Seafoods');
    expect(content).toContain('https://www.facebook.com/TasmanStarSeafoodMarket/');
    expect(content).toContain('https://www.instagram.com/tasmanstarseafoodmarket/');
  });

  it('root layout contains WebSite JSON-LD with SearchAction', () => {
    const content = fs.readFileSync(path.join(APP_DIR, 'layout.tsx'), 'utf-8');
    expect(content).toContain('WebSite');
    expect(content).toContain('SearchAction');
    expect(content).toContain('search_term_string');
  });
});

describe('Structured Data - FAQ Schema', () => {
  it('about page contains FAQPage JSON-LD', () => {
    const content = fs.readFileSync(path.join(APP_DIR, 'about/page.tsx'), 'utf-8');
    expect(content).toContain('FAQPage');
    expect(content).toContain('Question');
    expect(content).toContain('Answer');
  });

  it('about page contains LocalBusiness JSON-LD', () => {
    const content = fs.readFileSync(path.join(APP_DIR, 'about/page.tsx'), 'utf-8');
    expect(content).toContain('LocalBusiness');
    expect(content).toContain('Labrador');
    expect(content).toContain('Varsity Lakes');
  });
});

describe('Structured Data - Product Schema', () => {
  it('product page has enhanced Product JSON-LD', () => {
    const content = fs.readFileSync(path.join(APP_DIR, 'product/[slug]/page.tsx'), 'utf-8');
    expect(content).toContain("'@type': 'Product'");
    expect(content).toContain("'@type': 'Brand'");
    expect(content).toContain("'@type': 'Offer'");
    expect(content).toContain('priceValidUntil');
    expect(content).toContain('sku');
  });

  it('product page has BreadcrumbList JSON-LD', () => {
    const content = fs.readFileSync(path.join(APP_DIR, 'product/[slug]/page.tsx'), 'utf-8');
    expect(content).toContain('BreadcrumbList');
    expect(content).toContain('ListItem');
  });
});
