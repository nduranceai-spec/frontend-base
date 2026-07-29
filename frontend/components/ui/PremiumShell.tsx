import { ReactNode } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

const join = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(' ');

type Tone = 'default' | 'accent' | 'success' | 'warning' | 'danger';

export function PageShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={join('min-h-screen bg-[#050816] text-white', className)}>
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-4 py-4 sm:px-6 lg:px-8 xl:px-10">
        {children}
      </div>
    </div>
  );
}

export function PremiumCard({
  children,
  className = '',
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={join(
        'rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl',
        hover && 'transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-[0_28px_90px_rgba(6,182,212,0.16)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            {eyebrow}
          </div>
        )}
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 text-sm leading-7 text-slate-400">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function MetricTile({
  icon: Icon,
  label,
  value,
  helper,
  tone = 'default',
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  helper?: string;
  tone?: Tone;
}) {
  const toneStyles: Record<Tone, string> = {
    default: 'border-white/10 text-slate-300',
    accent: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
    success: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
    warning: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
    danger: 'border-rose-400/20 bg-rose-400/10 text-rose-200',
  };

  return (
    <PremiumCard className={join('p-5', toneStyles[tone])} hover={false}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</p>
          {helper && <p className="mt-2 text-xs text-slate-400">{helper}</p>}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </PremiumCard>
  );
}

export function HeroActionButton({
  children,
  href,
  primary = false,
}: {
  children: ReactNode;
  href: string;
  primary?: boolean;
}) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200';
  const classes = primary
    ? `${base} bg-cyan-400 text-slate-950 shadow-[0_0_45px_rgba(6,182,212,.25)] hover:-translate-y-0.5 hover:bg-cyan-300`
    : `${base} border border-white/10 bg-white/5 text-white hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-white/10`;

  return (
    <a href={href} className={classes}>
      {children}
      <ArrowRight className="h-4 w-4" />
    </a>
  );
}
