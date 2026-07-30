'use client';
// app/page.tsx — Spider Track AI Landing Page
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import SpiderWebBackground from '@/components/ui/SpiderWebBackground';
import SpiderButton from '@/components/ui/SpiderButton';
import GlassCard from '@/components/ui/GlassCard';

const features = [
  {
    icon: '◉',
    title: 'Triple Camera Capture',
    desc: 'Synchronized LEFT, BACK, and RIGHT cameras deliver a 360° biomechanical view of every stride.',
    color: 'from-spider-scarlet/20 to-transparent',
  },
  {
    icon: '◈',
    title: 'AI Posture Analysis',
    desc: 'Real-time skeletal mapping tracks 33 body keypoints — head, shoulders, hips, knees, and ankles.',
    color: 'from-spider-electric/10 to-transparent',
  },
  {
    icon: '◇',
    title: 'Performance Reports',
    desc: 'Instant downloadable reports with radar charts, alignment scores, and AI-driven coaching insights.',
    color: 'from-spider-scarlet/15 to-transparent',
  },
];

const stats = [
  { value: '33', label: 'Body Keypoints' },
  { value: '3×', label: 'Camera Angles' },
  { value: '<50ms', label: 'AI Latency' },
  { value: '99.2%', label: 'Detection Rate' },
];

const steps = [
  { num: '01', title: 'Mount Cameras', desc: 'Position three USB cameras at Left, Back, and Right positions around the treadmill.' },
  { num: '02', title: 'Start Session', desc: 'Enter athlete profile, launch Spider Track AI, and begin the synchronized capture.' },
  { num: '03', title: 'AI Analysis', desc: 'Our neural network maps posture in real-time, tracking every joint and movement pattern.' },
  { num: '04', title: 'Get Report', desc: 'Download a premium PDF report with scores, insights, and corrective recommendations.' },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, -120]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: 0.15 }
    );
    document.querySelectorAll('.reveal, .reveal-left').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen bg-spider-void overflow-x-hidden">
      <SpiderWebBackground intensity="normal" />

      {/* ── Navbar ─────────────────────────────── */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 backdrop-blur-xl border-b border-spider-scarlet/10 bg-spider-void/60"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-spider-scarlet to-spider-crimson flex items-center justify-center shadow-spider-sm">
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
              <path d="M10 2L10 18M2 10L18 10M4 4L16 16M16 4L4 16" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="10" cy="10" r="2.5" fill="white"/>
            </svg>
          </div>
          <span className="font-display text-sm font-bold tracking-widest text-spider-white hidden sm:block">SPIDER TRACK <span className="text-spider-scarlet">AI</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <span className="font-display text-xs tracking-widest text-spider-silver hover:text-spider-white transition-colors uppercase cursor-pointer hidden md:block">
              Sign In
            </span>
          </Link>
          <Link href="/signup">
            <SpiderButton size="sm" variant="primary">Get Started</SpiderButton>
          </Link>
        </div>
      </motion.nav>

      {/* ── Hero ───────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-5xl mx-auto">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-spider-scarlet/30 bg-spider-scarlet/8 text-spider-scarlet text-xs font-mono tracking-widest"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-spider-scarlet animate-pulse" />
            AI-POWERED · TRIPLE CAMERA · REAL-TIME ANALYSIS
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none mb-6"
          >
            <span className="text-gradient-white">TRACK EVERY</span>
            <br />
            <span className="text-gradient-crimson">STRIDE.</span>
            <br />
            <span className="text-spider-white/40 text-3xl md:text-5xl font-light tracking-widest">MASTER YOUR RUN.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7 }}
            className="text-spider-silver/70 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Spider Track AI uses three synchronized cameras and deep neural networks
            to analyze every aspect of your treadmill run — posture, symmetry, cadence, and power.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link href="/signup">
              <SpiderButton size="lg" variant="primary">Begin Analysis</SpiderButton>
            </Link>
            <Link href="/login">
              <SpiderButton size="lg" variant="secondary">View Demo</SpiderButton>
            </Link>
          </motion.div>

          {/* Athlete silhouette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative mt-16 mx-auto w-64 h-80 md:w-80 md:h-96"
          >
            <svg viewBox="0 0 200 280" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              {/* Energy aura */}
              <ellipse cx="100" cy="280" rx="70" ry="15" fill="rgba(220,20,60,0.15)" />
              {/* Body silhouette */}
              <ellipse cx="100" cy="32" rx="16" ry="18" fill="rgba(220,20,60,0.15)" stroke="rgba(220,20,60,0.5)" strokeWidth="1.5"/>
              <rect x="82" y="52" width="36" height="70" rx="6" fill="rgba(220,20,60,0.1)" stroke="rgba(220,20,60,0.4)" strokeWidth="1.2"/>
              <rect x="58" y="58" width="22" height="60" rx="5" fill="rgba(220,20,60,0.08)" stroke="rgba(220,20,60,0.3)" strokeWidth="1"/>
              <rect x="120" y="58" width="22" height="60" rx="5" fill="rgba(220,20,60,0.08)" stroke="rgba(220,20,60,0.3)" strokeWidth="1"/>
              <rect x="84" y="124" width="14" height="80" rx="5" fill="rgba(220,20,60,0.1)" stroke="rgba(220,20,60,0.4)" strokeWidth="1"/>
              <rect x="102" y="124" width="14" height="80" rx="5" fill="rgba(220,20,60,0.1)" stroke="rgba(220,20,60,0.4)" strokeWidth="1"/>
              {/* Energy trail lines */}
              {[-30, -15, 0, 15, 30].map((offset, i) => (
                <motion.line
                  key={i}
                  x1={100 + offset} y1="0" x2={100 + offset * 2} y2="280"
                  stroke={`rgba(220,20,60,${0.05 + i * 0.03})`}
                  strokeWidth="0.5"
                  strokeDasharray="4 8"
                  animate={{ strokeDashoffset: [0, -60] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: i * 0.3 }}
                />
              ))}
              {/* Keypoints */}
              {[
                [100, 32], [100, 65], [82, 65], [118, 65],
                [100, 124], [84, 170], [102, 170], [84, 205], [102, 205]
              ].map(([x, y], i) => (
                <motion.circle
                  key={i} cx={x} cy={y} r="3.5"
                  fill="rgba(220,20,60,0.9)"
                  animate={{ r: [3.5, 5, 3.5], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, delay: i * 0.15, repeat: Infinity }}
                />
              ))}
              {/* Skeleton lines */}
              <line x1="100" y1="50" x2="100" y2="122" stroke="rgba(220,20,60,0.4)" strokeWidth="1.2"/>
              <line x1="100" y1="65" x2="82" y2="65" stroke="rgba(220,20,60,0.4)" strokeWidth="1.2"/>
              <line x1="100" y1="65" x2="118" y2="65" stroke="rgba(220,20,60,0.4)" strokeWidth="1.2"/>
              <line x1="100" y1="124" x2="84" y2="170" stroke="rgba(220,20,60,0.4)" strokeWidth="1.2"/>
              <line x1="100" y1="124" x2="102" y2="170" stroke="rgba(220,20,60,0.4)" strokeWidth="1.2"/>
              <line x1="84" y1="170" x2="84" y2="205" stroke="rgba(220,20,60,0.35)" strokeWidth="1"/>
              <line x1="102" y1="170" x2="102" y2="205" stroke="rgba(220,20,60,0.35)" strokeWidth="1"/>
            </svg>
            {/* Orbit rings */}
            {[80, 110, 140].map((r, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border border-spider-scarlet/20"
                style={{ inset: `calc(50% - ${r}px)`, width: r * 2, height: r * 2, top: `calc(50% - ${r}px)`, left: `calc(50% - ${r}px)` }}
                animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                transition={{ duration: 8 + i * 4, repeat: Infinity, ease: 'linear' }}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-spider-dim"
        >
          <span className="text-[10px] font-mono tracking-widest">SCROLL</span>
          <div className="w-px h-8 bg-gradient-to-b from-spider-scarlet/60 to-transparent" />
        </motion.div>
      </section>

      {/* ── Stats ──────────────────────────────── */}
      <section className="relative z-10 py-16 border-y border-spider-scarlet/10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="font-display text-4xl md:text-5xl font-black text-gradient-crimson">{s.value}</p>
              <p className="text-spider-silver/60 text-xs font-mono tracking-widest mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────── */}
      <section className="relative z-10 py-24 px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-xs font-mono text-spider-scarlet tracking-[0.3em] mb-3">CORE CAPABILITIES</p>
          <h2 className="font-display text-4xl md:text-5xl font-black text-gradient-white">
            ENGINEERED FOR<br /><span className="text-gradient-crimson">ELITE PERFORMANCE</span>
          </h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <GlassCard key={f.title} delay={i * 0.15} glow className="p-8">
              <div className={`absolute inset-0 bg-gradient-to-br ${f.color} rounded-2xl`} />
              <span className="text-4xl text-spider-scarlet mb-4 block">{f.icon}</span>
              <h3 className="font-display text-sm font-bold tracking-widest text-spider-white mb-3 uppercase">{f.title}</h3>
              <p className="text-spider-silver/70 text-sm leading-relaxed">{f.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ── How It Works ───────────────────────── */}
      <section className="relative z-10 py-24 px-6 bg-spider-black/40">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs font-mono text-spider-scarlet tracking-[0.3em] mb-3">WORKFLOW</p>
            <h2 className="font-display text-4xl md:text-5xl font-black text-gradient-white">
              FOUR STEPS TO<br /><span className="text-gradient-crimson">PEAK INSIGHT</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="relative"
              >
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[calc(100%_-_12px)] w-6 h-px bg-gradient-to-r from-spider-scarlet/50 to-spider-scarlet/20 z-10" />
                )}
                <div className="glass-card rounded-2xl p-6">
                  <span className="font-display text-3xl font-black text-gradient-crimson block mb-3">{step.num}</span>
                  <h4 className="font-display text-xs font-bold tracking-widest text-spider-white mb-2 uppercase">{step.title}</h4>
                  <p className="text-spider-silver/60 text-xs leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────── */}
      <section className="relative z-10 py-32 px-6 text-center">
        <div className="absolute inset-0 bg-crimson-glow opacity-30 pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-2xl mx-auto"
        >
          <p className="text-xs font-mono text-spider-scarlet tracking-[0.3em] mb-4">READY TO START?</p>
          <h2 className="font-display text-5xl md:text-6xl font-black text-gradient-white mb-6">
            YOUR BEST RUN<br /><span className="text-gradient-crimson">STARTS NOW.</span>
          </h2>
          <p className="text-spider-silver/60 mb-10 leading-relaxed">
            Join elite athletes and coaches using Spider Track AI to unlock the science behind every step.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup"><SpiderButton size="xl" variant="primary">Launch Platform</SpiderButton></Link>
            <Link href="/login"><SpiderButton size="xl" variant="ghost">Sign In</SpiderButton></Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ─────────────────────────────── */}
      <footer className="relative z-10 border-t border-spider-scarlet/10 py-8 px-6 text-center">
        <p className="font-display text-xs tracking-widest text-spider-dim">
          © 2026 <span className="text-spider-scarlet">SPIDER TRACK AI</span> · Elite Running Performance Platform
        </p>
      </footer>
    </div>
  );
}
