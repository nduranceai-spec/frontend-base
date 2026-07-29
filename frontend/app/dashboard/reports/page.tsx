'use client';
// app/dashboard/reports/page.tsx — NDURANCE AI Reports Center

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, RefreshCw, Activity, Clock,
  Award, Loader2, AlertCircle, CheckCircle, BarChart3,
  ChevronRight, File, FileSpreadsheet, Sparkles, Calendar
} from 'lucide-react';
import { sessionsApi, reportsApi, getApiErrorMessage } from '@/lib/api';
import { Session } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';

const ACTIVITY_COLORS: Record<string, string> = {
  running:  'text-emerald-400',
  walking:  'text-blue-400',
  standing: 'text-slate-400',
  squat:    'text-purple-400',
  pushup:   'text-amber-400',
  lunge:    'text-rose-400',
  jump:     'text-cyan-400',
  unknown:  'text-slate-600',
};

const ACTIVITY_BG: Record<string, string> = {
  running:  'bg-emerald-400/10 border-emerald-400/20',
  walking:  'bg-blue-400/10 border-blue-400/20',
  standing: 'bg-slate-400/10 border-slate-400/20',
  squat:    'bg-purple-400/10 border-purple-400/20',
  pushup:   'bg-amber-400/10 border-amber-400/20',
  lunge:    'bg-rose-400/10 border-rose-400/20',
  jump:     'bg-cyan-400/10 border-cyan-400/20',
  unknown:  'bg-slate-800/50 border-slate-600/20',
};

const scoreColor = (score: number) => {
  if (score >= 85) return 'text-emerald-400';
  if (score >= 65) return 'text-amber-400';
  return 'text-red-400';
};

export default function ReportsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [generatedIds, setGeneratedIds] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 10;

  useEffect(() => {
    loadSessions();
  }, [page]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await sessionsApi.getHistory(PAGE_SIZE, page * PAGE_SIZE);
      setSessions(res.data.sessions || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (sessionId: string) => {
    setGeneratingId(sessionId);
    setErrors((e) => ({ ...e, [sessionId]: '' }));
    try {
      await reportsApi.generate(sessionId);
      setGeneratedIds((prev) => new Set([...prev, sessionId]));
    } catch (err: unknown) {
      setErrors((e) => ({
        ...e,
        [sessionId]: getApiErrorMessage(err),
      }));
    } finally {
      setGeneratingId(null);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const totalAnalyzed = sessions.reduce((a, s) => a + (s.duration_seconds || 0), 0);
  const avgScore = sessions.length
    ? sessions.reduce((a, s) => a + (s.overall_score || 0), 0) / sessions.length
    : 0;

  return (
    <div className="p-8 space-y-8">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-slate-500 text-sm mt-1">
            Generate and download PDF & CSV reports for your analysis sessions
          </p>
        </div>
        <button
          onClick={loadSessions}
          disabled={loading}
          className="btn-ghost text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </motion.div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: FileText, label: 'Total Sessions', value: total, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
          { icon: Clock, label: 'Total Analysis Time', value: `${Math.round(totalAnalyzed / 60)}m`, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
          { icon: Award, label: 'Average Score', value: `${Math.round(avgScore)}`, suffix: '/100', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`glass-card p-5 border ${stat.border}`}
          >
            <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
              {stat.suffix && <span className="text-xs text-slate-600">{stat.suffix}</span>}
            </div>
            <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Instructions Banner ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-cyan p-5 rounded-2xl flex items-start gap-4"
      >
        <div className="w-10 h-10 rounded-xl bg-cyan-neon/15 border border-cyan-neon/25 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-cyan-neon" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white mb-1">How Reports Work</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Click <strong className="text-cyan-neon">Generate Report</strong> on any session to create a PDF and CSV export.
            Reports include joint angle data, gait metrics, posture alerts, AI analysis, and personalized exercise recommendations.
          </p>
        </div>
      </motion.div>

      {/* ── Sessions List ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Session Reports</h2>
          {total > 0 && (
            <span className="text-xs text-slate-600">
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card p-5 h-20 shimmer rounded-2xl" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-16 text-center rounded-2xl"
          >
            <BarChart3 className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">No Sessions Yet</h3>
            <p className="text-slate-500 text-sm mb-6">
              Complete a live analysis session to generate your first report.
            </p>
            <Link href="/dashboard/live" className="btn-primary text-sm px-6">
              Start Live Analysis
            </Link>
          </motion.div>
        ) : (
          <AnimatePresence>
            {sessions.map((session, i) => {
              const isGenerating = generatingId === session.id;
              const isGenerated = generatedIds.has(session.id);
              const sessionError = errors[session.id];
              const activity = String(session.activity_type || 'unknown').toLowerCase();

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-5 rounded-2xl"
                >
                  <div className="flex items-center gap-4">
                    {/* Activity Icon */}
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${ACTIVITY_BG[activity] || ACTIVITY_BG.unknown}`}>
                      <Activity className={`w-5 h-5 ${ACTIVITY_COLORS[activity] || 'text-slate-400'}`} />
                    </div>

                    {/* Session Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white capitalize">
                          {activity} Session
                        </span>
                        <span className={`text-xs font-bold ${scoreColor(session.overall_score || 0)}`}>
                          {(session.overall_score || 0).toFixed(0)}/100
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(session.created_at), 'MMM d, yyyy · HH:mm')}
                        </span>
                        <span>{formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}</span>
                        <span>{Math.round(session.duration_seconds || 0)}s duration</span>
                      </div>

                      {/* Error */}
                      {sessionError && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-red-400">
                          <AlertCircle className="w-3 h-3" />
                          {sessionError}
                        </div>
                      )}
                      {isGenerated && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400">
                          <CheckCircle className="w-3 h-3" />
                          Report generated! Download below.
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/dashboard/history/${session.id}`}
                        className="btn-ghost text-xs px-3 py-1.5"
                      >
                        View <ChevronRight className="w-3 h-3" />
                      </Link>

                      {isGenerated ? (
                        /* Download buttons after generation */
                        <div className="flex gap-1.5">
                          <a
                            href={reportsApi.downloadPdfUrl(session.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors"
                          >
                            <File className="w-3 h-3" />
                            PDF
                          </a>
                          <a
                            href={reportsApi.downloadCsvUrl(session.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            CSV
                          </a>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleGenerateReport(session.id)}
                          disabled={isGenerating}
                          className="btn-primary text-xs px-4 py-2"
                        >
                          {isGenerating ? (
                            <><Loader2 className="w-3 h-3 animate-spin" /> Generating...</>
                          ) : (
                            <><Sparkles className="w-3 h-3" /> Generate Report</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="btn-ghost text-sm px-4 disabled:opacity-30"
            >
              Previous
            </button>
            <span className="text-xs text-slate-500">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="btn-ghost text-sm px-4 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
