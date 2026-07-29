"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Activity, ArrowRight, Camera, Play, Sparkles, Zap } from 'lucide-react';

const ACTIVITIES = ['Standing', 'Walking', 'Running', 'Squat', 'Push-up', 'Lunge', 'Jump'];

export default function SignatureHero() {
  const [activeActivity, setActiveActivity] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveActivity((p) => (p + 1) % ACTIVITIES.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative overflow-hidden bg-transparent py-20 sm:py-24 lg:py-28">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-cyan-400/15 blur-[120px]" />
      <div className="absolute bottom-12 right-0 h-64 w-64 rounded-full bg-blue-500/10 blur-[100px]" />

      <div className="relative z-10 mx-auto flex max-w-[1400px] flex-col items-center px-4 text-center sm:px-6 lg:px-8 xl:px-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200"
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI-Powered Human Motion Intelligence
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="max-w-5xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-7xl"
        >
          Upload a running video and receive{' '}
          <span className="text-gradient-brand">professional gait analysis</span> in minutes.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="mt-6 max-w-2xl text-lg leading-8 text-slate-400 sm:text-xl"
        >
          A premium AI workspace for motion capture, biomechanical scoring, and training insights powered by computer vision, MediaPipe, and Gemini.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link href="/signup" className="btn-primary">
            <Play className="h-4 w-4" />
            Start Analysis
          </Link>
          <Link href="/login" className="btn-secondary">
            Watch Demo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.32 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-400"
        >
          <span>Now detecting</span>
          <div className="relative h-5 w-24 overflow-hidden">
            {ACTIVITIES.map((activity, index) => (
              <motion.span
                key={activity}
                initial={{ y: 28, opacity: 0 }}
                animate={{ y: index === activeActivity ? 0 : index < activeActivity ? -28 : 28, opacity: index === activeActivity ? 1 : 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 flex items-center justify-center font-semibold text-cyan-300"
              >
                {activity}
              </motion.span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-14 grid w-full max-w-5xl gap-4 lg:grid-cols-3"
        >
          {['Left cam', 'Back cam', 'Right cam'].map((label, index) => (
            <div key={label} className="camera-panel h-56 overflow-hidden">
              <div className="absolute left-4 top-4 z-10 rounded-full border border-cyan-400/20 bg-slate-950/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300">
                {label}
              </div>
              <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.14),transparent_70%)]">
                <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 p-8 text-cyan-300">
                  {index === 0 ? <Camera className="h-10 w-10" /> : index === 1 ? <Activity className="h-10 w-10" /> : <Zap className="h-10 w-10" />}
                </div>
              </div>
              <div className="absolute bottom-4 right-4 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                30 FPS
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
