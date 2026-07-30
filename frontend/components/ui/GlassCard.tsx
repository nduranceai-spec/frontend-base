'use client';
// components/ui/GlassCard.tsx
import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
  delay?: number;
}

export default function GlassCard({
  children, className = '', hover = true, glow = false, onClick, delay = 0,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      onClick={onClick}
      className={`
        relative rounded-2xl overflow-hidden
        glass-card
        ${glow ? 'shadow-spider' : ''}
        ${hover ? 'cursor-default transition-shadow duration-300 hover:shadow-spider' : ''}
        ${className}
      `}
    >
      {/* Corner web decorators */}
      <span className="absolute top-0 left-0 w-5 h-5 border-t border-l border-spider-scarlet/40 rounded-tl-2xl pointer-events-none" />
      <span className="absolute top-0 right-0 w-5 h-5 border-t border-r border-spider-scarlet/40 rounded-tr-2xl pointer-events-none" />
      <span className="absolute bottom-0 left-0 w-5 h-5 border-b border-l border-spider-scarlet/40 rounded-bl-2xl pointer-events-none" />
      <span className="absolute bottom-0 right-0 w-5 h-5 border-b border-r border-spider-scarlet/40 rounded-br-2xl pointer-events-none" />

      {/* Inner content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
