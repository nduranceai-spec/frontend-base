'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, AlertCircle, CheckCircle, Eye, EyeOff, KeyRound, Loader2, Lock, Mail, User } from 'lucide-react';
import { authApi, getApiErrorMessage } from '@/lib/api';
import { saveAuth } from '@/lib/auth';
import { useAuthStore } from '@/lib/store';
import { User as UserType } from '@/types';

type Step = 'form' | 'otp';

export default function SignupPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [step, setStep] = useState<Step>('form');
  const [form, setForm] = useState({
    name: '', email: '', password: '', height_cm: '', weight_kg: '', experience_level: 'beginner',
  });
  const [otp, setOtp] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await authApi.signup({
        name: form.name,
        email: form.email,
        password: form.password,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : undefined,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : undefined,
        experience_level: form.experience_level,
      });
      if (res.data.dev_otp) setDevOtp(res.data.dev_otp);
      setStep('otp');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Enter the 6-digit OTP sent to your email.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await authApi.verifyOtp(form.email, otp);
      const loginRes = await authApi.login(form.email, form.password);
      const { token, user } = loginRes.data;
      saveAuth(token, user as UserType);
      setAuth(user as UserType, token);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute left-1/2 top-1/4 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[120px]" />

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
              <Activity className="h-5 w-5 text-cyan-300" />
            </div>
            <span className="font-semibold tracking-[0.24em] text-white">NDURANCE AI</span>
          </Link>
          <h1 className="mt-6 text-3xl font-semibold text-white">{step === 'form' ? 'Create your account' : 'Verify your email'}</h1>
          <p className="mt-2 text-sm text-slate-400">{step === 'form' ? 'Start your first motion analysis in minutes.' : `Enter the 6-digit code sent to ${form.email}`}</p>
        </div>

        <div className="glass-card p-6 sm:p-8">
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-5 flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {devOtp && step === 'otp' && (
            <div className="mb-5 flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-300">
              <CheckCircle className="h-4 w-4" />
              <span>Dev mode OTP: <strong className="font-mono">{devOtp}</strong></span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 'form' ? (
              <motion.form key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Full name</label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input id="signup-name" type="text" value={form.name} onChange={f('name')} placeholder="John Doe" className="input-field pl-10" autoComplete="name" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Email</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input id="signup-email" type="email" value={form.email} onChange={f('email')} placeholder="you@example.com" className="input-field pl-10" autoComplete="email" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input id="signup-password" type={showPw ? 'text' : 'password'} value={form.password} onChange={f('password')} placeholder="Min 8 characters" className="input-field pl-10 pr-10" autoComplete="new-password" />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Height (cm)</label>
                    <input id="signup-height" type="number" value={form.height_cm} onChange={f('height_cm')} placeholder="175" className="input-field" min="100" max="250" />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Weight (kg)</label>
                    <input id="signup-weight" type="number" value={form.weight_kg} onChange={f('weight_kg')} placeholder="70" className="input-field" min="30" max="300" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Experience level</label>
                  <select id="signup-experience" value={form.experience_level} onChange={f('experience_level')} className="input-field">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="elite">Elite</option>
                  </select>
                </div>

                <button id="signup-submit" type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</> : 'Create Account'}
                </button>
              </motion.form>
            ) : (
              <motion.form key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                    <KeyRound className="h-8 w-8 text-cyan-300" />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">6-digit OTP</label>
                  <input id="signup-otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} className="input-field text-center text-2xl font-mono tracking-[0.4em]" />
                </div>
                <button id="otp-verify" type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</> : 'Verify & Continue'}
                </button>
                <button type="button" onClick={() => authApi.resendOtp(form.email)} className="btn-secondary w-full py-3">
                  Resend OTP
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-cyan-300 hover:underline">Sign in</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
