'use client';
// components/charts/LiveCharts.tsx — Real-time joint angle and gait charts using Recharts

import { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { JointAngles, GaitMetrics } from '@/types';

interface DataPoint {
  t: number;
  leftKnee?: number;
  rightKnee?: number;
  spine?: number;
  neck?: number;
  cadence?: number;
}

const MAX_POINTS = 60; // 2 seconds of history at 30fps

interface Props {
  jointAngles: JointAngles;
  gaitMetrics: GaitMetrics | null;
}

export function LiveCharts({ jointAngles, gaitMetrics }: Props) {
  const [data, setData] = useState<DataPoint[]>([]);
  const frameRef = useRef(0);

  useEffect(() => {
    frameRef.current++;
    setData((prev) => {
      const newPoint: DataPoint = {
        t: frameRef.current,
        leftKnee: jointAngles.left_knee,
        rightKnee: jointAngles.right_knee,
        spine: jointAngles.spine_inclination !== undefined
          ? Math.abs(jointAngles.spine_inclination)
          : undefined,
        neck: jointAngles.neck_angle !== undefined
          ? Math.abs(jointAngles.neck_angle)
          : undefined,
        cadence: gaitMetrics?.cadence,
      };
      const next = [...prev, newPoint];
      return next.length > MAX_POINTS ? next.slice(-MAX_POINTS) : next;
    });
  }, [jointAngles, gaitMetrics]);

  const customTooltipStyle = {
    backgroundColor: '#1e293b',
    border: '1px solid rgba(0,229,255,0.2)',
    borderRadius: '8px',
    fontSize: '11px',
    color: '#94a3b8',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Knee Flexion Chart */}
      <div className="glass-card p-4">
        <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">Knee Angles (°)</p>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={data} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="t" hide />
            <YAxis domain={[80, 200]} tick={{ fontSize: 10, fill: '#475569' }} />
            <Tooltip contentStyle={customTooltipStyle} />
            <Line type="monotone" dataKey="leftKnee" stroke="#00E5FF" dot={false}
              strokeWidth={1.5} name="L. Knee" isAnimationActive={false} />
            <Line type="monotone" dataKey="rightKnee" stroke="#7c3aed" dot={false}
              strokeWidth={1.5} name="R. Knee" isAnimationActive={false} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', color: '#64748b' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Spine & Neck Chart */}
      <div className="glass-card p-4">
        <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">Posture (°)</p>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={data} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="t" hide />
            <YAxis domain={[0, 45]} tick={{ fontSize: 10, fill: '#475569' }} />
            <Tooltip contentStyle={customTooltipStyle} />
            <Line type="monotone" dataKey="spine" stroke="#22c55e" dot={false}
              strokeWidth={1.5} name="Spine" isAnimationActive={false} />
            <Line type="monotone" dataKey="neck" stroke="#f59e0b" dot={false}
              strokeWidth={1.5} name="Neck" isAnimationActive={false} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', color: '#64748b' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Cadence chart */}
      {gaitMetrics && gaitMetrics.cadence > 0 && (
        <div className="glass-card p-4 md:col-span-2">
          <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">Cadence (SPM)</p>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={data.filter((d) => d.cadence)} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="t" hide />
              <YAxis domain={[120, 220]} tick={{ fontSize: 10, fill: '#475569' }} />
              <Tooltip contentStyle={customTooltipStyle} />
              {/* Optimal range reference */}
              <Line type="monotone" dataKey="cadence" stroke="#00E5FF"
                dot={false} strokeWidth={2} name="Cadence" isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
          {/* Optimal zone indicator */}
          <div className="flex items-center gap-2 mt-1">
            <div className="w-3 h-0.5 bg-emerald-400/40" />
            <span className="text-xs text-slate-700">Optimal: 170-185 SPM</span>
          </div>
        </div>
      )}
    </div>
  );
}
