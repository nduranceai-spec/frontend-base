'use client';
// app/dashboard/profile/page.tsx — NDURANCE AI User Profile

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Ruler, Weight, Dumbbell, Trophy,
  Save, Loader2, CheckCircle, AlertCircle, Activity,
  Shield, Edit3
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { ExperienceLevel } from '@/types';
import { authApi, getApiErrorMessage } from '@/lib/api';
import { saveAuth } from '@/lib/auth';

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string; desc: string }[] = [
  { value: 'beginner', label: 'Beginner', desc: 'Just starting out' },
  { value: 'intermediate', label: 'Intermediate', desc: '1–3 years experience' },
  { value: 'advanced', label: 'Advanced', desc: '3–7 years experience' },
  { value: 'elite', label: 'Elite', desc: 'Professional / competitive athlete' },
];

const SPORTS = [
  'Running', 'Cycling', 'Swimming', 'Weightlifting', 'CrossFit',
  'Basketball', 'Soccer', 'Tennis', 'Golf', 'Yoga', 'Pilates',
  'Martial Arts', 'Football', 'Baseball', 'Volleyball', 'Other',
];

const STAT_CARDS = (user: any) => [
  {
    label: 'Experience Level',
    value: user?.experience_level || 'Beginner',
    icon: Trophy,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
  },
  {
    label: 'Account Role',
    value: user?.role || 'Athlete',
    icon: Shield,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/20',
  },
  {
    label: 'Primary Sport',
    value: user?.sport || 'Not Set',
    icon: Dumbbell,
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/20',
  },
  {
    label: 'Email Status',
    value: user?.is_verified ? 'Verified' : 'Unverified',
    icon: Mail,
    color: user?.is_verified ? 'text-emerald-400' : 'text-amber-400',
    bg: user?.is_verified ? 'bg-emerald-400/10' : 'bg-amber-400/10',
    border: user?.is_verified ? 'border-emerald-400/20' : 'border-amber-400/20',
  },
];

export default function ProfilePage() {
  const { user, token, updateUser } = useAuthStore();

  const [form, setForm] = useState({
    name: user?.name || '',
    height_cm: user?.height_cm || '',
    weight_kg: user?.weight_kg || '',
    experience_level: user?.experience_level || 'beginner',
    sport: user?.sport || '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        height_cm: user.height_cm || '',
        weight_kg: user.weight_kg || '',
        experience_level: user.experience_level || 'beginner',
        sport: user.sport || '',
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      await authApi.updateProfile({
        name: form.name,
        height_cm: form.height_cm ? parseFloat(String(form.height_cm)) : undefined,
        weight_kg: form.weight_kg ? parseFloat(String(form.weight_kg)) : undefined,
        experience_level: form.experience_level,
        sport: form.sport || undefined,
      });

      updateUser({
        name: form.name,
        height_cm: form.height_cm,
        weight_kg: form.weight_kg,
        experience_level: form.experience_level,
        sport: form.sport,
      });

      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="p-8 space-y-8 max-w-4xl">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your athlete profile and preferences</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="btn-ghost text-sm flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </motion.div>

      {/* ── Avatar + Name Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card p-6 flex items-center gap-6"
      >
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-neon/30 to-purple-brand/30 border border-cyan-neon/30 flex items-center justify-center text-2xl font-black text-white">
            {initials}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-surface-950 flex items-center justify-center">
            <Activity className="w-2.5 h-2.5 text-surface-900" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">{user?.name}</h2>
          <p className="text-slate-500 text-sm">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="badge-optimal capitalize">{user?.experience_level || 'beginner'}</span>
            {user?.sport && (
              <span className="badge-neutral capitalize">{user.sport}</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS(user).map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className={`glass-card p-4 border ${stat.border}`}
          >
            <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div className={`text-sm font-semibold ${stat.color} capitalize mb-0.5`}>
              {stat.value}
            </div>
            <div className="text-xs text-slate-600">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Edit Form ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <User className="w-4 h-4 text-cyan-neon" />
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
            {editing ? 'Edit Profile Details' : 'Profile Details'}
          </h3>
        </div>

        {/* Notifications */}
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm mb-5"
          >
            <CheckCircle className="w-4 h-4" />
            Profile updated successfully!
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm mb-5"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="profile-name"
                type="text"
                value={form.name}
                onChange={f('name')}
                disabled={!editing}
                placeholder="Your full name"
                className={`input-field pl-10 ${!editing ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="input-field pl-10 opacity-50 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-slate-600 mt-1">Email cannot be changed after registration.</p>
          </div>

          {/* Height + Weight */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                <Ruler className="inline w-3 h-3 mr-1" />Height (cm)
              </label>
              <input
                id="profile-height"
                type="number"
                value={form.height_cm}
                onChange={f('height_cm')}
                disabled={!editing}
                placeholder="175"
                min="100"
                max="250"
                className={`input-field ${!editing ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                <Weight className="inline w-3 h-3 mr-1" />Weight (kg)
              </label>
              <input
                id="profile-weight"
                type="number"
                value={form.weight_kg}
                onChange={f('weight_kg')}
                disabled={!editing}
                placeholder="70"
                min="30"
                max="300"
                className={`input-field ${!editing ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Experience Level</label>
            <div className="grid grid-cols-2 gap-2">
              {EXPERIENCE_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  disabled={!editing}
                  onClick={() => editing && setForm((f) => ({ ...f, experience_level: level.value as ExperienceLevel }))}
                  className={`text-left p-3 rounded-xl border transition-all duration-200 ${
                    form.experience_level === level.value
                      ? 'bg-cyan-neon/10 border-cyan-neon/40 text-cyan-neon'
                      : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:border-white/20'
                  } ${!editing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="text-xs font-semibold">{level.label}</div>
                  <div className="text-[10px] opacity-70 mt-0.5">{level.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sport */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              <Dumbbell className="inline w-3 h-3 mr-1" />Primary Sport (optional)
            </label>
            <select
              id="profile-sport"
              value={form.sport}
              onChange={f('sport')}
              disabled={!editing}
              className={`input-field ${!editing ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <option value="">Select your primary sport</option>
              {SPORTS.map((sport) => (
                <option key={sport} value={sport.toLowerCase()}>
                  {sport}
                </option>
              ))}
            </select>
          </div>

          {/* Body Metrics Info */}
          {(form.height_cm && form.weight_kg) && (
            <div className="p-4 rounded-xl bg-cyan-neon/5 border border-cyan-neon/15">
              <div className="text-xs text-slate-400 mb-1">BMI Estimate</div>
              <div className="text-lg font-bold text-cyan-neon">
                {(parseFloat(String(form.weight_kg)) / Math.pow(parseFloat(String(form.height_cm)) / 100, 2)).toFixed(1)}
              </div>
              <div className="text-xs text-slate-500">
                {(() => {
                  const bmi = parseFloat(String(form.weight_kg)) / Math.pow(parseFloat(String(form.height_cm)) / 100, 2);
                  if (bmi < 18.5) return 'Underweight';
                  if (bmi < 25) return 'Normal weight';
                  if (bmi < 30) return 'Overweight';
                  return 'Obese';
                })()}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {editing && (
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                id="profile-save"
                disabled={saving}
                className="btn-primary flex-1 py-3"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4" /> Save Changes</>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setError('');
                  setForm({
                    name: user?.name || '',
                    height_cm: user?.height_cm || '',
                    weight_kg: user?.weight_kg || '',
                    experience_level: user?.experience_level || 'beginner',
                    sport: user?.sport || '',
                  });
                }}
                className="btn-secondary px-6"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </motion.div>

      {/* ── Analysis Calibration Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-cyan p-6 rounded-2xl"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-neon/15 border border-cyan-neon/25 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-cyan-neon" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-1">Analysis Calibration</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your height and weight are used to calibrate gait analysis metrics like stride length,
              step frequency normalization, and body segment proportions. Keeping these accurate
              improves the precision of your biomechanical analysis by up to 15%.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
