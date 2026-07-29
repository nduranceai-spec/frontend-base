'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Activity, Camera, ChevronRight, Clock, FileText, Home, LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { clearAuth } from '@/lib/auth';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: Home },
  { href: '/dashboard/live', label: 'Live Analysis', icon: Camera },
  { href: '/dashboard/history', label: 'Session History', icon: Clock },
  { href: '/dashboard/reports', label: 'Reports', icon: FileText },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, clearAuth: clearStore } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    clearAuth();
    clearStore();
    router.push('/');
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-[#050816] text-slate-100">
      <aside className="flex w-72 shrink-0 flex-col border-r border-white/10 bg-slate-950/70 backdrop-blur-2xl">
        <div className="flex h-16 items-center border-b border-white/10 px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
              <Activity className="h-4 w-4 text-cyan-300" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.24em] text-white">NDURANCE</p>
              <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">AI LAB</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-6">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={`nav-item ${active ? 'active' : ''}`}>
                <item.icon className="h-4 w-4" />
                {item.label}
                {active && <ChevronRight className="ml-auto h-3.5 w-3.5" />}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 px-3 pb-6">
          <div className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-500/30 text-xs font-semibold text-white">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">{user?.name}</div>
              <div className="truncate text-xs text-slate-500">{user?.experience_level || 'Athlete'}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="nav-item w-full text-rose-300 hover:bg-rose-400/10 hover:text-rose-200">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
