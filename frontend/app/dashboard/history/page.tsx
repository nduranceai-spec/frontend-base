'use client';
// app/dashboard/history/page.tsx — Session History
import { motion } from 'framer-motion';
import Link from 'next/link';
import GlassCard from '@/components/ui/GlassCard';
import SpiderButton from '@/components/ui/SpiderButton';

const sessions = [
  { id: 'SES-001', date: '2026-07-30', time: '14:32', type: 'Treadmill Run', duration: '12:45', score: 87, status: 'Complete' },
  { id: 'SES-002', date: '2026-07-30', time: '11:15', type: 'Warm-up Analysis', duration: '05:30', score: 92, status: 'Complete' },
  { id: 'SES-003', date: '2026-07-29', time: '16:00', type: 'Sprint Mechanics', duration: '08:20', score: 79, status: 'Complete' },
  { id: 'SES-004', date: '2026-07-29', time: '09:10', type: 'Long Run Gait', duration: '22:10', score: 85, status: 'Complete' },
  { id: 'SES-005', date: '2026-07-28', time: '15:45', type: 'Recovery Run', duration: '18:00', score: 90, status: 'Complete' },
];

const scoreColor = (s: number) => s >= 90 ? 'text-green-400' : s >= 80 ? 'text-spider-scarlet' : 'text-yellow-400';

export default function HistoryPage() {
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
        {sessions.map((s, i) => (
          <GlassCard key={s.id} delay={i * 0.07} className="p-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-spider-scarlet/10 border border-spider-scarlet/20 flex items-center justify-center">
                  <span className="text-spider-scarlet text-lg">◉</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-spider-white">{s.type}</p>
                  <p className="text-[10px] font-mono text-spider-dim">{s.id} · {s.date} · {s.time} · {s.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`font-display text-xl font-black ${scoreColor(s.score)}`}>{s.score}</p>
                  <p className="text-[9px] font-mono text-spider-dim">SCORE</p>
                </div>
                <Link href="/dashboard/reports">
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
