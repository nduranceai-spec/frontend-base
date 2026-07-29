'use client';
// components/dashboard/ScoreRing.tsx — Animated circular score indicator

import { useMemo } from 'react';

interface Props { score: number; size?: number; }

export function ScoreRing({ score, size = 120 }: Props) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(score, 100) / 100) * circumference;

  const color = score >= 85 ? '#22c55e' : score >= 65 ? '#f59e0b' : '#ef4444';
  const label = score >= 85 ? 'Excellent' : score >= 65 ? 'Good' : 'Needs Work';

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10}
        />
        {/* Fill */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={score > 0 ? 'url(#ringGrad)' : 'rgba(255,255,255,0.06)'}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute">
        <div className="text-3xl font-black text-white text-center"
          style={{ lineHeight: 1 }}>
          {score > 0 ? Math.round(score) : '—'}
        </div>
        <div className="text-xs text-slate-500 text-center">{label}</div>
      </div>
    </div>
  );
}
