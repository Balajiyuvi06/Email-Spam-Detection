import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Analyzer from './pages/Analyzer';
import History from './pages/History';
import Analytics from './pages/Analytics';
import AboutModel from './pages/AboutModel';
import Settings from './pages/Settings';
import { useHistory } from './hooks/useHistory';
import { api, getApiBaseUrl } from './services/api';
import { AlertCircle, Globe, Settings as SettingsIcon, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [initialSample, setInitialSample] = useState({ text: '', subject: '' });

  const { history, stats, addEntry, removeEntry, clearHistory } = useHistory();

  const checkBackendHealth = useCallback(async () => {
    setIsCheckingHealth(true);
    try {
      const data = await api.checkHealth();
      setBackendOnline(data.status === 'healthy');
      if (data.model_info) {
        setModelInfo(data.model_info);
      }
    } catch (err) {
      setBackendOnline(false);
    } finally {
      setIsCheckingHealth(false);
    }
  }, []);

  useEffect(() => {
    checkBackendHealth();
    // Poll backend health periodically every 20 seconds
    const interval = setInterval(checkBackendHealth, 20000);
    return () => clearInterval(interval);
  }, [checkBackendHealth]);

  const handleSelectSample = (text, subject = '') => {
    setInitialSample({ text, subject });
  };

  const currentApiUrl = getApiBaseUrl();
  const isHostedOnline =
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1';
  const isApiTargetingLocalhost =
    currentApiUrl.includes('localhost') || currentApiUrl.includes('127.0.0.1');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070B14] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Collapsible Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        backendOnline={backendOnline}
        totalScans={history.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          backendOnline={backendOnline}
          modelInfo={modelInfo}
          onRefreshHealth={checkBackendHealth}
          isCheckingHealth={isCheckingHealth}
        />

        {/* Offline Warning Banner with context-aware guidance */}
        {!backendOnline && (
          <div className="bg-gradient-to-r from-rose-950/80 via-rose-900/60 to-[#120810] border-b border-rose-500/30 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-200 shadow-md">
            <div className="flex items-start sm:items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5 sm:mt-0" />
              {isHostedOnline && isApiTargetingLocalhost ? (
                <span>
                  <strong>Deployed Website Detected:</strong> Your frontend is hosted online, but still points to <code className="bg-black/50 px-1.5 py-0.5 rounded font-mono text-cyan-300">{currentApiUrl}</code>. Enter your live Render backend URL in <strong>Settings</strong> so predictions can connect!
                </span>
              ) : (
                <span>
                  <strong>Backend Offline:</strong> Cannot reach API at <code className="bg-black/50 px-1.5 py-0.5 rounded font-mono text-cyan-300">{currentApiUrl}</code>. If running locally, start it with <code className="bg-black/50 px-1.5 py-0.5 rounded font-mono text-white">python app.py</code> in the <code className="bg-black/50 px-1.5 py-0.5 rounded font-mono text-white">backend/</code> folder. (If hosted on Render, free-tier services wake up after ~30s).
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isHostedOnline && isApiTargetingLocalhost && (
                <button
                  onClick={() => setActiveTab('settings')}
                  className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <SettingsIcon className="w-3.5 h-3.5" />
                  <span>Configure URL in Settings</span>
                </button>
              )}
              <button
                onClick={checkBackendHealth}
                disabled={isCheckingHealth}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin' : ''}`} />
                <span>Retry</span>
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              stats={stats}
              history={history}
              setActiveTab={setActiveTab}
              onSelectSample={handleSelectSample}
              backendOnline={backendOnline}
            />
          )}

          {activeTab === 'analyzer' && (
            <Analyzer
              onAddHistory={addEntry}
              initialText={initialSample.text}
              initialSubject={initialSample.subject}
              backendOnline={backendOnline}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'history' && (
            <History
              history={history}
              onRemoveEntry={removeEntry}
              onClearHistory={clearHistory}
              setActiveTab={setActiveTab}
              onSelectScan={(scan) => {
                setInitialSample({ text: scan.preview, subject: scan.subject || '' });
                setActiveTab('analyzer');
              }}
            />
          )}

          {activeTab === 'analytics' && (
            <Analytics
              history={history}
              stats={stats}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'about' && <AboutModel />}

          {activeTab === 'settings' && (
            <Settings
              backendOnline={backendOnline}
              modelInfo={modelInfo}
              onClearHistory={clearHistory}
              historyCount={history.length}
              onRefreshHealth={checkBackendHealth}
            />
          )}
        </main>
      </div>
    </div>
  );
}
