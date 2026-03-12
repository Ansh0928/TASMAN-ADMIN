'use client';

import dynamic from 'next/dynamic';
import { useRef, useState, useEffect } from 'react';

const RegionalMap = dynamic(() => import('./RegionalMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] md:h-[650px] rounded-3xl bg-[#06111f] animate-pulse flex items-center justify-center">
      <p className="text-slate-500 text-sm">Loading map...</p>
    </div>
  ),
});

export default function RegionalMapLazy() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {visible ? (
        <RegionalMap />
      ) : (
        <div className="w-full h-[600px] md:h-[650px] rounded-3xl bg-[#06111f]" />
      )}
    </div>
  );
}
