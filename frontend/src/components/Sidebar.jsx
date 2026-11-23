import React from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  History,
  BarChart3,
  Cpu,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity,
  AlertCircle
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  backendOnline,
  totalScans
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'analyzer', label: 'Email Analyzer', icon: ShieldCheck, badge: 'Core' },
    { id: 'history', label: 'Detection History', icon: History, count: totalScans },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'about', label: 'About Model', icon: Cpu },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative flex flex-col justify-between transition-all duration-300 ease-in-out border-r border-[#1E2E52] bg-[#0A1020]/95 backdrop-blur-md z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-68'
      }`}
    >
      {/* Top Branding */}
      <div>
        <div className="flex items-center justify-between px-5 py-6 border-b border-[#1E2E52]/60">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/20 flex-shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-wide bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                  AegisSpam AI
                </span>
                <span className="text-[11px] font-medium text-cyan-400/80 uppercase tracking-wider">
                  Cyber Defense ML
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#162444] transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 text-left relative group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/20 via-cyan-600/15 to-transparent text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#111C35]/60'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r bg-cyan-400 shadow-sm shadow-cyan-400" />
                )}
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                    isActive ? 'text-cyan-400 scale-105' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!isCollapsed && (
                  <div className="flex items-center justify-between flex-1">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {item.badge}
                      </span>
                    )}
                    {item.count !== undefined && item.count > 0 && (
                      <span className="px-1.5 py-0.5 text-[11px] font-semibold rounded-full bg-slate-800 text-slate-300">
                        {item.count}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Service Status */}
      <div className="p-4 border-t border-[#1E2E52]/60 bg-[#070D1A]/60">
        {!isCollapsed ? (
          <div className="p-3 rounded-xl bg-[#0D1527] border border-[#1E2E52] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Backend Status
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    backendOnline
                      ? 'bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse'
                      : 'bg-rose-500'
                  }`}
                />
                <span
                  className={`text-xs font-semibold ${
                    backendOnline ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {backendOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Model Engine</span>
              <span className="text-cyan-400 font-mono text-[10px]">LinearSVC</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title={backendOnline ? 'Backend Online' : 'Backend Offline'}>
            <span
              className={`w-3 h-3 rounded-full ${
                backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`}
            />
          </div>
        )}
      </div>
    </aside>
  );
}

