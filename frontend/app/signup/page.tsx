'use client';
// app/signup/page.tsx — AI Lab Registration
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SpiderWebBackground from '@/components/ui/SpiderWebBackground';
import SpiderButton from '@/components/ui/SpiderButton';
import { authApi, getApiErrorMessage } from '@/lib/api';

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Expert', age: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [ageError, setAgeError] = useState('');

  const handleNext = () => { if (step < 2) setStep(2); };
  const validateAge = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return false;

    const numeric = Number(trimmed);
    return Number.isInteger(numeric) && numeric >= 5 && numeric <= 100;
  };

  const handleAgeBlur = () => {
    if (!validateAge(form.age)) {
      setAgeError('Age must be between 5 and 100.');
    } else {
      setAgeError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAge(form.age)) {
      setAgeError('Age must be between 5 and 100.');
      setStep(1);
      return;
    }

    setAgeError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await authApi.signup({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setDevOtp(response.data.dev_otp || '');
      setMessage('Account created. Enter the development OTP to verify your email.');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    try {
      await authApi.verifyOtp(form.email, otp);
      window.location.href = '/login';
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setForm(f => ({ ...f, age: raw }));
  };

  const levels = ['Beginner', 'Intermediate', 'Expert'] as const;

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
                  <label className="block text-[10px] font-mono text-spider-scarlet tracking-widest mb-2 uppercase">Level</label>
                  <div className="flex flex-row gap-2">
                    {levels.map((level) => {
                      const selected = form.level === level;
                      return (
                        <motion.button
                          key={level}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setForm(f => ({ ...f, level }))}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          animate={{ scale: selected ? 1.02 : 1 }}
                          transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                          className={`flex-1 min-w-0 rounded-xl border px-3 py-3 text-[10px] font-mono font-semibold uppercase tracking-[0.2em] transition-all duration-300 ${selected
                            ? 'border-spider-scarlet bg-gradient-to-r from-spider-scarlet via-spider-crimson to-spider-scarlet text-white shadow-[0_0_20px_rgba(220,20,60,0.35)]'
                            : 'border-spider-scarlet/40 bg-spider-black/70 text-spider-dim shadow-[0_0_0_1px_rgba(220,20,60,0.15),0_0_18px_rgba(220,20,60,0.12)] hover:border-spider-scarlet hover:text-spider-white hover:shadow-[0_0_18px_rgba(220,20,60,0.24)]'}`}
                        >
                          {level}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-spider-scarlet tracking-widest mb-2 uppercase">Age</label>
                  <input
                    id="signup-age"
                    type="number"
                    inputMode="numeric"
                    min={5}
                    max={100}
                    value={form.age}
                    onChange={handleAgeChange}
                    onBlur={handleAgeBlur}
                    placeholder="Enter your age"
                    className="spider-input w-full px-4 py-3.5 rounded-xl font-mono text-sm"
                    required
                  />
                  {ageError && <p className="mt-2 text-[10px] font-mono text-spider-scarlet">{ageError}</p>}
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
                {message && <p className="text-xs font-mono text-green-400">{message}</p>}
                {devOtp && (
                  <div className="space-y-3 border border-spider-scarlet/20 rounded-xl p-4">
                    <p className="text-xs font-mono text-spider-dim">Development OTP: <strong className="text-spider-white">{devOtp}</strong></p>
                    <input
                      id="signup-otp"
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                      className="spider-input w-full px-4 py-3 rounded-xl font-mono text-sm"
                      inputMode="numeric"
                      maxLength={6}
                    />
                    <SpiderButton type="button" variant="electric" size="md" fullWidth loading={loading} onClick={handleVerify}>
                      Verify Email
                    </SpiderButton>
                  </div>
                )}
                {error && <p className="text-xs font-mono text-spider-scarlet">{error}</p>}
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
