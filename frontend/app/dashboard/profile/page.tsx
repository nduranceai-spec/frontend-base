'use client';
// app/dashboard/profile/page.tsx — Spider Track AI Athlete Profile
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import SpiderButton from '@/components/ui/SpiderButton';
import { authApi, getApiErrorMessage } from '@/lib/api';

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner', desc: 'Just starting out' },
  { value: 'intermediate', label: 'Intermediate', desc: '1–3 years' },
  { value: 'advanced', label: 'Advanced', desc: '3–7 years' },
  { value: 'elite', label: 'Elite', desc: 'Competitive athlete' },
];

const SPORTS = ['Running', 'Cycling', 'Swimming', 'Weightlifting', 'CrossFit', 'Football', 'Basketball', 'Tennis', 'Other'];

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', height: '', weight: '', experience: '', sport: '',
  });

  useEffect(() => {
    authApi.getMe()
      .then(({ data }) => setForm((current) => ({
        ...current,
        name: data.name || '',
        email: data.email || '',
        height: data.height_cm == null ? '' : String(data.height_cm),
        weight: data.weight_kg == null ? '' : String(data.weight_kg),
      })))
      .catch((requestError) => setError(getApiErrorMessage(requestError)));
  }, []);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await authApi.updateProfile({
        name: form.name,
        height_cm: form.height ? parseFloat(form.height) : undefined,
        weight_kg: form.weight ? parseFloat(form.weight) : undefined,
      });
      setSuccess(true);
      setEditing(false);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const bmi = form.height && form.weight
    ? (parseFloat(form.weight) / Math.pow(parseFloat(form.height) / 100, 2)).toFixed(1)
    : null;

  const stats = [
    { label: 'Experience', value: form.experience, color: 'text-spider-scarlet' },
    { label: 'Sport', value: form.sport, color: 'text-spider-electric' },
    { label: 'Height', value: `${form.height} cm`, color: 'text-spider-white' },
    { label: 'Weight', value: `${form.weight} kg`, color: 'text-spider-white' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-4xl space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-[10px] font-mono text-spider-scarlet tracking-[0.3em] mb-1">ATHLETE IDENTITY</p>
          <h1 className="font-display text-3xl font-black text-spider-white">ATHLETE <span className="text-gradient-crimson">PROFILE</span></h1>
        </div>
        {!editing && (
          <SpiderButton variant="secondary" size="sm" onClick={() => setEditing(true)}>✎ Edit Profile</SpiderButton>
        )}
      </motion.div>

      {/* Avatar + Name */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-spider-scarlet to-spider-crimson shadow-spider flex items-center justify-center">
            <span className="font-display text-xl font-black text-white">
              {form.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-spider-white tracking-wide">{form.name}</h2>
            <p className="text-spider-dim text-sm font-mono">{form.email}</p>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-md bg-spider-scarlet/15 border border-spider-scarlet/25 text-spider-scarlet text-[10px] font-mono uppercase capitalize">
                {form.experience}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-spider-electric/10 border border-spider-electric/20 text-spider-electric text-[10px] font-mono">
                {form.sport}
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <GlassCard key={s.label} delay={i * 0.07} className="p-4 text-center">
              <p className={`font-display text-lg font-bold ${s.color} mb-1 capitalize`}>{s.value || '—'}</p>
            <p className="text-[10px] font-mono text-spider-dim uppercase tracking-widest">{s.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Edit Form */}
      <GlassCard className="p-6">
        <p className="text-[10px] font-mono text-spider-scarlet tracking-widest mb-5 uppercase">
          {editing ? 'Edit Profile Details' : 'Profile Details'}
        </p>

        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-4 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-mono">
            ✓ Profile updated successfully
          </motion.div>
        )}
        {error && <p className="mb-4 text-xs font-mono text-spider-scarlet">{error}</p>}

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-spider-scarlet tracking-widest mb-2 uppercase">Full Name</label>
              <input id="profile-name" type="text" value={form.name} onChange={set('name')} disabled={!editing}
                className={`spider-input w-full px-4 py-3 rounded-xl text-sm ${!editing ? 'opacity-50 cursor-not-allowed' : ''}`} />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-spider-scarlet tracking-widest mb-2 uppercase">Email</label>
              <input type="email" value={form.email} disabled
                className="spider-input w-full px-4 py-3 rounded-xl text-sm opacity-40 cursor-not-allowed" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-spider-scarlet tracking-widest mb-2 uppercase">Height (cm)</label>
              <input id="profile-height" type="number" value={form.height} onChange={set('height')} disabled={!editing}
                min="100" max="250" className={`spider-input w-full px-4 py-3 rounded-xl text-sm ${!editing ? 'opacity-50 cursor-not-allowed' : ''}`} />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-spider-scarlet tracking-widest mb-2 uppercase">Weight (kg)</label>
              <input id="profile-weight" type="number" value={form.weight} onChange={set('weight')} disabled={!editing}
                min="30" max="300" className={`spider-input w-full px-4 py-3 rounded-xl text-sm ${!editing ? 'opacity-50 cursor-not-allowed' : ''}`} />
            </div>
          </div>

          {bmi && (
            <div className="px-4 py-3 rounded-xl bg-spider-scarlet/5 border border-spider-scarlet/15">
              <p className="text-[10px] font-mono text-spider-dim mb-1">BMI ESTIMATE</p>
              <p className="font-display text-xl font-bold text-spider-scarlet">{bmi}</p>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-mono text-spider-scarlet tracking-widest mb-3 uppercase">Experience Level</label>
            <div className="grid grid-cols-2 gap-2">
              {EXPERIENCE_LEVELS.map(level => (
                <button key={level.value} type="button" disabled={!editing}
                  onClick={() => editing && setForm(f => ({ ...f, experience: level.value }))}
                  className={`text-left p-3 rounded-xl border transition-all duration-200 text-xs
                    ${form.experience === level.value
                      ? 'bg-spider-scarlet/15 border-spider-scarlet/40 text-spider-scarlet'
                      : 'bg-spider-void/50 border-spider-scarlet/10 text-spider-dim hover:border-spider-scarlet/25'}
                    ${!editing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                  <p className="font-semibold">{level.label}</p>
                  <p className="text-[10px] opacity-70 mt-0.5">{level.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-spider-scarlet tracking-widest mb-2 uppercase">Primary Sport</label>
            <select id="profile-sport" value={form.sport} onChange={set('sport')} disabled={!editing}
              className={`spider-input w-full px-4 py-3 rounded-xl text-sm bg-spider-black/70 ${!editing ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <option value="">Not provided</option>
              {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {editing && (
            <div className="flex gap-3">
              <SpiderButton id="profile-save" type="submit" variant="primary" size="md" loading={saving}>
                {saving ? 'Saving…' : '✓ Save Changes'}
              </SpiderButton>
              <SpiderButton type="button" variant="ghost" size="md" onClick={() => { setEditing(false); }}>
                Cancel
              </SpiderButton>
            </div>
          )}
        </form>
      </GlassCard>
    </div>
  );
}
