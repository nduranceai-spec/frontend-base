'use client';
// app/dashboard/history/[id]/page.tsx — Session Detail

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Download, Activity, Brain,
  Award, AlertTriangle, Dumbbell, ChevronDown
} from 'lucide-react';
import { sessionsApi, reportsApi } from '@/lib/api';
import { SessionDetail } from '@/types';
import { AlertFeed } from '@/components/dashboard/AlertFeed';
import { ActivityBadge } from '@/components/dashboard/ActivityBadge';

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    sessionsApi.getDetail(id)
      .then((r) => setSession(r.data))
      .catch(() => router.push('/dashboard/history'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleDownloadReport = async () => {
    setGeneratingReport(true);
    try {
      await reportsApi.generate(id);
      window.open(reportsApi.downloadPdfUrl(id), '_blank');
    } catch {
      alert('Report generation failed.');
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loading) return (
    <div className="p-8 space-y-4">
      {[1,2,3].map((i) => <div key={i} className="glass-card h-24 shimmer rounded-xl" />)}
    </div>
  );

  if (!session) return null;

  const jointMetrics = session.metrics.filter((m) => m.name.startsWith('joint_'));
  const gaitMetrics = session.metrics.filter((m) => !m.name.startsWith('joint_'));

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/history" className="btn-ghost p-2">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-3">
              Session Detail
              <ActivityBadge activity={session.activity_type} small />
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              {new Date(session.created_at).toLocaleString()} • {Math.round(session.duration_seconds)}s • {session.frames_analyzed} frames
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleDownloadReport} disabled={generatingReport}
            className="btn-secondary text-sm gap-2">
            <Download className="w-4 h-4" />
            {generatingReport ? 'Generating...' : 'Download PDF'}
          </button>
          <a href={reportsApi.downloadCsvUrl(id)} className="btn-ghost text-sm gap-2">
            CSV Export
          </a>
        </div>
      </div>

      {/* Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 text-center">
          <Award className="w-6 h-6 text-amber-400 mx-auto mb-2" />
          <div className={`text-3xl font-black ${
            session.overall_score >= 85 ? 'text-emerald-400' :
            session.overall_score >= 65 ? 'text-amber-400' : 'text-red-400'
          }`}>{session.overall_score.toFixed(1)}</div>
          <div className="text-xs text-slate-500 mt-1">Overall Score / 100</div>
        </div>
        <div className="glass-card p-5 text-center">
          <Activity className="w-6 h-6 text-cyan-neon mx-auto mb-2" />
          <div className="text-xl font-bold text-white capitalize">{session.activity_type}</div>
          <div className="text-xs text-slate-500 mt-1">Activity Type</div>
        </div>
        <div className="glass-card p-5 text-center">
          <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
          <div className="text-xl font-bold text-white">{session.alerts.length}</div>
          <div className="text-xs text-slate-500 mt-1">Posture Alerts</div>
        </div>
      </div>

      {/* AI Summary */}
      {session.ai_summary && (
        <div className="glass-purple p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-purple-300">AI Session Analysis</span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">{session.ai_summary}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gait Metrics */}
        {gaitMetrics.length > 0 && (
          <div className="glass-card p-5">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-neon" /> Biomechanical Metrics
            </h2>
            <div className="space-y-2">
              {gaitMetrics.map((m) => (
                <div key={m.name} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                  <span className="text-xs text-slate-500 capitalize">
                    {m.name.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono font-semibold ${
                      m.status === 'optimal' ? 'text-emerald-400' :
                      m.status === 'warning' ? 'text-amber-400' : 'text-slate-300'
                    }`}>{m.value?.toFixed(1)}</span>
                    <span className="text-xs text-slate-700">{m.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Posture Alerts
          </h2>
          <AlertFeed alerts={session.alerts} maxShow={8} />
        </div>
      </div>

      {/* Recommendations */}
      {session.recommendations.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-emerald-400" />
            Recommendations ({session.recommendations.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {session.recommendations.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass p-4 rounded-xl"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white">{rec.title}</h3>
                  <span className="text-xs text-slate-600 px-2 py-0.5 rounded-full bg-white/5 capitalize shrink-0 ml-2">
                    {rec.category}
                  </span>
                </div>
                {rec.sets_reps && (
                  <p className="text-xs text-cyan-neon mb-2 font-mono">{rec.sets_reps}</p>
                )}
                <p className="text-xs text-slate-400 leading-relaxed">{rec.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
