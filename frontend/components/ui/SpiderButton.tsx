'use client';
// components/ui/SpiderButton.tsx
// Premium angular spider-web styled button component

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'electric';
type Size    = 'sm' | 'md' | 'lg' | 'xl';

interface SpiderButtonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
  id?: string;
}

const variantStyles: Record<Variant, string> = {
  primary:   'bg-gradient-to-r from-spider-scarlet to-spider-crimson text-spider-white border border-spider-glow/30 hover:shadow-spider-lg',
  secondary: 'bg-spider-graphite/80 text-spider-scarlet border border-spider-scarlet/40 hover:bg-spider-scarlet/10 hover:border-spider-scarlet/70 hover:shadow-spider',
  ghost:     'bg-transparent text-spider-silver border border-spider-silver/20 hover:text-spider-white hover:border-spider-scarlet/40 hover:bg-spider-scarlet/5',
  danger:    'bg-gradient-to-r from-red-700 to-red-900 text-white border border-red-500/30 hover:shadow-spider',
  electric:  'bg-gradient-to-r from-spider-electric/20 to-spider-electric/10 text-spider-electric border border-spider-electric/40 hover:bg-spider-electric/25 hover:shadow-electric',
};

const sizeStyles: Record<Size, { padding: string; text: string; clip: string }> = {
  sm: { padding: 'px-4 py-2',   text: 'text-xs',  clip: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)' },
  md: { padding: 'px-6 py-3',   text: 'text-sm',  clip: 'polygon(10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 10px)' },
  lg: { padding: 'px-8 py-4',   text: 'text-base', clip: 'polygon(14px 0%, calc(100% - 14px) 0%, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0% calc(100% - 14px), 0% 14px)' },
  xl: { padding: 'px-10 py-5',  text: 'text-lg',  clip: 'polygon(16px 0%, calc(100% - 16px) 0%, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0% calc(100% - 16px), 0% 16px)' },
};

export default function SpiderButton({
  children, variant = 'primary', size = 'md', onClick, disabled = false,
  loading = false, type = 'button', className = '', icon, fullWidth = false, id,
}: SpiderButtonProps) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const s = sizeStyles[size];

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const id = Date.now();
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 800);
    onClick?.();
  };

  return (
    <motion.button
      id={id}
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        relative inline-flex items-center justify-center gap-2
        font-display font-semibold tracking-wider uppercase
        transition-all duration-300 ease-spring cursor-pointer
        select-none overflow-hidden
        ${s.padding} ${s.text}
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-40 cursor-not-allowed' : ''}
        ${className}
      `}
      style={{ clipPath: s.clip }}
      whileHover={!disabled && !loading ? { y: -2, scale: 1.01 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
    >
      {/* Web corner accents */}
      <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-spider-scarlet/60 pointer-events-none" />
      <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-spider-scarlet/60 pointer-events-none" />
      <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-spider-scarlet/60 pointer-events-none" />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-spider-scarlet/60 pointer-events-none" />

      {/* Shimmer line on hover */}
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent -skew-x-12 pointer-events-none"
        initial={{ x: '-150%' }}
        whileHover={{ x: '150%' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />

      {/* Click ripples */}
      <AnimatePresence>
        {ripples.map(r => (
          <motion.span
            key={r.id}
            className="absolute rounded-full bg-spider-scarlet/20 pointer-events-none"
            style={{ left: `${r.x}%`, top: `${r.y}%`, translateX: '-50%', translateY: '-50%' }}
            initial={{ width: 0, height: 0, opacity: 0.8 }}
            animate={{ width: 200, height: 200, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* Content */}
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="32" strokeDashoffset="8" />
          </svg>
          Processing…
        </span>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
}
