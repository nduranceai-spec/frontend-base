'use client';
// components/dashboard/MetricsPanel.tsx — Gait metrics display

import { GaitMetrics } from '@/types';

const METRIC_CONFIG = [
  { key: 'cadence',                  label: 'Cadence',         unit: 'SPM',  lo: 170, hi: 185 },
  { key: 'vertical_oscillation_cm',  label: 'Vert. Osc.',      unit: 'cm',   lo: 6,   hi: 8.5 },
  { key: 'ground_contact_time_ms',   label: 'Ground Contact',  unit: 'ms',   lo: 180, hi: 220, invert: true },
  { key: 'stride_length_m',          label: 'Stride Length',   unit: 'm',    lo: 0.9, hi: 1.4 },
  { key: 'step_symmetry_pct',        label: 'Symmetry',        unit: '%',    lo: 95,  hi: 100 },
  { key: 'knee_flexion_impact',      label: 'Knee Impact',     unit: '°',    lo: 155, hi: 170 },
  { key: 'hip_extension_deg',        label: 'Hip Extension',   unit: '°',    lo: 15,  hi: 22 },
];

function getStatus(value: number, lo: number, hi: number, invert = false) {
  const inRange = value >= lo && value <= hi;
  if (inRange) return 'optimal';
  const margin = (hi - lo) * 0.25;
  return value >= lo - margin && value <= hi + margin ? 'warning' : 'danger';
}

interface Props { metrics: GaitMetrics; }

export function MetricsPanel({ metrics }: Props) {
  return (
    <div className="space-y-2">
      {METRIC_CONFIG.map(({ key, label, unit, lo, hi, invert }) => {
        const value = (metrics as any)[key];
        if (value === undefined || value === 0) return null;

        const status = getStatus(value, lo, hi, invert);
        const dotColor = status === 'optimal' ? 'bg-emerald-400'
          : status === 'warning' ? 'bg-amber-400' : 'bg-red-400';
        const textColor = status === 'optimal' ? 'text-emerald-400'
          : status === 'warning' ? 'text-amber-400' : 'text-red-400';

        return (
          <div key={key} className="flex items-center justify-between py-1 border-b border-white/[0.04] last:border-0">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
              <span className="text-xs text-slate-500">{label}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`text-xs font-mono font-semibold ${textColor}`}>
                {typeof value === 'number' ? value.toFixed(key.includes('ms') ? 0 : 1) : value}
              </span>
              <span className="text-xs text-slate-600">{unit}</span>
            </div>
          </div>
        );
      })}
      {metrics.foot_strike_type && (
        <div className="flex items-center justify-between py-1">
          <span className="text-xs text-slate-500">Foot Strike</span>
          <span className="text-xs font-medium text-cyan-neon">{metrics.foot_strike_type}</span>
        </div>
      )}
    </div>
  );
}
