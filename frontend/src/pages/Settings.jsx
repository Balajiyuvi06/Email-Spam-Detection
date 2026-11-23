import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Server,
  Database,
  Trash2,
  RefreshCw,
  Check,
  AlertTriangle,
  Info,
  ExternalLink,
  Shield,
  Activity,
  Cpu
} from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl, api } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

export default function Settings({
  backendOnline,
  modelInfo,
  onClearHistory,
  historyCount,
  onRefreshHealth
}) {
  const [apiUrl, setApiUrlState] = useState(getApiBaseUrl());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const handleSaveApiUrl = (e) => {
    e.preventDefault();
    const updated = setApiBaseUrl(apiUrl.trim());
    setApiUrlState(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    onRefreshHealth();
  };

  const handleResetDefaultUrl = () => {
    const defaultUrl = setApiBaseUrl(null);
    setApiUrlState(defaultUrl);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    onRefreshHealth();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const updated = setApiBaseUrl(apiUrl.trim());
    setApiUrlState(updated);
    const start = performance.now();
    try {
      const data = await api.checkHealth();
      const latency = Math.round(performance.now() - start);
      setTestResult({
        success: true,
        latency,
        message: `Connected successfully to ${updated}! Response time: ${latency}ms. Model status: ${data.model_loaded ? 'Loaded' : 'Not Loaded'}`,
      });
      onRefreshHealth();
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message || 'Connection failed. If hosted on Render, please allow ~30s for the free tier service to wake up.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="p-6 rounded-3xl bg-[#0D1527] border border-[#1E2E52]">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <SettingsIcon className="w-5 h-5 text-cyan-400" />
          System Settings & Environment
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure REST API connection, verify machine learning service health, and manage local data
        </p>
      </div>

      <div className="space-y-6">
        {/* Section 1: Backend Connection Config */}
        <div className="p-6 rounded-3xl bg-[#0D1527] border border-[#1E2E52] space-y-4">
          <div className="border-b border-[#1E2E52]/60 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                Backend REST API Endpoint
              </h3>
              <p className="text-xs text-slate-400">
                Configure the HTTP endpoint used by React to communicate with the Flask API
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                backendOnline
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                }`}
              />
              {backendOnline ? 'API Online' : 'API Offline'}
            </span>
          </div>

          <form onSubmit={handleSaveApiUrl} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                API Base URL
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrlState(e.target.value)}
                  placeholder="http://localhost:5000/api"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#080E1C] border border-[#1E2E52] text-white text-xs font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  {saveSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : null}
                  <span>{saveSuccess ? 'Saved' : 'Save URL'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Tip: Enter your live backend URL (e.g. <code className="text-cyan-400">https://email-spam-api-et0p.onrender.com/api</code>). If you omit <code className="text-cyan-400">/api</code>, it will be added automatically.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#111C35] hover:bg-[#162444] border border-[#1E2E52] transition-colors flex items-center gap-2"
              >
                <Activity className={`w-3.5 h-3.5 text-cyan-400 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Testing Ping...' : 'Test Connection'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefaultUrl}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
              >
                Reset to Default (localhost:5000)
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3.5 rounded-xl text-xs border flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                }`}
              >
                {testResult.success ? (
                  <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </form>
        </div>

        {/* Section 2: Model Status */}
        <div className="p-6 rounded-3xl bg-[#0D1527] border border-[#1E2E52] space-y-4">
          <div className="border-b border-[#1E2E52]/60 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Machine Learning Engine Telemetry
            </h3>
            <p className="text-xs text-slate-400">Status of the pickled model loaded on server startup</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#080E1C] border border-[#1E2E52] space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Classifier</span>
              <span className="font-bold text-cyan-400 text-sm">LinearSVC</span>
              <span className="block text-[11px] text-slate-400">Regularization C=10</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#080E1C] border border-[#1E2E52] space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Vectorizer</span>
              <span className="font-bold text-white text-sm">TF-IDF Vectorizer</span>
              <span className="block text-[11px] text-slate-400">5,000 N-Gram Features</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#080E1C] border border-[#1E2E52] space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Decision Function</span>
              <span className="font-bold text-emerald-400 text-sm">Platt Calibrated</span>
              <span className="block text-[11px] text-slate-400">Sigmoid probability</span>
            </div>
          </div>
        </div>

        {/* Section 3: Data & Storage Management */}
        <div className="p-6 rounded-3xl bg-[#0D1527] border border-[#1E2E52] space-y-4">
          <div className="border-b border-[#1E2E52]/60 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-rose-400" />
              Local Storage & Privacy Management
            </h3>
            <p className="text-xs text-slate-400">
              Clear all locally stored email detection items from your browser storage
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#080E1C] border border-[#1E2E52]">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white">Detection History Store</h4>
              <p className="text-[11px] text-slate-400">
                Currently storing <span className="text-cyan-400 font-semibold">{historyCount}</span> scan records in LocalStorage.
              </p>
            </div>

            <button
              onClick={() => setShowClearModal(true)}
              disabled={historyCount === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/30 transition-all disabled:opacity-40 flex items-center gap-2 justify-center"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Wipe History Cache</span>
            </button>
          </div>
        </div>

        {/* Section 4: Application Information */}
        <div className="p-6 rounded-3xl bg-[#0D1527] border border-[#1E2E52] space-y-3 text-xs text-slate-400">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            Software Architecture & Specifications
          </h3>
          <p className="leading-relaxed">
            <strong className="text-slate-200">AegisSpam AI</strong> is a full-stack cybersecurity application designed to detect malicious phishing and unsolicited spam emails. Predictions are computed exclusively through genuine scikit-learn Linear Support Vector Classifier inference without artificial or hardcoded results.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-mono">
            <div className="p-2 rounded-lg bg-[#080E1C] border border-[#1E2E52]">
              <span className="text-slate-400 block text-[10px]">Frontend</span>
              <span className="text-slate-200">React 19 + Vite 8</span>
            </div>
            <div className="p-2 rounded-lg bg-[#080E1C] border border-[#1E2E52]">
              <span className="text-slate-400 block text-[10px]">Styling</span>
              <span className="text-slate-200">Tailwind CSS v4</span>
            </div>
            <div className="p-2 rounded-lg bg-[#080E1C] border border-[#1E2E52]">
              <span className="text-slate-400 block text-[10px]">Backend</span>
              <span className="text-slate-200">Flask 3.1 REST API</span>
            </div>
            <div className="p-2 rounded-lg bg-[#080E1C] border border-[#1E2E52]">
              <span className="text-slate-400 block text-[10px]">ML Library</span>
              <span className="text-slate-200">Scikit-Learn 1.6+</span>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showClearModal}
        title="Wipe Local Detection Cache"
        message="Are you sure you want to delete all stored email scan records from your browser? This action will reset your Dashboard KPI counters and telemetry graphs to zero."
        confirmText="Confirm Wipe"
        isDanger={true}
        onConfirm={() => {
          onClearHistory();
          setShowClearModal(false);
        }}
        onCancel={() => setShowClearModal(false)}
      />
    </div>
  );
}

