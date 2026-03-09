import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const APP_DIR = path.join(process.cwd(), 'src/app');

describe('OG Image Files', () => {
  it('default opengraph-image.tsx exists', () => {
    expect(fs.existsSync(path.join(APP_DIR, 'opengraph-image.tsx'))).toBe(true);
  });

  it('product opengraph-image.tsx exists', () => {
    expect(fs.existsSync(path.join(APP_DIR, 'product/[slug]/opengraph-image.tsx'))).toBe(true);
  });

  it('default OG image uses correct brand colors', () => {
    const content = fs.readFileSync(path.join(APP_DIR, 'opengraph-image.tsx'), 'utf-8');
    expect(content).toContain('#0A192F');
    expect(content).toContain('#FF8543');
    expect(content).toContain('Tasman Star Seafoods');
  });

  it('product OG image includes product data fields', () => {
    const content = fs.readFileSync(path.join(APP_DIR, 'product/[slug]/opengraph-image.tsx'), 'utf-8');
    expect(content).toContain('productName');
    expect(content).toContain('productPrice');
    expect(content).toContain('productImage');
  });

  it('OG images export correct dimensions (1200x630)', () => {
    for (const ogPath of ['opengraph-image.tsx', 'product/[slug]/opengraph-image.tsx']) {
      const content = fs.readFileSync(path.join(APP_DIR, ogPath), 'utf-8');
      expect(content).toContain('1200');
      expect(content).toContain('630');
    }
  });
});

describe('Semantic HTML', () => {
  it('ProductCard uses article element', () => {
    const content = fs.readFileSync(path.join(process.cwd(), 'src/components/ProductCard.tsx'), 'utf-8');
    expect(content).toContain('<article');
    expect(content).toContain('</article>');
  });
});
