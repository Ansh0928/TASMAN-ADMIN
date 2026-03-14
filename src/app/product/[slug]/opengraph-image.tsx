import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';

export const alt = 'Tasman Star Seafoods Product';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let productName = 'Premium Seafood';
  let productPrice = '';
  let productCategory = '';
  let productImage = '';

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { name: true, price: true, imageUrls: true, categories: { include: { category: { select: { name: true } } }, where: { isPrimary: true } } },
    });
    if (product) {
      productName = product.name;
      productPrice = `$${Number(product.price).toFixed(2)}`;
      productCategory = product.categories[0]?.category?.name || '';
      productImage = product.imageUrls[0] || '';
    }
  } catch {
    // Fallback to defaults
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #020C1B 0%, #0A192F 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px',
            flex: 1,
          }}
        >
          {productCategory && (
            <div style={{ fontSize: '14px', color: '#FF8543', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 'bold', marginBottom: '16px' }}>
              {productCategory}
            </div>
          )}
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'white', marginBottom: '16px', lineHeight: 1.1 }}>
            {productName}
          </div>
          {productPrice && (
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#FF8543', marginBottom: '24px' }}>
              {productPrice}
            </div>
          )}
          <div style={{ fontSize: '16px', color: '#94a3b8' }}>
            Tasman Star Seafoods — Gold Coast
          </div>
        </div>
        {productImage && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '500px', padding: '40px' }}>
            <img src={productImage} alt={productName} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '16px' }} />
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, transparent, #FF8543, transparent)',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
