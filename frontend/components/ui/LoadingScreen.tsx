'use client';
// components/ui/LoadingScreen.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  show?: boolean;
  message?: string;
}

export default function LoadingScreen({ show = true, message = 'Initializing AI Systems…' }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!show) return;
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(timer); return 100; }
        return p + Math.random() * 15;
      });
    }, 150);
    return () => clearInterval(timer);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-spider-void"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated web formation */}
          <div className="relative w-48 h-48 mb-8">
            <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
              {/* Web rings */}
              {[20, 40, 60, 80, 100].map((r, i) => (
                <motion.circle
                  key={r}
                  cx="100" cy="100" r={r}
                  stroke="rgba(220,20,60,0.4)"
                  strokeWidth="0.8"
                  strokeDasharray={`${2 * Math.PI * r}`}
                  strokeDashoffset={`${2 * Math.PI * r}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * r }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 1.5, delay: i * 0.2, ease: 'easeOut' }}
                />
              ))}
              {/* Spokes */}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                const x2 = 100 + Math.cos(angle) * 100;
                const y2 = 100 + Math.sin(angle) * 100;
                return (
                  <motion.line
                    key={i}
                    x1="100" y1="100" x2={x2} y2={y2}
                    stroke="rgba(220,20,60,0.35)"
                    strokeWidth="0.6"
                    strokeDasharray="200"
                    initial={{ strokeDashoffset: 200 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.06, ease: 'easeOut' }}
                  />
                );
              })}
              {/* Center glow */}
              <motion.circle
                cx="100" cy="100" r="6"
                fill="rgba(220,20,60,0.8)"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 0.8] }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
              {/* Rotating outer ring */}
              <motion.circle
                cx="100" cy="100" r="96"
                stroke="rgba(220,20,60,0.25)"
                strokeWidth="1"
                strokeDasharray="8 6"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                style={{ originX: '100px', originY: '100px' }}
              />
            </svg>

            {/* Pulse rings */}
            {[1, 2].map(n => (
              <motion.div
                key={n}
                className="absolute inset-0 rounded-full border border-spider-scarlet/30"
                animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                transition={{ duration: 2, delay: n * 0.8, repeat: Infinity, ease: 'easeOut' }}
              />
            ))}
          </div>

          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-6"
          >
            <h1 className="font-display text-3xl font-black tracking-widest text-gradient-crimson mb-1">
              SPIDER TRACK AI
            </h1>
            <p className="text-spider-silver/60 text-xs font-mono tracking-[0.3em] uppercase">
              Elite Performance Analysis
            </p>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            className="w-64 h-px bg-spider-graphite rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-spider-crimson to-spider-scarlet"
              style={{ width: `${Math.min(progress, 100)}%`, boxShadow: '0 0 8px rgba(220,20,60,0.8)' }}
              transition={{ duration: 0.15 }}
            />
          </motion.div>

          {/* Message */}
          <motion.p
            className="mt-3 text-xs font-mono text-spider-dim tracking-widest"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {message}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
