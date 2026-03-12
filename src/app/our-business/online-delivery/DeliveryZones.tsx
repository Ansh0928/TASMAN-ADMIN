'use client';

const DELIVERY_ZONES = [
  { name: 'Gold Coast', days: ['Mon', 'Tue', 'Fri'], color: '#FF8543', colorRgb: '255,133,67' },
  { name: 'Northern Rivers', days: ['Tue', 'Fri'], color: '#4fc3f7', colorRgb: '79,195,247' },
];

export default function DeliveryZones() {
  return (
    <div className="w-full rounded-2xl md:rounded-3xl overflow-hidden relative" style={{ background: '#06111f' }}>
      {/* Pulse animation */}
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>

      {/* Ambient gradient blobs */}
      <div
        className="absolute top-[30%] right-[25%] w-[150px] h-[150px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,133,67,0.06) 0%, transparent 70%)', filter: 'blur(30px)' }}
      />
      <div
        className="absolute bottom-[15%] right-[30%] w-[120px] h-[120px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(79,195,247,0.05) 0%, transparent 70%)', filter: 'blur(30px)' }}
      />

      {/* SVG map background */}
      <div className="absolute inset-0 opacity-25 flex items-center justify-center pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-[60%] h-[60%] md:w-[75%] md:h-[75%]">
          {/* Stylized QLD outline */}
          <path
            d="M40,20 L160,20 L170,70 L165,120 L120,120 L120,125 L90,125 L90,120 L60,120 L40,80 Z"
            fill="none"
            stroke="rgba(255,133,67,0.4)"
            strokeWidth="1"
          />
          {/* Stylized NSW outline */}
          <path
            d="M40,122 L90,122 L90,127 L120,127 L120,122 L165,122 L170,160 L140,190 L50,190 L40,160 Z"
            fill="none"
            stroke="rgba(79,195,247,0.4)"
            strokeWidth="1"
          />
          {/* Gold Coast pulse dot */}
          <circle cx="138" cy="105" r="4" fill="#FF8543" opacity="0.6" />
          <circle
            cx="138" cy="105" r="4"
            fill="none"
            stroke="#FF8543"
            strokeWidth="0.5"
            opacity="0.3"
            style={{ transformOrigin: '138px 105px', animation: 'pulse-ring 2s ease-out infinite' }}
          />
          {/* Northern Rivers pulse dot */}
          <circle cx="130" cy="130" r="4" fill="#4fc3f7" opacity="0.6" />
          <circle
            cx="130" cy="130" r="4"
            fill="none"
            stroke="#4fc3f7"
            strokeWidth="0.5"
            opacity="0.3"
            style={{ transformOrigin: '130px 130px', animation: 'pulse-ring 2s ease-out infinite 0.5s' }}
          />
        </svg>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center py-10 px-4 md:py-16 md:px-8 gap-4 md:gap-5">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
          We Deliver Fresh
        </h2>
        <p className="text-slate-400 text-xs md:text-sm mb-2">
          Two regions. Three days a week. Always fresh.
        </p>

        {/* Glass cards */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto">
          {DELIVERY_ZONES.map((zone) => (
            <div
              key={zone.name}
              className="rounded-[14px] text-center px-6 py-5 md:px-7 md:py-5 w-full md:w-auto md:min-w-[160px]"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid rgba(${zone.colorRgb}, 0.12)`,
              }}
            >
              <div className="text-white text-sm md:text-[15px] font-semibold mb-1.5">
                {zone.name}
              </div>
              <div className="text-[13px] font-medium tracking-wide" style={{ color: zone.color }}>
                {zone.days.join(' · ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
