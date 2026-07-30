'use client';
// app/dashboard/page.tsx — Dashboard Home
import Link from 'next/link';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import SpiderButton from '@/components/ui/SpiderButton';

const widgets = [
  { label: 'Posture Score', value: '87', unit: '/100', trend: '+4', color: 'text-spider-scarlet' },
  { label: 'Sessions Today', value: '3', unit: '', trend: '+1', color: 'text-spider-electric' },
  { label: 'Symmetry Index', value: '92%', unit: '', trend: '+2%', color: 'text-green-400' },
  { label: 'AI Confidence', value: '99.1%', unit: '', trend: '—', color: 'text-spider-scarlet' },
];

const activity = [
  { time: '14:32', session: 'Treadmill Run · 5km', score: 87, status: 'Completed' },
  { time: '11:15', session: 'Warm-up Analysis', score: 92, status: 'Completed' },
  { time: '09:00', session: 'Sprint Mechanics', score: 79, status: 'Completed' },
];

export default function DashboardPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <p className="text-[10px] font-mono text-spider-scarlet tracking-[0.3em] mb-1">GOOD AFTERNOON</p>
          <h1 className="font-display text-3xl font-black text-spider-white tracking-tight">PERFORMANCE <span className="text-gradient-crimson">HUB</span></h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-spider-graphite/60 border border-spider-scarlet/15">
          <motion.div className="w-2 h-2 rounded-full bg-green-400" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
          <span className="text-[10px] font-mono text-spider-dim">AI ONLINE</span>
        </div>
      </motion.div>

      {/* Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {widgets.map((w, i) => (
          <GlassCard key={w.label} delay={i * 0.08} className="p-5">
            <p className="text-[10px] font-mono text-spider-dim tracking-widest mb-2 uppercase">{w.label}</p>
            <p className={`font-display text-3xl font-black ${w.color} mb-1`}>{w.value}<span className="text-sm font-normal text-spider-dim">{w.unit}</span></p>
            <p className="text-xs font-mono text-spider-dim">{w.trend} <span className="text-green-400/70">↑</span></p>
          </GlassCard>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <GlassCard className="p-6 lg:col-span-1">
          <p className="text-[10px] font-mono text-spider-scarlet tracking-widest mb-5 uppercase">Quick Actions</p>
          <div className="space-y-3">
            <Link href="/dashboard/live" className="block">
              <SpiderButton variant="primary" size="md" fullWidth>▶ Start New Test</SpiderButton>
            </Link>
            <Link href="/dashboard/reports" className="block">
              <SpiderButton variant="secondary" size="md" fullWidth>◈ View Report</SpiderButton>
            </Link>
            <Link href="/dashboard/history" className="block">
              <SpiderButton variant="ghost" size="md" fullWidth>◇ Session History</SpiderButton>
            </Link>
          </div>
        </GlassCard>

        {/* Recent Activity */}
        <GlassCard className="p-6 lg:col-span-2">
          <p className="text-[10px] font-mono text-spider-scarlet tracking-widest mb-5 uppercase">Recent Sessions</p>
          <div className="space-y-3">
            {activity.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center justify-between py-3 border-b border-spider-scarlet/10 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-spider-scarlet/60 rounded-full" />
                  <div>
                    <p className="text-sm text-spider-white font-medium">{a.session}</p>
                    <p className="text-[10px] font-mono text-spider-dim">{a.time} · {a.status}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-bold text-spider-scarlet">{a.score}</p>
                  <p className="text-[10px] font-mono text-spider-dim">SCORE</p>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* AI System Status */}
      <GlassCard className="mt-6 p-6">
        <p className="text-[10px] font-mono text-spider-scarlet tracking-widest mb-5 uppercase">AI System Status</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Left Camera', status: 'READY', ok: true },
            { label: 'Back Camera', status: 'READY', ok: true },
            { label: 'Right Camera', status: 'READY', ok: true },
            { label: 'Pose Engine', status: 'ONLINE', ok: true },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-spider-void/50 border border-spider-scarlet/10">
              <motion.div
                className={`w-2 h-2 rounded-full ${s.ok ? 'bg-green-400' : 'bg-spider-scarlet'}`}
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div>
                <p className="text-xs text-spider-white">{s.label}</p>
                <p className="text-[10px] font-mono text-green-400">{s.status}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
