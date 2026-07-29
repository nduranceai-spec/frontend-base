'use client';
// components/dashboard/JointAnglesPanel.tsx

import { JointAngles } from '@/types';

const JOINT_DISPLAY: Array<{ key: keyof JointAngles; label: string; optimal?: [number, number]; optional?: boolean }> = [
  { key: 'neck_angle',          label: 'Neck',             optimal: [-10, 10] },
  { key: 'shoulder_alignment',  label: 'Shoulder Level',   optimal: [-8, 8] },
  { key: 'spine_inclination',   label: 'Spine',            optimal: [-10, 10] },
  { key: 'hip_alignment',       label: 'Hip Level',        optimal: [-8, 8] },
  { key: 'left_hip',            label: 'L. Hip',           optimal: [100, 180] },
  { key: 'right_hip',           label: 'R. Hip',           optimal: [100, 180] },
  { key: 'left_knee',           label: 'L. Knee',          optimal: [150, 180] },
  { key: 'right_knee',          label: 'R. Knee',          optimal: [150, 180] },
  { key: 'left_elbow',          label: 'L. Elbow',         optional: true },
  { key: 'right_elbow',         label: 'R. Elbow',         optional: true },
  { key: 'left_ankle',          label: 'L. Ankle',         optional: true },
  { key: 'right_ankle',         label: 'R. Ankle',         optional: true },
];

function getStatus(value: number, optimal?: [number, number]): 'optimal' | 'warning' | 'normal' {
  if (!optimal) return 'normal';
  const [lo, hi] = optimal;
  if (value >= lo && value <= hi) return 'optimal';
  const margin = (hi - lo) * 0.3;
  if (value >= lo - margin && value <= hi + margin) return 'warning';
  return 'warning';
}

interface Props { angles: JointAngles; }

export function JointAnglesPanel({ angles }: Props) {
  const rows = JOINT_DISPLAY.filter((j) => angles[j.key] !== undefined);

  if (!rows.length) {
    return <p className="text-xs text-slate-600">No landmark data yet.</p>;
  }

  return (
    <div className="space-y-1.5">
      {rows.map(({ key, label, optimal }) => {
        const value = angles[key]!;
        const status = getStatus(value, optimal);

        return (
          <div key={key} className="flex items-center justify-between">
            <span className="text-xs text-slate-500 w-28 shrink-0">{label}</span>
            <div className="flex-1 mx-2 h-1 rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  status === 'optimal' ? 'bg-emerald-500' :
                  status === 'warning' ? 'bg-amber-500' : 'bg-slate-600'
                }`}
                style={{ width: `${Math.min(Math.abs(value) / 180 * 100, 100)}%` }}
              />
            </div>
            <span className={`text-xs font-mono w-12 text-right ${
              status === 'optimal' ? 'text-emerald-400' :
              status === 'warning' ? 'text-amber-400' : 'text-slate-400'
            }`}>
              {value.toFixed(1)}°
            </span>
          </div>
        );
      })}
    </div>
  );
}
