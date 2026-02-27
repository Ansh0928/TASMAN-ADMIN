'use client';

import dynamic from 'next/dynamic';

const RegionalMap = dynamic(() => import('./RegionalMap'), { ssr: false });

export default function RegionalMapLazy() {
  return <RegionalMap />;
}
