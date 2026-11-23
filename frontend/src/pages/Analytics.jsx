import React from 'react';
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Inbox,
  Sparkles,
  Layers
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import MetricCard from '../components/MetricCard';

export default function Analytics({ history, stats, setActiveTab }) {
  const hasData = history.length > 0;

  // Pie chart data
  const pieData = [
    { name: 'Spam Detected', value: stats.spamCount, color: '#F43F5E' },
    { name: 'Legitimate (Ham)', value: stats.legitimateCount, color: '#10B981' },
  ];

  // Risk distribution data
  const riskCounts = { High: 0, Moderate: 0, Low: 0 };
  history.forEach((item) => {
    const risk = item.riskLevel || (item.isSpam ? 'High' : 'Low');
    riskCounts[risk] = (riskCounts[risk] || 0) + 1;
  });

  const riskData = [
    { level: 'High Risk (Spam)', count: riskCounts.High, fill: '#F43F5E' },
    { level: 'Moderate Risk', count: riskCounts.Moderate, fill: '#F59E0B' },
    { level: 'Low Risk (Safe)', count: riskCounts.Low, fill: '#10B981' },
  ];

  // Confidence distribution: Buckets (50-60%, 60-70%, 70-80%, 80-90%, 90-100%)
  const confidenceBuckets = [
    { range: '50-60%', count: 0 },
    { range: '60-70%', count: 0 },
    { range: '70-80%', count: 0 },
    { range: '80-90%', count: 0 },
    { range: '90-100%', count: 0 },
  ];

  history.forEach((item) => {
    const c = item.confidence || 50;
    if (c >= 90) confidenceBuckets[4].count += 1;
    else if (c >= 80) confidenceBuckets[3].count += 1;
    else if (c >= 70) confidenceBuckets[2].count += 1;
    else if (c >= 60) confidenceBuckets[1].count += 1;
    else confidenceBuckets[0].count += 1;
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Info */}
      <div className="p-6 rounded-3xl bg-[#0D1527] border border-[#1E2E52] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Telemetry & Model Performance
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Empirical metrics computed strictly from your local analysis history
          </p>
        </div>
        {hasData && (
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1.5 rounded-xl">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>Telemetry Active ({stats.total} samples)</span>
          </div>
        )}
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Total Analyzed"
          value={stats.total}
          subtext="Total processed items"
          variant="blue"
        />
        <MetricCard
          title="Spam Count"
          value={stats.spamCount}
          subtext={hasData ? `${stats.spamRate}% of total` : 'No scans'}
          variant="rose"
        />
        <MetricCard
          title="Legitimate Count"
          value={stats.legitimateCount}
          subtext={hasData ? `${100 - stats.spamRate}% of total` : 'No scans'}
          variant="emerald"
        />
        <MetricCard
          title="Avg Confidence"
          value={hasData ? `${stats.avgConfidence}%` : '0%'}
          subtext="Platt sigmoid calibrated"
          variant="cyan"
        />
      </div>

      {/* Charts Section */}
      {hasData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 1: Spam vs Legitimate Donut */}
          <div className="p-6 rounded-3xl bg-[#0D1527] border border-[#1E2E52] space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2E52]/60 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-cyan-400" />
                  Spam vs Legitimate Distribution
                </h3>
                <p className="text-xs text-slate-400">Proportion of messages flagged by LinearSVC</p>
              </div>
            </div>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} />
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
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Threat Risk Level Distribution */}
          <div className="p-6 rounded-3xl bg-[#0D1527] border border-[#1E2E52] space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2E52]/60 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Risk Level Categorization
                </h3>
                <p className="text-xs text-slate-400">Distribution of evaluated messages by risk severity</p>
              </div>
            </div>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2E52" vertical={false} />
                  <XAxis dataKey="level" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E2E52',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} name="Message Count">
                    {riskData.map((entry, index) => (
                      <Cell key={`risk-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Model Confidence Distribution */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-[#0D1527] border border-[#1E2E52] space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2E52]/60 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  Model Confidence Distribution
                </h3>
                <p className="text-xs text-slate-400">Number of scans falling into calibrated confidence intervals</p>
              </div>
            </div>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={confidenceBuckets} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2E52" vertical={false} />
                  <XAxis dataKey="range" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E2E52',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Scans in Interval" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        /* Proper Empty State required by prompt */
        <div className="p-20 rounded-3xl bg-[#0D1527] border border-[#1E2E52] flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <Inbox className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h4 className="text-lg font-bold text-white">No Telemetry Available</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Analytics graphs and distribution charts reflect real scan sessions. Start scanning emails to generate actual telemetry without fake data.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('analyzer')}
            className="mt-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md transition-colors"
          >
            Launch Analyzer
          </button>
        </div>
      )}
    </div>
  );
}

