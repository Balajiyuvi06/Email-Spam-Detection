import React from 'react';
import { ShieldAlert, ShieldCheck, RefreshCw, Cpu, Activity } from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  backendOnline,
  modelInfo,
  onRefreshHealth,
  isCheckingHealth
}) {
  const titles = {
    dashboard: {
      title: 'Dashboard Overview',
      subtitle: 'Real-time telemetry and aggregated spam detection metrics',
    },
    analyzer: {
      title: 'Email Security Analyzer',
      subtitle: 'Analyze email headers, subjects, and text bodies using LinearSVC ML inference',
    },
    history: {
      title: 'Detection History',
      subtitle: 'Review past email scans, classification confidence, and decision scores',
    },
    analytics: {
      title: 'Telemetry & Analytics',
      subtitle: 'Statistical distribution and risk trends derived from your scan activity',
    },
    about: {
      title: 'Model Architecture & Preprocessing',
      subtitle: 'Deep dive into TF-IDF vectorization and the Linear Support Vector Classifier',
    },
    settings: {
      title: 'System Settings',
      subtitle: 'Configure backend endpoints, manage local history, and test connection latency',
    },
  };

  const current = titles[activeTab] || titles.dashboard;

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-8 py-5 border-b border-[#1E2E52]/70 bg-[#080E1C]/80 backdrop-blur-md sticky top-0 z-20">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
          {current.title}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">{current.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Model Info Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0F172A] border border-[#1E2E52] text-xs">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Classifier:</span>
          <span className="font-semibold text-slate-200">
            {modelInfo?.classifier || 'LinearSVC'}
          </span>
          <span className="text-[10px] text-cyan-400 px-1 py-0.2 rounded bg-cyan-950/80 border border-cyan-800/40">
            C=10
          </span>
        </div>

        {/* Backend Status indicator button */}
        <button
          onClick={onRefreshHealth}
          disabled={isCheckingHealth}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0F172A] border border-[#1E2E52] text-xs text-slate-300 hover:border-slate-600 transition-colors"
          title="Click to ping backend"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              backendOnline ? 'bg-emerald-400' : 'bg-rose-500'
            }`}
          />
          <span>{backendOnline ? 'API Connected' : 'API Disconnected'}</span>
          <RefreshCw
            className={`w-3 h-3 text-slate-400 ${
              isCheckingHealth ? 'animate-spin text-cyan-400' : ''
            }`}
          />
        </button>

        {/* Quick Launch CTA */}
        {activeTab !== 'analyzer' && (
          <button
            onClick={() => setActiveTab('analyzer')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-md shadow-cyan-950 transition-all transform active:scale-95"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Analyze Email</span>
          </button>
        )}
      </div>
    </header>
  );
}

