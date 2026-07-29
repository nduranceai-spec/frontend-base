'use client';
// app/dashboard/history/page.tsx — Session History

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Clock, Activity, ChevronRight, Trash2,
  BarChart3, FileText, AlertCircle
} from 'lucide-react';
import { sessionsApi, reportsApi } from '@/lib/api';
import { Session } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const ACTIVITY_COLORS: Record<string, string> = {
  running: 'text-emerald-400', walking: 'text-blue-400', standing: 'text-slate-400',
  squat: 'text-purple-400', pushup: 'text-amber-400', lunge: 'text-rose-400',
  jump: 'text-cyan-400', unknown: 'text-slate-600',
};

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  const load = async (off = 0) => {
    setLoading(true);
    try {
      const res = await sessionsApi.getHistory(LIMIT, off);
      setSessions((prev) => off === 0 ? res.data.sessions : [...prev, ...res.data.sessions]);
      setTotal(res.data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(0); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this session?')) return;
    await sessionsApi.delete(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setTotal((t) => t - 1);
  };

  const handleGenerateReport = async (id: string) => {
    try {
      await reportsApi.generate(id);
      window.open(reportsApi.downloadPdfUrl(id), '_blank');
    } catch (err) {
      alert('Failed to generate report. Please try again.');
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Session History</h1>
        <p className="text-slate-500 text-sm mt-1">{total} sessions recorded</p>
      </div>

      {loading && sessions.length === 0 ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="glass-card h-20 shimmer rounded-xl" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="glass-card p-16 text-center rounded-2xl">
          <BarChart3 className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h2 className="text-white font-semibold mb-2">No sessions yet</h2>
          <p className="text-slate-500 text-sm">
            Start your first live analysis session to build your history.
          </p>
          <Link href="/dashboard/live" className="btn-primary mt-6 inline-flex">
            Start Analysis
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card p-5 flex items-center justify-between group"
            >
              {/* Left: icon + info */}
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-surface-800 flex items-center justify-center shrink-0">
                  <Activity className={`w-5 h-5 ${ACTIVITY_COLORS[s.activity_type] || 'text-slate-400'}`} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white capitalize">{s.activity_type}</div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-slate-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.round(s.duration_seconds)}s
                    </span>
                    <span className="text-xs text-slate-600">{s.frames_analyzed} frames</span>
                    <span className="text-xs text-slate-600">
                      {formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: score + actions */}
              <div className="flex items-center gap-4">
                {/* Score */}
                <div className="text-right">
                  <div className={`text-lg font-black ${
                    s.overall_score >= 85 ? 'text-emerald-400' :
                    s.overall_score >= 65 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {s.overall_score.toFixed(0)}
                  </div>
                  <div className="text-xs text-slate-600">/ 100</div>
                </div>

                {/* Actions (show on hover) */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/dashboard/history/${s.id}`}
                    className="btn-ghost text-xs px-3 py-1.5 rounded-lg">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleGenerateReport(s.id)}
                    className="btn-ghost text-xs px-3 py-1.5 rounded-lg text-cyan-neon">
                    <FileText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="btn-ghost text-xs px-3 py-1.5 rounded-lg text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {sessions.length < total && (
            <button
              onClick={() => { setOffset(sessions.length); load(sessions.length); }}
              className="btn-secondary w-full mt-4"
            >
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  );
}
