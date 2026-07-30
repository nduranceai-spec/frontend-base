'use client';
// app/login/page.tsx — AI Lab Login
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SpiderWebBackground from '@/components/ui/SpiderWebBackground';
import SpiderButton from '@/components/ui/SpiderButton';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Simulate auth
    await new Promise(r => setTimeout(r, 1800));
    if (email && password) {
      window.location.href = '/dashboard';
    } else {
      setError('Invalid credentials. Access denied.');
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-spider-void overflow-hidden">
      <SpiderWebBackground intensity="strong" />

      {/* Ambient glow */}
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none z-[1]" />

      {/* Corner web decorations */}
      {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
        <svg key={i} className={`absolute ${pos} w-48 h-48 pointer-events-none z-[2] opacity-30`} fill="none">
          {[30, 60, 90, 120].map(r => (
            <circle key={r} cx={i % 2 === 0 ? 0 : 192} cy={i < 2 ? 0 : 192} r={r}
              stroke="rgba(220,20,60,0.4)" strokeWidth="0.5" />
          ))}
          {[0, 30, 60, 90, 120, 150].map((a, j) => {
            const rad = (a * Math.PI) / 180;
            const cx = i % 2 === 0 ? 0 : 192;
            const cy = i < 2 ? 0 : 192;
            return (
              <line key={j} x1={cx} y1={cy}
                x2={cx + Math.cos(rad) * 140} y2={cy + Math.sin(rad) * 140}
                stroke="rgba(220,20,60,0.3)" strokeWidth="0.4" />
            );
          })}
        </svg>
      ))}

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md mx-6"
      >
        {/* Scan line effect */}
        <div className="scan-overlay rounded-2xl" />

        <div className="glass-card rounded-2xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-spider-scarlet to-spider-crimson shadow-spider flex items-center justify-center">
              <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
                <path d="M16 3L16 29M3 16L29 16M7 7L25 25M25 7L7 25" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="16" cy="16" r="4" fill="white"/>
              </svg>
            </div>
            <h1 className="font-display text-2xl font-black tracking-widest text-spider-white mb-1">ACCESS PORTAL</h1>
            <p className="text-spider-dim text-xs font-mono tracking-widest">SPIDER TRACK AI · SECURE LAB ENTRY</p>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2 px-4 py-2 mb-6 rounded-xl bg-spider-void/60 border border-spider-scarlet/15">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-green-400"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-[10px] font-mono text-spider-dim tracking-widest">AI SYSTEM ONLINE · SECURE CONNECTION</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-mono text-spider-scarlet tracking-widest mb-2 uppercase">
                Athlete ID / Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="athlete@spidertrack.ai"
                className="spider-input w-full px-4 py-3.5 rounded-xl font-mono text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-spider-scarlet tracking-widest mb-2 uppercase">
                Access Code / Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="spider-input w-full px-4 py-3.5 rounded-xl font-mono text-sm"
                required
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs font-mono text-spider-scarlet bg-spider-scarlet/10 border border-spider-scarlet/20 rounded-lg px-3 py-2"
              >
                ⚠ {error}
              </motion.p>
            )}

            <SpiderButton
              id="login-submit"
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              {loading ? 'Authenticating…' : 'Enter Lab'}
            </SpiderButton>
          </form>

          {/* Links */}
          <div className="mt-6 text-center">
            <p className="text-spider-dim text-xs font-mono">
              No access credential?{' '}
              <Link href="/signup" className="text-spider-scarlet hover:text-spider-glow transition-colors">
                Request Access
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
