'use client';
// app/dashboard/reports/page.tsx — Premium Analysis Report
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
} from 'recharts';
import GlassCard from '@/components/ui/GlassCard';
import SpiderButton from '@/components/ui/SpiderButton';

const radarData = [
  { metric: 'Posture', score: 87 },
  { metric: 'Symmetry', score: 92 },
  { metric: 'Cadence', score: 78 },
  { metric: 'Hip Drop', score: 83 },
  { metric: 'Arm Swing', score: 76 },
  { metric: 'Foot Strike', score: 89 },
];

const insights = [
  { type: 'warning', text: 'Slight left hip drop detected at 60% stance phase — indicates hip abductor weakness.' },
  { type: 'info', text: 'Arm swing angle is 12° narrower than optimal. Focus on elbow drive during speed work.' },
  { type: 'success', text: 'Excellent heel-to-toe transition. Foot strike pattern is biomechanically efficient.' },
  { type: 'info', text: 'Cadence at 162 spm — target 175+ spm to reduce ground contact time.' },
];

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
  const [downloadingVideo, setDownloadingVideo] = useState(false);

  const handleDownloadReport = async () => {
    setDownloading(true);
    await new Promise(r => setTimeout(r, 1500));
    // Create simple text report as placeholder
    const content = `SPIDER TRACK AI — PERFORMANCE REPORT\n${'─'.repeat(40)}\nGenerated: ${new Date().toLocaleString()}\n\nOVERALL SCORE: 84/100\n\nPOSTURE ALIGNMENT: 87/100\nMOVEMENT QUALITY: 81/100\nSYMMETRY INDEX: 92/100\n\nAI INSIGHTS:\n- Slight left hip drop detected\n- Arm swing needs improvement\n- Excellent foot strike pattern\n- Increase cadence to 175+ spm\n\nSpider Track AI · Elite Running Performance`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `spider-track-report-${Date.now()}.txt`;
    a.click(); URL.revokeObjectURL(url);
    setDownloading(false);
  };

  const handleDownloadVideo = async () => {
    setDownloadingVideo(true);
    await new Promise(r => setTimeout(r, 1200));
    // In a real session the WebM blobs would be passed here from live page
    alert('Video download requires an active recording session. Start a test first, then use the download buttons on the capture page.');
    setDownloadingVideo(false);
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
          <SpiderButton id="download-video" variant="electric" size="sm" loading={downloadingVideo} onClick={handleDownloadVideo}>
            ⬇ Download Video (WebM)
          </SpiderButton>
          <SpiderButton id="download-report" variant="primary" size="sm" loading={downloading} onClick={handleDownloadReport}>
            ⬇ Download Report
          </SpiderButton>
          <SpiderButton id="view-history" variant="ghost" size="sm" onClick={() => window.location.href = '/dashboard/history'}>
            ◇ View History
          </SpiderButton>
        </div>
      </motion.div>

      {/* Score circles */}
      <GlassCard className="p-8 mb-6">
        <p className="text-[10px] font-mono text-spider-scarlet tracking-widest mb-6 uppercase">Overall Performance Scores</p>
        <div className="flex flex-wrap justify-center md:justify-around gap-8">
          <CircularScore score={87} label="Posture Alignment" color="#DC143C" />
          <CircularScore score={81} label="Movement Quality" color="#FF4466" />
          <CircularScore score={92} label="Symmetry Index" color="#4FC3F7" />
          <CircularScore score={84} label="Overall Score" color="#DC143C" />
        </div>
      </GlassCard>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Radar Chart */}
        <GlassCard className="p-6">
          <p className="text-[10px] font-mono text-spider-scarlet tracking-widest mb-4 uppercase">Running Pattern Analysis</p>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="rgba(220,20,60,0.15)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#B8B4C0', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
              <Radar name="Score" dataKey="score" stroke="#DC143C" fill="rgba(220,20,60,0.2)"
                strokeWidth={2} dot={{ fill: '#DC143C', r: 4 }} />
            </RadarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Body Alignment Diagram */}
        <GlassCard className="p-6">
          <p className="text-[10px] font-mono text-spider-scarlet tracking-widest mb-4 uppercase">Body Posture Alignment</p>
          <div className="relative h-64 flex items-center justify-center">
            <svg viewBox="0 0 180 260" fill="none" className="h-full">
              {/* Alignment center line */}
              <line x1="90" y1="0" x2="90" y2="260" stroke="rgba(79,195,247,0.2)" strokeWidth="0.8" strokeDasharray="4 6"/>
              {/* Body shape */}
              <ellipse cx="90" cy="24" rx="16" ry="18" fill="rgba(220,20,60,0.12)" stroke="rgba(220,20,60,0.5)" strokeWidth="1.5"/>
              <rect x="72" y="44" width="36" height="70" rx="6" fill="rgba(220,20,60,0.08)" stroke="rgba(220,20,60,0.4)" strokeWidth="1.2"/>
              <rect x="50" y="50" width="20" height="58" rx="5" fill="rgba(220,20,60,0.06)" stroke="rgba(220,20,60,0.25)" strokeWidth="1"/>
              <rect x="110" y="50" width="20" height="58" rx="5" fill="rgba(220,20,60,0.06)" stroke="rgba(220,20,60,0.25)" strokeWidth="1"/>
              <rect x="74" y="116" width="16" height="78" rx="5" fill="rgba(220,20,60,0.1)" stroke="rgba(220,20,60,0.4)" strokeWidth="1"/>
              <rect x="90" y="116" width="16" height="78" rx="5" fill="rgba(220,20,60,0.1)" stroke="rgba(220,20,60,0.4)" strokeWidth="1"/>
              {/* Keypoints */}
              {[[90,24],[72,52],[108,52],[90,116],[74,160],[98,160],[74,195],[98,195]].map(([x,y],i)=>(
                <motion.circle key={i} cx={x} cy={y} r="4"
                  fill="rgba(220,20,60,0.9)"
                  animate={{r:[4,5.5,4]}} transition={{duration:1.5,repeat:Infinity,delay:i*0.15}}/>
              ))}
              {/* Hip imbalance indicator */}
              <line x1="72" y1="116" x2="106" y2="118" stroke="rgba(255,180,0,0.6)" strokeWidth="1.5" strokeDasharray="3"/>
              <text x="50" y="115" fill="rgba(255,180,0,0.7)" fontSize="7" fontFamily="monospace">-2°</text>
            </svg>
            {/* Labels */}
            <div className="absolute right-2 top-1/4 text-[8px] font-mono text-spider-dim space-y-4">
              <p className="text-green-400">HEAD ✓</p>
              <p className="text-green-400">SHOULDER ✓</p>
              <p className="text-yellow-400">HIP !</p>
              <p className="text-green-400">KNEE ✓</p>
            </div>
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
        </div>
      </GlassCard>
    </div>
  );
}
