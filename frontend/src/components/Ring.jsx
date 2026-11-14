import React from 'react';

// Circular gauge. value is 0–100.
export default function Ring({ value, size = 96, stroke = 9, unit = '', label }) {
  const rad = (size - stroke) / 2;
  const c = 2 * Math.PI * rad;
  const id = `g${size}${value}${label ?? ''}`.replace(/\W/g, '');
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#2f7bff" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={rad} fill="none" stroke="#14203a" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={rad} fill="none" stroke={`url(#${id})`} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)}
          style={{ filter: 'drop-shadow(0 0 6px rgba(47,123,255,.7))', transition: 'stroke-dashoffset .8s' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-mono font-bold" style={{ fontSize: size * 0.28 }}>{value}<span className="text-mute" style={{ fontSize: size * 0.14 }}>{unit}</span></span>
        {label && <span className="text-[9px] uppercase tracking-widest text-mute mt-1">{label}</span>}
      </div>
    </div>
  );
}
