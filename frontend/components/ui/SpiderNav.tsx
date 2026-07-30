'use client';
// components/ui/SpiderNav.tsx — Dashboard sidebar navigation
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '⬡' },
  { href: '/dashboard/live', label: 'Start Test', icon: '◉', highlight: true },
  { href: '/dashboard/reports', label: 'Reports', icon: '◈' },
  { href: '/dashboard/history', label: 'History', icon: '◇' },
  { href: '/dashboard/profile', label: 'Profile', icon: '◎' },
];

export default function SpiderNav() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0, width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col bg-spider-black/95 backdrop-blur-xl border-r border-spider-scarlet/15 overflow-hidden"
      style={{ width: collapsed ? 72 : 240 }}
    >
      {/* Animated web threads */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" fill="none">
        <line x1="0" y1="0" x2="240" y2="400" stroke="rgba(220,20,60,0.3)" strokeWidth="0.5" />
        <line x1="240" y1="0" x2="0" y2="600" stroke="rgba(220,20,60,0.2)" strokeWidth="0.5" />
        <circle cx="0" cy="0" r="150" stroke="rgba(220,20,60,0.15)" strokeWidth="0.5" />
        <circle cx="0" cy="0" r="280" stroke="rgba(220,20,60,0.1)" strokeWidth="0.5" />
      </svg>

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3 px-4 py-5 border-b border-spider-scarlet/15">
        <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-spider-scarlet to-spider-crimson shadow-spider-sm">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
            <path d="M12 2L12 22M2 12L22 12M5 5L19 19M19 5L5 19" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="12" r="3" fill="white" />
          </svg>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="font-display text-xs font-bold tracking-widest text-spider-white">SPIDER TRACK</p>
              <p className="font-mono text-[10px] text-spider-scarlet tracking-widest">AI PLATFORM</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <nav className="relative z-10 flex-1 py-6 space-y-1 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
                  ${active ? 'bg-spider-scarlet/15 text-spider-white' : 'text-spider-dim hover:text-spider-white hover:bg-spider-scarlet/8'}
                  ${item.highlight && !active ? 'border border-spider-scarlet/30' : ''}
                `}
              >
                {active && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-spider-scarlet shadow-spider-sm"
                  />
                )}
                <span className={`text-lg shrink-0 ${active ? 'text-spider-scarlet' : ''}`}>{item.icon}</span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="font-display text-xs tracking-widest font-semibold uppercase"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {item.highlight && !collapsed && (
                  <span className="ml-auto text-[9px] font-mono text-spider-scarlet animate-pulse">LIVE</span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Collapse + Logout */}
      <div className="relative z-10 border-t border-spider-scarlet/15 p-3 space-y-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-spider-dim hover:text-spider-white hover:bg-spider-scarlet/8 transition-all"
        >
          <span className="text-lg">{collapsed ? '→' : '←'}</span>
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs font-mono">
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <Link href="/login">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-spider-dim hover:text-spider-scarlet hover:bg-spider-scarlet/8 transition-all cursor-pointer">
            <span className="text-lg">⏻</span>
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs font-mono">
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </Link>
      </div>
    </motion.aside>
  );
}
