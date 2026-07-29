'use client';
// components/dashboard/AlertFeed.tsx

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, XCircle } from 'lucide-react';
import { MotionAlert } from '@/types';

const SEVERITY_CONFIG = {
  danger:  { icon: XCircle,        class: 'alert-item-danger',  iconColor: 'text-red-400' },
  warning: { icon: AlertTriangle,  class: 'alert-item-warning', iconColor: 'text-amber-400' },
  info:    { icon: Info,           class: 'alert-item-info',    iconColor: 'text-blue-400' },
};

interface Props { alerts: MotionAlert[]; maxShow?: number; }

export function AlertFeed({ alerts, maxShow = 5 }: Props) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="text-center py-4">
        <div className="w-8 h-8 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
          <Info className="w-4 h-4 text-emerald-400" />
        </div>
        <p className="text-xs text-slate-600">No alerts — form looks good!</p>
      </div>
    );
  }

  const shown = alerts.slice(0, maxShow);

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {shown.map((alert, i) => {
          const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
          const Icon = cfg.icon;
          return (
            <motion.div
              key={`${alert.message}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cfg.class}
            >
              <div className="flex items-start gap-2">
                <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${cfg.iconColor}`} />
                <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      {alerts.length > maxShow && (
        <p className="text-xs text-slate-600 text-center">+{alerts.length - maxShow} more alerts</p>
      )}
    </div>
  );
}
