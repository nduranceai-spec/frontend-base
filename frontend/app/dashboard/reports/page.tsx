'use client';
// app/dashboard/reports/page.tsx — Premium Analysis Report
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
} from 'recharts';
import GlassCard from '@/components/ui/GlassCard';
import SpiderButton from '@/components/ui/SpiderButton';
import { sessionsApi, reportsApi } from '@/lib/api';
import { SessionDetail } from '@/types';

function CircularScore({ score, label, color = '#DC143C' }: { score: number; label: string; color?: string }) {
  const r = 42; const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} stroke="rgba(220,20,60,0.1)" strokeWidth="8" fill="none" />
          <motion.circle
            cx="50" cy="50" r={r}
            stroke={color} strokeWidth="8" fill="none"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-black text-spider-white">{score}</span>
          <span className="text-[9px] font-mono text-spider-dim">/100</span>
        </div>
      </div>
      <span className="text-[10px] font-mono text-spider-silver tracking-widest uppercase">{label}</span>
    </div>
  );
}

export default function ReportsPage() {
  const [downloading, setDownloading] = useState(false);
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessionsApi.getHistory(1)
      .then(async (response) => {
        const latest = response.data.sessions?.[0];
        if (latest) setSession((await sessionsApi.getDetail(String(latest.id))).data);
      })
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, []);

  const radarData = session?.metrics.slice(0, 6).map((metric) => ({
    metric: metric.name.replace(/^joint_/, '').replace(/_/g, ' '),
    score: Number(metric.value) || 0,
  })) || [];
  const insights = session?.alerts.slice(0, 6).map((alert) => ({
    type: alert.severity === 'danger' ? 'warning' : 'info',
    text: alert.message,
  })) || [];

  const handleDownloadReport = async () => {
    if (!session) return;
    setDownloading(true);
    try {
      await reportsApi.generate(String(session.id));
      window.open(reportsApi.downloadPdfUrl(String(session.id)), '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadVideo = async () => {
    alert('Video download requires an active recording session. Start a test first, then use the download buttons on the capture page.');
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-[10px] font-mono text-spider-scarlet tracking-[0.3em] mb-1">BIOMECHANICAL ANALYSIS</p>
          <h1 className="font-display text-3xl font-black text-spider-white">PERFORMANCE <span className="text-gradient-crimson">REPORT</span></h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <SpiderButton id="download-video" variant="electric" size="sm" onClick={handleDownloadVideo}>
            ⬇ Download Video (WebM)
          </SpiderButton>
          <SpiderButton id="download-report" variant="primary" size="sm" disabled={!session} loading={downloading} onClick={handleDownloadReport}>
            ⬇ Download Report
          </SpiderButton>
          <SpiderButton id="view-history" variant="ghost" size="sm" onClick={() => window.location.href = '/dashboard/history'}>
            ◇ View History
          </SpiderButton>
        </div>
      </motion.div>

      {loading && <GlassCard className="p-6"><p className="text-sm text-spider-dim">Loading the latest analysis...</p></GlassCard>}
      {!loading && !session && <GlassCard className="p-6"><p className="text-sm text-spider-dim">No reports available yet. Complete an analysis session first.</p></GlassCard>}

      {/* Score circles */}
      <GlassCard className="p-8 mb-6">
        <p className="text-[10px] font-mono text-spider-scarlet tracking-widest mb-6 uppercase">Overall Performance Scores</p>
        <div className="flex flex-wrap justify-center md:justify-around gap-8">
          <CircularScore score={session?.overall_score || 0} label="Overall Score" color="#DC143C" />
          {session?.metrics.slice(0, 3).map((metric) => (
            <CircularScore key={metric.name} score={Math.min(Math.max(Number(metric.value) || 0, 0), 100)} label={metric.name.replace(/_/g, ' ')} color="#4FC3F7" />
          ))}
        </div>
      </GlassCard>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Radar Chart */}
        <GlassCard className="p-6">
          <p className="text-[10px] font-mono text-spider-scarlet tracking-widest mb-4 uppercase">Running Pattern Analysis</p>
          {radarData.length > 2 ? <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="rgba(220,20,60,0.15)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#B8B4C0', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
              <Radar name="Score" dataKey="score" stroke="#DC143C" fill="rgba(220,20,60,0.2)"
                strokeWidth={2} dot={{ fill: '#DC143C', r: 4 }} />
            </RadarChart>
          </ResponsiveContainer> : <p className="text-sm text-spider-dim">No metric data recorded for the latest session.</p>}
        </GlassCard>

        {/* Body Alignment Diagram */}
        <GlassCard className="p-6">
          <p className="text-[10px] font-mono text-spider-scarlet tracking-widest mb-4 uppercase">Body Posture Alignment</p>
          <div className="space-y-3">
            {session?.metrics.filter((metric) => metric.name.startsWith('joint_')).map((metric) => (
              <div key={metric.name} className="flex items-center justify-between border-b border-spider-scarlet/10 pb-2">
                <span className="text-xs text-spider-silver capitalize">{metric.name.replace(/^joint_/, '').replace(/_/g, ' ')}</span>
                <span className="text-xs font-mono text-spider-electric">{Number(metric.value).toFixed(1)} {metric.unit || ''}</span>
              </div>
            ))}
            {!session?.metrics.some((metric) => metric.name.startsWith('joint_')) && (
              <p className="text-sm text-spider-dim">No joint-angle data recorded for the latest session.</p>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Metric Bars */}
      <GlassCard className="p-6 mb-6">
        <p className="text-[10px] font-mono text-spider-scarlet tracking-widest mb-5 uppercase">Detailed Metrics</p>
        <div className="grid md:grid-cols-2 gap-4">
          {radarData.map((d, i) => (
            <div key={d.metric}>
              <div className="flex justify-between mb-1.5">
                <span className="text-xs font-mono text-spider-silver">{d.metric}</span>
                <span className="text-xs font-display font-bold text-spider-scarlet">{d.score}</span>
              </div>
              <div className="h-1.5 bg-spider-graphite rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: d.score >= 85 ? '#22c55e' : d.score >= 75 ? '#DC143C' : '#f59e0b' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${d.score}%` }}
                  transition={{ duration: 1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* AI Insights */}
      <GlassCard className="p-6">
        <p className="text-[10px] font-mono text-spider-scarlet tracking-widest mb-5 uppercase">AI-Generated Insights</p>
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className={`flex gap-3 p-4 rounded-xl border text-sm leading-relaxed
                ${insight.type === 'warning' ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-200/80' : ''}
                ${insight.type === 'info' ? 'bg-spider-electric/5 border-spider-electric/20 text-spider-electric/80' : ''}
                ${insight.type === 'success' ? 'bg-green-500/5 border-green-500/20 text-green-200/80' : ''}
              `}
            >
              <span className="mt-0.5 shrink-0">
                {insight.type === 'warning' ? '⚠' : insight.type === 'success' ? '✓' : 'ℹ'}
              </span>
              <p>{insight.text}</p>
            </motion.div>
          ))}
          {!insights.length && <p className="text-sm text-spider-dim">No AI alerts were recorded for the latest session.</p>}
        </div>
      </GlassCard>
    </div>
  );
}
