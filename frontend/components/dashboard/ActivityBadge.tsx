'use client';
// components/dashboard/ActivityBadge.tsx

import { ActivityType } from '@/types';
import { Activity, PersonStanding, Footprints, Dumbbell, ChevronUp } from 'lucide-react';

const CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  standing: { label: 'Standing', color: 'text-slate-300', bg: 'bg-slate-500/15 border-slate-500/25', icon: PersonStanding },
  walking:  { label: 'Walking',  color: 'text-blue-400',  bg: 'bg-blue-500/15 border-blue-500/25',  icon: Footprints },
  running:  { label: 'Running',  color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/25', icon: Activity },
  squat:    { label: 'Squat',    color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/25', icon: Dumbbell },
  pushup:   { label: 'Push-up',  color: 'text-amber-400',  bg: 'bg-amber-500/15 border-amber-500/25',  icon: Dumbbell },
  lunge:    { label: 'Lunge',    color: 'text-rose-400',   bg: 'bg-rose-500/15 border-rose-500/25',   icon: Dumbbell },
  jump:     { label: 'Jump',     color: 'text-cyan-400',   bg: 'bg-cyan-500/15 border-cyan-500/25',   icon: ChevronUp },
  unknown:  { label: 'Detecting...', color: 'text-slate-600', bg: 'bg-white/5 border-white/10', icon: Activity },
  no_person: { label: 'No Person', color: 'text-slate-700', bg: 'bg-white/5 border-white/10', icon: Activity },
};

interface Props {
  activity: ActivityType | string;
  confidence?: number;
  small?: boolean;
}

export function ActivityBadge({ activity, confidence = 0, small = false }: Props) {
  const cfg = CONFIG[activity] || CONFIG.unknown;
  const Icon = cfg.icon;

  if (small) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${cfg.bg} ${cfg.color}`}>
        <Icon className="w-3 h-3" />
        {cfg.label}
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${cfg.bg}`}>
      <Icon className={`w-4 h-4 ${cfg.color}`} />
      <span className={`font-semibold ${cfg.color}`}>{cfg.label}</span>
      {confidence > 0 && (
        <span className="text-xs text-slate-600 ml-1">{(confidence * 100).toFixed(0)}%</span>
      )}
    </div>
  );
}
