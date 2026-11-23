import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Mail,
  Percent,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Inbox
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
} from 'recharts';
import MetricCard from '../components/MetricCard';

export default function Dashboard({
  stats,
  history,
  setActiveTab,
  onSelectSample,
  backendOnline
}) {
  const hasData = history.length > 0;

  // Pie chart data
  const pieData = [
    { name: 'Spam', value: stats.spamCount, color: '#F43F5E' },
    { name: 'Legitimate', value: stats.legitimateCount, color: '#10B981' },
  ];

  // Timeline data: group last 10 scans
  const trendData = [...history]
    .reverse()
    .slice(-10)
    .map((item, idx) => ({
      scanIndex: `#${idx + 1}`,
      time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      score: item.decisionScore || 0,
      confidence: item.confidence || 0,
      isSpam: item.isSpam ? 1 : 0,
    }));

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative p-6 rounded-3xl bg-gradient-to-r from-[#0E1A38] via-[#0F172A] to-[#121626] border border-[#1E2E52] shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Machine Learning Security
              </span>
              <span className="text-xs text-slate-400">
                LinearSVC (C=10) &bull; TF-IDF N-Grams
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              AI-Powered Email Spam Protection
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Detect phishing, promotional spam, and malicious messages using mathematical text vectorization and high-dimensional support vector classification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('analyzer')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-950 transition-all transform active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Analyzer</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Total Scans"
          value={stats.total}
          subtext="Actual analyzed messages"
          icon={Mail}
          variant="blue"
        />
        <MetricCard
          title="Spam Detected"
          value={stats.spamCount}
          subtext="High-risk threat items"
          icon={ShieldAlert}
          variant="rose"
        />
        <MetricCard
          title="Legitimate Emails"
          value={stats.legitimateCount}
          subtext="Safe ham messages"
          icon={ShieldCheck}
          variant="emerald"
        />
        <MetricCard
          title="Spam Ratio"
          value={`${stats.spamRate}%`}
          subtext={hasData ? `Avg confidence: ${stats.avgConfidence}%` : 'No data yet'}
          icon={Percent}
          variant="cyan"
        />
      </div>

      {/* Chart & Quick Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Distribution & Trends */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0D1527] border border-[#1E2E52] space-y-6">
          <div className="flex items-center justify-between border-b border-[#1E2E52]/60 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Detection Telemetry
              </h3>
              <p className="text-xs text-slate-400">
                Aggregated from your local session scan history
              </p>
            </div>
            {hasData && (
              <span className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                {stats.total} total scans recorded
              </span>
            )}
          </div>

          {hasData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Donut Chart */}
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#080E1C] border border-[#1E2E52]/40">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Classification Breakdown
                </p>
                <div className="w-full h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#1E2E52',
                          borderRadius: '8px',
                          color: '#F8FAFC',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-4 text-xs mt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="text-slate-300">Spam ({stats.spamCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-300">Legitimate ({stats.legitimateCount})</span>
                  </div>
                </div>
              </div>

              {/* Confidence Trend */}
              <div className="flex flex-col p-4 rounded-xl bg-[#080E1C] border border-[#1E2E52]/40 h-64">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Decision Confidence (Last Scans)
                </p>
                <div className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="scanIndex" stroke="#475569" fontSize={11} />
                      <YAxis stroke="#475569" fontSize={11} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#1E2E52',
                          borderRadius: '8px',
                          color: '#F8FAFC',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="confidence"
                        stroke="#06B6D4"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorConfidence)"
                        name="Confidence %"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            /* Proper empty state as required by prompt */
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl bg-[#080E1C]/60 border border-dashed border-[#1E2E52]">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 border border-cyan-500/20">
                <Inbox className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-white">No Detection Activity Yet</h4>
              <p className="text-xs text-slate-400 max-w-md mt-1.5 leading-relaxed">
                Analyze your first email or SMS message to populate real-time charts, KPI telemetry, and threat statistics.
              </p>
              <button
                onClick={() => setActiveTab('analyzer')}
                className="mt-5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-md transition-colors"
              >
                Scan Your First Email
              </button>
            </div>
          )}
        </div>

        {/* Right Col: Quick Analyzer & Samples */}
        <div className="p-6 rounded-2xl bg-[#0D1527] border border-[#1E2E52] flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#1E2E52]/60 pb-4">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Quick Test Samples
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Test the machine learning pipeline immediately with pre-configured verified email payloads:
            </p>

            <div className="space-y-3 mt-4">
              <button
                onClick={() => {
                  onSelectSample(
                    'Congratulations! You have won a free prize. Click here now to claim your £1000 cash reward.',
                    'Urgent: Reward Claim'
                  );
                  setActiveTab('analyzer');
                }}
                className="w-full text-left p-3 rounded-xl bg-[#080E1C] hover:bg-[#111C35] border border-rose-500/20 hover:border-rose-500/40 transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-rose-400 mb-1">
                  <span>🚨 Urgent Prize Winner</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400">
                    Spam
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">
                  Congratulations! You have won a free prize. Click here now to claim your reward...
                </p>
              </button>

              <button
                onClick={() => {
                  onSelectSample(
                    'Hi team, please find the meeting notes attached from today’s discussion. Let me know if you have feedback.',
                    'Weekly Team Sync Notes'
                  );
                  setActiveTab('analyzer');
                }}
                className="w-full text-left p-3 rounded-xl bg-[#080E1C] hover:bg-[#111C35] border border-emerald-500/20 hover:border-emerald-500/40 transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 mb-1">
                  <span>✅ Team Meeting Notes</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                    Ham
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">
                  Hi team, please find the meeting notes attached from today’s discussion...
                </p>
              </button>

              <button
                onClick={() => {
                  onSelectSample(
                    'Your appointment is scheduled for tomorrow at 10 AM. Please arrive 10 minutes early.',
                    'Appointment Reminder'
                  );
                  setActiveTab('analyzer');
                }}
                className="w-full text-left p-3 rounded-xl bg-[#080E1C] hover:bg-[#111C35] border border-emerald-500/20 hover:border-emerald-500/40 transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 mb-1">
                  <span>✅ Appointment Reminder</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                    Ham
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">
                  Your appointment is scheduled for tomorrow at 10 AM. Please arrive 10 minutes early...
                </p>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#070D1A] border border-[#1E2E52]/60 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Model Algorithm</span>
              <span className="font-semibold text-cyan-400">LinearSVC</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Vectorizer</span>
              <span className="font-semibold text-slate-200">TF-IDF (5,000 N-Grams)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Decision Threshold</span>
              <span className="font-mono text-slate-300">0.0 (Hyperplane)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table (if any) */}
      {hasData && (
        <div className="p-6 rounded-2xl bg-[#0D1527] border border-[#1E2E52] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Recent Scan Activity
            </h3>
            <button
              onClick={() => setActiveTab('history')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              View Full History ({history.length}) &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-[#1E2E52]/80 bg-[#080E1C]/50">
                <tr>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Subject / Preview</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Decision Score</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2E52]/40 text-slate-300">
                {history.slice(0, 5).map((scan) => (
                  <tr key={scan.id} className="hover:bg-[#111C35]/50 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          scan.isSpam
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {scan.isSpam ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                        {scan.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs md:max-w-md truncate">
                      {scan.subject && (
                        <span className="font-semibold text-white mr-2">[{scan.subject}]</span>
                      )}
                      <span className="text-slate-400">{scan.preview}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono">
                      {scan.confidence ? `${scan.confidence}%` : 'N/A'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-400">
                      {scan.decisionScore !== null ? (scan.decisionScore > 0 ? `+${scan.decisionScore}` : scan.decisionScore) : 'N/A'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                      {new Date(scan.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

