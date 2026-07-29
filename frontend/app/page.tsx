'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  Camera,
  ChevronRight,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
  Eye,
  Play,
  CircleCheckBig,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import SignatureHero from '@/components/SignatureHero';

const FEATURES = [
  {
    icon: Camera,
    title: 'Multi-camera motion capture',
    desc: 'Left, back, and right synchronized streams deliver a cinematic view of your movement.',
  },
  {
    icon: Brain,
    title: 'AI coaching insights',
    desc: 'Biomechanical recommendations and risk signals are generated in seconds for every session.',
  },
  {
    icon: Activity,
    title: 'Instant posture intelligence',
    desc: 'Detect and rank cadence, contact time, stride quality, and balance with real-time overlays.',
  },
  {
    icon: BarChart3,
    title: 'Executive-grade reporting',
    desc: 'Export polished reports for athletes, coaches, and clinicians without leaving the platform.',
  },
  {
    icon: Eye,
    title: 'MediaPipe overlays',
    desc: 'Every landmark is tracked with precision so form feedback feels tangible and actionable.',
  },
  {
    icon: TrendingUp,
    title: 'Performance progressions',
    desc: 'Monitor week-over-week change and surface the next best training intervention automatically.',
  },
];

const STATS = [
  { value: '33', label: 'Landmarks tracked', icon: Sparkles },
  { value: '3', label: 'Cameras live', icon: Camera },
  { value: '7+', label: 'Activities recognized', icon: Activity },
  { value: '30', label: 'FPS stream analysis', icon: Zap },
];

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-transparent">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
              <Activity className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.24em] text-white">NDURANCE</p>
              <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">AI MOTION LAB</p>
            </div>
          </Link>

          <div className="hidden items-center gap-7 text-sm text-slate-400 md:flex">
            {['Home', 'Dashboard', 'Upload', 'Analytics', 'Reports'].map((item) => (
              <a key={item} href={item === 'Home' ? '/' : '#'} className="transition hover:text-white">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button className="btn-ghost hidden sm:inline-flex">Notifications</button>
            <Link href="/login" className="btn-secondary hidden sm:inline-flex">
              Sign In
            </Link>
            <Link href="/signup" className="btn-primary">
              Start Analysis
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      <SignatureHero />

      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="glass-card p-6"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <stat.icon className="h-5 w-5 text-cyan-300" />
              </div>
              <div className="text-3xl font-semibold text-white">{stat.value}</div>
              <div className="mt-2 text-sm text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card overflow-hidden p-8"
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" /> AI workflow
            </div>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              A premium analysis loop for athletes, coaches, and clinicians.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-400">
              From upload to insight, every touchpoint feels deliberate — polished, clear, and built to make motion intelligence easy to trust.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                'Zero-friction video upload',
                'Human-readable AI summaries',
                'Risk and recovery signals',
                'Downloadable reports',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                  <CircleCheckBig className="h-4 w-4 text-cyan-300" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="glass-card p-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Analysis pipeline</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Upload • Analyze • Act</h3>
              </div>
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-300">
                Live
              </div>
            </div>
            <div className="mt-8 space-y-4">
              {[
                ['Video intake', 'MP4 or MOV', 'text-cyan-300'],
                ['Pose estimation', 'MediaPipe', 'text-blue-300'],
                ['Biomechanics engine', 'AI scoring', 'text-emerald-300'],
              ].map(([title, detail, color]) => (
                <div key={title} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
                  <div>
                    <p className="font-medium text-white">{title}</p>
                    <p className="mt-1 text-sm text-slate-400">{detail}</p>
                  </div>
                  <div className={`h-2.5 w-2.5 rounded-full ${color} bg-current`} />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8 xl:px-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Capabilities</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Designed for premium human motion intelligence.</h2>
          </div>
          <Link href="/signup" className="btn-primary hidden sm:inline-flex">
            Explore platform
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="glass-card p-7"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                <feature.icon className="h-5 w-5 text-cyan-300" />
              </div>
              <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 pb-20 pt-6 sm:px-6 lg:px-8 xl:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card overflow-hidden p-8 sm:p-10"
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">Launch your first analysis</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Make motion data feel as elegant as the experience itself.
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-400">
                Run your first upload, inspect the insights, and upgrade your coaching workflow in minutes.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary">
                Create account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="btn-secondary">
                <Play className="h-4 w-4" />
                Sign in
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-slate-500 sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <Shield className="h-4 w-4 text-cyan-300" />
            Privacy-first motion intelligence.
          </div>
          <div>FastAPI • Next.js • MediaPipe • Gemini AI</div>
        </div>
      </footer>
    </div>
  );
}
