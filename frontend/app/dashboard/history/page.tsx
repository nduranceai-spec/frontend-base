'use client';
// app/dashboard/history/page.tsx — Session History
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import GlassCard from '@/components/ui/GlassCard';
import SpiderButton from '@/components/ui/SpiderButton';
import { sessionsApi } from '@/lib/api';
import { Session } from '@/types';

const scoreColor = (s: number) => s >= 90 ? 'text-green-400' : s >= 80 ? 'text-spider-scarlet' : 'text-yellow-400';

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessionsApi.getHistory()
      .then((response) => setSessions(response.data.sessions || []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-[10px] font-mono text-spider-scarlet tracking-[0.3em] mb-1">SESSION ARCHIVE</p>
          <h1 className="font-display text-3xl font-black text-spider-white">SESSION <span className="text-gradient-crimson">HISTORY</span></h1>
        </div>
        <Link href="/dashboard/live">
          <SpiderButton variant="primary" size="sm">▶ New Session</SpiderButton>
        </Link>
      </motion.div>

      <div className="space-y-3">
        {loading && <p className="text-xs font-mono text-spider-dim">Loading session history...</p>}
        {!loading && !sessions.length && <GlassCard className="p-6"><p className="text-sm text-spider-dim">No sessions recorded yet.</p></GlassCard>}
        {sessions.map((s, i) => (
          <GlassCard key={s.id} delay={i * 0.07} className="p-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-spider-scarlet/10 border border-spider-scarlet/20 flex items-center justify-center">
                  <span className="text-spider-scarlet text-lg">◉</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-spider-white capitalize">{s.activity_type}</p>
                  <p className="text-[10px] font-mono text-spider-dim">#{s.id} · {new Date(s.created_at).toLocaleString()} · {Math.round(s.duration_seconds || 0)}s</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`font-display text-xl font-black ${scoreColor(s.overall_score)}`}>{s.overall_score > 0 ? Math.round(s.overall_score) : '—'}</p>
                  <p className="text-[9px] font-mono text-spider-dim">SCORE</p>
                </div>
                <Link href={`/dashboard/history/${s.id}`}>
                  <SpiderButton variant="ghost" size="sm">View</SpiderButton>
                </Link>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
