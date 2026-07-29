'use client';
// components/ai/LiveCoach.tsx — AI Live Coaching Messages

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, MessageSquare, Zap } from 'lucide-react';

interface Props {
  cues: string[];
  isLive: boolean;
}

export function LiveCoach({ cues, isLive }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest cue
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [cues]);

  if (!isLive) {
    return (
      <div className="text-center py-4">
        <Brain className="w-6 h-6 text-purple-400/40 mx-auto mb-2" />
        <p className="text-xs text-slate-600">Coach activates during live session</p>
      </div>
    );
  }

  const latest = cues[cues.length - 1];
  const previous = cues.slice(-4, -1).reverse();

  return (
    <div className="space-y-3">
      {/* Latest cue — highlighted */}
      {latest ? (
        <motion.div
          key={latest}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-purple p-3 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Zap className="w-3 h-3 text-purple-400" />
            <span className="text-xs font-semibold text-purple-300">Live Coaching</span>
          </div>
          <p className="text-sm text-white leading-relaxed">{latest}</p>
        </motion.div>
      ) : (
        <div className="glass-purple p-3 rounded-xl text-center">
          <p className="text-xs text-slate-500">Analyzing your form...</p>
        </div>
      )}

      {/* Previous cues */}
      {previous.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-slate-700">Previous cues:</p>
          <div ref={scrollRef} className="space-y-1.5 max-h-28 overflow-y-auto">
            <AnimatePresence>
              {previous.map((cue, i) => (
                <motion.div
                  key={cue}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2 text-xs text-slate-600 pl-2"
                >
                  <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>{cue}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
