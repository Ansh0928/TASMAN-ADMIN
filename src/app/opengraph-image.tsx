import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Tasman Star Seafoods — Premium Seafood Gold Coast';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #020C1B 0%, #0A192F 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(255,133,67,0.15) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#FF8543',
            marginBottom: '24px',
            fontSize: '40px',
            fontWeight: 'bold',
            color: 'white',
          }}
        >
          TS
        </div>
        <div style={{ fontSize: '52px', fontWeight: 'bold', color: 'white', marginBottom: '12px', textAlign: 'center' }}>
          Tasman Star Seafoods
        </div>
        <div style={{ fontSize: '24px', color: '#FF8543', textAlign: 'center', marginBottom: '20px' }}>
          Premium Seafood — Gold Coast
        </div>
        <div style={{ fontSize: '18px', color: '#94a3b8', textAlign: 'center', maxWidth: '600px' }}>
          From the boats to the cold trucks, and straight to your business or home.
        </div>
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
