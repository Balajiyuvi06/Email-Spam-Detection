import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Layers,
  Database,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  FileText,
  Activity,
  Code2
} from 'lucide-react';
import { api } from '../services/api';

export default function AboutModel() {
  const [modelInfo, setModelInfo] = useState(null);
  const [datasetStats, setDatasetStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [info, stats] = await Promise.all([
          api.getModelInfo().catch(() => null),
          api.getDatasetStats().catch(() => null),
        ]);
        if (info?.metadata) setModelInfo(info.metadata);
        if (stats && !stats.error) setDatasetStats(stats);
      } catch (err) {
        console.error('Failed to load model details:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const pipelineSteps = [
    {
      step: '01',
      title: 'Raw Text Input',
      description: 'Accepts email body, subject headers, or SMS messages containing unstructured text.',
      badge: 'String Input',
      color: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
    },
    {
      step: '02',
      title: 'NLP Preprocessing',
      description: 'Converts text to lowercase, strips accents, removes standard English stop-words, and tokenizes into words.',
      badge: 'Regex Tokenizer',
      color: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
    },
    {
      step: '03',
      title: 'TF-IDF Vectorization',
      description: 'Computes Term Frequency-Inverse Document Frequency across unigrams & bigrams (1, 2) up to 5,000 features.',
      badge: '5,000 Dimensions',
      color: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10',
    },
    {
      step: '04',
      title: 'Linear Support Vector Machine',
      description: 'LinearSVC(C=10) evaluates the high-dimensional feature vector against an optimal separating hyperplane.',
      badge: 'LinearSVC (C=10)',
      color: 'border-violet-500/40 text-violet-400 bg-violet-500/10',
    },
    {
      step: '05',
      title: 'Decision & Sigmoid Confidence',
      description: 'Computes decision margin distance f(x) = w·x + b. Applies Platt logistic sigmoid to produce a calibrated confidence percentage.',
      badge: 'Platt Sigmoid',
      color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    },
    {
      step: '06',
      title: 'Spam / Legitimate Prediction',
      description: 'Assigns final binary verdict: Spam 🚨 (f(x) > 0) or Legitimate ✅ (f(x) ≤ 0) with explainable trigger terms.',
      badge: 'Binary Classification',
      color: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Title & Architecture Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0E1A38] via-[#0D1527] to-[#121626] border border-[#1E2E52] space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            Model Specifications & Diagnostics
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Scikit-Learn 1.6+ Architecture
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Support Vector Machine Classification Architecture
        </h2>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          The email spam detection engine utilizes an optimized <span className="text-cyan-400 font-semibold">Linear Support Vector Classifier (LinearSVC)</span> combined with an n-gram <span className="text-cyan-400 font-semibold">TF-IDF Vectorizer</span>. It learns a maximal margin separating boundary in high-dimensional sparse text feature space.
        </p>
      </div>

      {/* End-to-End Pipeline Visualization */}
      <div className="p-6 rounded-3xl bg-[#0D1527] border border-[#1E2E52] space-y-6">
        <div className="border-b border-[#1E2E52]/60 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            End-to-End Prediction Workflow
          </h3>
          <p className="text-xs text-slate-400">
            How a raw email or text payload progresses from string input to classification
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pipelineSteps.map((s, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#080E1C] border border-[#1E2E52] space-y-3 relative group hover:border-cyan-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-500 group-hover:text-cyan-400 transition-colors">
                  STAGE {s.step}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${s.color}`}>
                  {s.badge}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">{s.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hyperparameters & Dataset Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Model Hyperparameters Table */}
        <div className="p-6 rounded-3xl bg-[#0D1527] border border-[#1E2E52] space-y-5">
          <div className="border-b border-[#1E2E52]/60 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              Classifier Hyperparameters
            </h3>
            <p className="text-xs text-slate-400">
              Verified properties inspected from <code className="text-cyan-400">spam_detection_model.pkl</code>
            </p>
          </div>

          <div className="divide-y divide-[#1E2E52]/60 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400">Classifier Class</span>
              <span className="font-mono font-bold text-cyan-400">sklearn.svm.LinearSVC</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400">Regularization Parameter (C)</span>
              <span className="font-mono font-bold text-white">10.0</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400">Loss Function</span>
              <span className="font-mono text-slate-300">squared_hinge</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400">Penalty Norm</span>
              <span className="font-mono text-slate-300">L2 Norm</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400">N-Gram Range</span>
              <span className="font-mono text-slate-300">(1, 2) [Unigrams & Bigrams]</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400">Vocabulary Feature Size</span>
              <span className="font-mono text-slate-300">5,000 Features</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400">Stop Words Filter</span>
              <span className="font-mono text-slate-300">English Standard Dictionary</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-400">Decision Threshold</span>
              <span className="font-mono font-bold text-cyan-400">0.0 (Separating Margin)</span>
            </div>
          </div>
        </div>

        {/* Training Dataset Breakdown */}
        <div className="p-6 rounded-3xl bg-[#0D1527] border border-[#1E2E52] space-y-5">
          <div className="border-b border-[#1E2E52]/60 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              Underlying Dataset (<code className="text-cyan-400">spam.csv</code>)
            </h3>
            <p className="text-xs text-slate-400">
              SMS & Email Spam Collection benchmark dataset distribution
            </p>
          </div>

          {datasetStats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#080E1C] border border-[#1E2E52] space-y-1">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                    Total Records
                  </span>
                  <span className="text-2xl font-black text-white">
                    {datasetStats.total_records.toLocaleString()}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-[#080E1C] border border-[#1E2E52] space-y-1">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                    Spam Ratio
                  </span>
                  <span className="text-2xl font-black text-rose-400">
                    {datasetStats.spam_percentage}%
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#080E1C] border border-[#1E2E52] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-slate-300 font-semibold">Legitimate (Ham)</span>
                  </div>
                  <span className="font-mono font-bold text-white">
                    {datasetStats.ham_count} records ({datasetStats.ham_percentage}%)
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${datasetStats.ham_percentage}%` }}
                  />
                  <div
                    className="h-full bg-rose-500"
                    style={{ width: `${datasetStats.spam_percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="text-slate-300 font-semibold">Spam Messages</span>
                  </div>
                  <span className="font-mono font-bold text-white">
                    {datasetStats.spam_count} records ({datasetStats.spam_percentage}%)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-400 pt-1">
                <div className="p-3 rounded-xl bg-[#070D1A] border border-[#1E2E52]/50">
                  <span className="block text-[10px] uppercase">Avg Ham Char Length</span>
                  <span className="font-mono font-bold text-slate-200 text-sm">
                    {datasetStats.avg_ham_length} chars
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#070D1A] border border-[#1E2E52]/50">
                  <span className="block text-[10px] uppercase">Avg Spam Char Length</span>
                  <span className="font-mono font-bold text-slate-200 text-sm">
                    {datasetStats.avg_spam_length} chars
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              Loading dataset statistics...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

