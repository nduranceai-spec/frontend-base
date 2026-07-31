'use client';
// app/dashboard/page.tsx — Dashboard Home
import Link from 'next/link';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import SpiderButton from '@/components/ui/SpiderButton';
import { useEffect, useState } from 'react';
import { sessionsApi } from '@/lib/api';
import { Session } from '@/types';

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessionsApi.getHistory()
      .then((response) => setSessions(response.data.sessions || []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toDateString();
  const todaySessions = sessions.filter((session) => new Date(session.created_at).toDateString() === today);
  const scoredSessions = sessions.filter((session) => typeof session.overall_score === 'number' && session.overall_score > 0);
  const latest = scoredSessions[0];
  const averageScore = scoredSessions.length
    ? Math.round(scoredSessions.reduce((total, session) => total + session.overall_score, 0) / scoredSessions.length)
    : null;
  const widgets = [
    { label: 'Latest Score', value: latest ? String(Math.round(latest.overall_score)) : '—', unit: latest ? '/100' : '', trend: latest ? 'Latest analysis' : 'No analysis yet', color: 'text-spider-scarlet' },
    { label: 'Sessions Today', value: String(todaySessions.length), unit: '', trend: todaySessions.length ? 'Recorded today' : 'No sessions today', color: 'text-spider-electric' },
    { label: 'Average Score', value: averageScore ? String(averageScore) : '—', unit: averageScore ? '/100' : '', trend: scoredSessions.length ? `${scoredSessions.length} scored session${scoredSessions.length === 1 ? '' : 's'}` : 'No scored sessions', color: 'text-green-400' },
    { label: 'AI Confidence', value: '—', unit: '', trend: 'Available after analysis', color: 'text-spider-scarlet' },
  ];
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
            {loading && <p className="text-xs font-mono text-spider-dim">Loading sessions...</p>}
            {!loading && !sessions.length && <p className="text-xs font-mono text-spider-dim">No analysis sessions yet. Start a test to see real results here.</p>}
            {sessions.slice(0, 3).map((a, i) => (
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
                    <p className="text-sm text-spider-white font-medium">{a.activity_type}</p>
                      <p className="text-[10px] font-mono text-spider-dim">{new Date(a.created_at).toLocaleString()} · {a.session_type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-bold text-spider-scarlet">{a.overall_score > 0 ? Math.round(a.overall_score) : '—'}</p>
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
