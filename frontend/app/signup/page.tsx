'use client';
// app/signup/page.tsx — AI Lab Registration
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SpiderWebBackground from '@/components/ui/SpiderWebBackground';
import SpiderButton from '@/components/ui/SpiderButton';

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', role: 'Athlete', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleNext = () => { if (step < 2) setStep(2); };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    window.location.href = '/dashboard';
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-spider-void overflow-hidden py-10">
      <SpiderWebBackground intensity="normal" />
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none z-[1]" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md mx-6"
      >
        <div className="glass-card rounded-2xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-spider-scarlet to-spider-crimson shadow-spider flex items-center justify-center">
              <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
                <path d="M16 3L16 29M3 16L29 16M7 7L25 25M25 7L7 25" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="16" cy="16" r="4" fill="white"/>
              </svg>
            </div>
            <h1 className="font-display text-2xl font-black tracking-widest text-spider-white mb-1">JOIN THE LAB</h1>
            <p className="text-spider-dim text-xs font-mono tracking-widest">SPIDER TRACK AI · CREATE ACCESS</p>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map(n => (
              <div key={n} className="flex-1 flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-display font-bold transition-all duration-300
                  ${step >= n ? 'bg-spider-scarlet text-white shadow-spider-sm' : 'bg-spider-graphite text-spider-dim border border-spider-scarlet/20'}`}>
                  {n}
                </div>
                <span className={`text-[10px] font-mono tracking-widest ${step >= n ? 'text-spider-scarlet' : 'text-spider-dim'}`}>
                  {n === 1 ? 'IDENTITY' : 'SECURITY'}
                </span>
                {n < 2 && <div className="flex-1 h-px bg-spider-scarlet/20" />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-mono text-spider-scarlet tracking-widest mb-2 uppercase">Full Name</label>
                  <input id="signup-name" type="text" value={form.name} onChange={set('name')}
                    placeholder="Athlete name" className="spider-input w-full px-4 py-3.5 rounded-xl font-mono text-sm" required />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-spider-scarlet tracking-widest mb-2 uppercase">Email</label>
                  <input id="signup-email" type="email" value={form.email} onChange={set('email')}
                    placeholder="athlete@spidertrack.ai" className="spider-input w-full px-4 py-3.5 rounded-xl font-mono text-sm" required />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-spider-scarlet tracking-widest mb-2 uppercase">Role</label>
                  <select id="signup-role" value={form.role} onChange={set('role')}
                    className="spider-input w-full px-4 py-3.5 rounded-xl font-mono text-sm bg-spider-black/70">
                    <option>Athlete</option>
                    <option>Coach</option>
                    <option>Lab Technician</option>
                  </select>
                </div>
                <SpiderButton id="signup-next" type="button" variant="primary" size="lg" fullWidth onClick={handleNext}>
                  Next Step →
                </SpiderButton>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-mono text-spider-scarlet tracking-widest mb-2 uppercase">Password</label>
                  <input id="signup-password" type="password" value={form.password} onChange={set('password')}
                    placeholder="Create access code" className="spider-input w-full px-4 py-3.5 rounded-xl font-mono text-sm" required />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-spider-scarlet tracking-widest mb-2 uppercase">Confirm Password</label>
                  <input id="signup-confirm" type="password" value={form.confirm} onChange={set('confirm')}
                    placeholder="Confirm access code" className="spider-input w-full px-4 py-3.5 rounded-xl font-mono text-sm" required />
                </div>
                <div className="flex gap-3">
                  <SpiderButton type="button" variant="ghost" size="md" onClick={() => setStep(1)}>← Back</SpiderButton>
                  <SpiderButton id="signup-submit" type="submit" variant="primary" size="md" fullWidth loading={loading}>
                    {loading ? 'Creating Access…' : 'Activate Access'}
                  </SpiderButton>
                </div>
              </motion.div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-spider-dim text-xs font-mono">
              Already have access?{' '}
              <Link href="/login" className="text-spider-scarlet hover:text-spider-glow transition-colors">Sign In</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
