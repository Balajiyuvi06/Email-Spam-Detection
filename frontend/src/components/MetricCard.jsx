import React from 'react';

export default function MetricCard({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'cyan', // 'cyan', 'rose', 'emerald', 'blue', 'violet'
  trend
}) {
  const styles = {
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      bgGlow: 'group-hover:bg-cyan-500/5',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30',
      textAccent: 'text-cyan-400',
    },
    rose: {
      border: 'border-rose-500/20 hover:border-rose-500/40',
      bgGlow: 'group-hover:bg-rose-500/5',
      iconBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
      textAccent: 'text-rose-400',
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      bgGlow: 'group-hover:bg-emerald-500/5',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
      textAccent: 'text-emerald-400',
    },
    blue: {
      border: 'border-blue-500/20 hover:border-blue-500/40',
      bgGlow: 'group-hover:bg-blue-500/5',
      iconBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
      textAccent: 'text-blue-400',
    },
    violet: {
      border: 'border-violet-500/20 hover:border-violet-500/40',
      bgGlow: 'group-hover:bg-violet-500/5',
      iconBg: 'bg-violet-500/10 text-violet-400 border border-violet-500/30',
      textAccent: 'text-violet-400',
    },
  };

  const currentStyle = styles[variant] || styles.cyan;

  return (
    <div
      className={`relative p-5 rounded-2xl bg-[#0D1527]/90 border ${currentStyle.border} shadow-lg shadow-black/30 transition-all duration-300 group overflow-hidden`}
    >
      <div
        className={`absolute inset-0 transition-colors duration-300 ${currentStyle.bgGlow}`}
      />
      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">
            {title}
          </p>
          <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
          {subtext && <p className="text-xs text-slate-400 pt-0.5">{subtext}</p>}
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl ${currentStyle.iconBg} flex-shrink-0 shadow-sm`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="relative z-10 mt-3 pt-3 border-t border-[#1E2E52]/40 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">{trend.label}</span>
          <span className={`font-semibold ${currentStyle.textAccent}`}>
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
}

