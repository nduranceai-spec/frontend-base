'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Activity, Award, BarChart3, Camera, ChevronRight, Clock, Play, Sparkles, Zap } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { sessionsApi, systemApi } from '@/lib/api';
import { Session } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const ACTIVITY_COLORS: Record<string, string> = {
  running: 'text-emerald-400',
  walking: 'text-blue-400',
  standing: 'text-slate-400',
  squat: 'text-purple-400',
  pushup: 'text-amber-400',
  lunge: 'text-rose-400',
  jump: 'text-cyan-400',
  unknown: 'text-slate-600',
};

export default function DashboardOverview() {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      sessionsApi.getHistory(5, 0).then((r) => setSessions(r.data.sessions || [])),
      systemApi.health().then((r) => setSystemStatus(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  const totalSessions = sessions.length;
  const avgScore = sessions.length ? Math.round(sessions.reduce((a, s) => a + (s.overall_score || 0), 0) / sessions.length) : 0;

  const QUICK_STATS = [
    { label: 'Sessions', value: totalSessions, icon: Clock, color: 'text-cyan-300' },
    { label: 'Avg Score', value: `${avgScore}`, suffix: '/100', icon: Award, color: 'text-amber-300' },
    { label: 'MediaPipe', value: systemStatus?.mediapipe === 'available' ? 'Ready' : 'Loading', icon: Zap, color: 'text-emerald-300' },
    { label: 'AI Engine', value: systemStatus?.gemini === 'configured' ? 'Active' : 'Fallback', icon: Activity, color: 'text-violet-300' },
  ];

  return (
    <div className="space-y-8 p-6 sm:p-8 lg:p-10">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            Performance console
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span className="text-gradient-brand">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="mt-2 text-sm text-slate-400">Your motion intelligence workspace is ready for the next session.</p>
        </div>
        <Link href="/dashboard/live" className="btn-primary">
          <Play className="h-4 w-4" />
          Start Analysis
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {QUICK_STATS.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass-card p-5">
            <div className={`${stat.color} mb-4`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold text-white">{stat.value}</span>
              {stat.suffix && <span className="text-xs text-slate-500">{stat.suffix}</span>}
            </div>
            <div className="mt-2 text-sm text-slate-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="glass-card overflow-hidden p-7 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">
              <span className="live-dot" />
              Live ready
            </div>
            <h2 className="text-2xl font-semibold text-white">3-camera capture, real-time insight, premium coaching.</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">Connect your left, back, and right cameras and let NDURANCE AI detect your current movement, score your mechanics, and suggest the next improvement.</p>
          </div>
          <div className="flex gap-3">
            {['LEFT', 'BACK', 'RIGHT'].map((cam) => (
              <div key={cam} className="flex h-24 w-16 flex-col items-center justify-center gap-1 rounded-2xl border border-cyan-400/20 bg-slate-950/60 text-center">
                <Camera className="h-5 w-5 text-cyan-300" />
                <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-500">{cam}</span>
              </div>
            ))}
          </div>
        </div>
        <Link href="/dashboard/live" className="btn-primary mt-6 inline-flex">
          <Camera className="h-4 w-4" />
          Open Live Analysis
          <ChevronRight className="h-4 w-4" />
        </Link>
      </motion.div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Sessions</h2>
          <Link href="/dashboard/history" className="flex items-center gap-1 text-sm text-cyan-300 hover:underline">
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="glass-card h-16 shimmer rounded-[20px]" />)}
          </div>
        ) : sessions.length === 0 ? (
          <div className="glass-card rounded-[24px] p-12 text-center">
            <BarChart3 className="mx-auto mb-3 h-10 w-10 text-slate-600" />
            <p className="text-sm text-slate-400">No sessions yet.</p>
            <p className="mt-1 text-xs text-slate-500">Start your first live analysis to see data here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="glass-card flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                    <Activity className={`h-5 w-5 ${ACTIVITY_COLORS[s.activity_type] || 'text-slate-400'}`} />
                  </div>
                  <div>
                    <div className="text-sm font-medium capitalize text-white">{s.activity_type}</div>
                    <div className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}
                      {' · '}
                      {Math.round(s.duration_seconds)}s
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">{s.overall_score.toFixed(0)}</div>
                    <div className="text-xs text-slate-500">/ 100</div>
                  </div>
                  <Link href={`/dashboard/history/${s.id}`} className="btn-ghost px-3 py-1.5 text-xs">
                    View
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
