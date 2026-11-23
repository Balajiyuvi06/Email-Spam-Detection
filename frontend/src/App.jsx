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
import { api } from './services/api';
import { AlertCircle } from 'lucide-react';

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
    // Poll backend health periodically every 25 seconds
    const interval = setInterval(checkBackendHealth, 25000);
    return () => clearInterval(interval);
  }, [checkBackendHealth]);

  const handleSelectSample = (text, subject = '') => {
    setInitialSample({ text, subject });
  };

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

        {/* Offline Warning Banner (if backend disconnected) */}
        {!backendOnline && (
          <div className="bg-rose-500/15 border-b border-rose-500/30 px-6 py-2.5 flex items-center justify-between text-xs text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>
                Backend server is currently offline. Start the Python Flask backend with{' '}
                <code className="bg-black/40 px-2 py-0.5 rounded font-mono text-white">python app.py</code> in the{' '}
                <code className="bg-black/40 px-2 py-0.5 rounded font-mono text-white">backend/</code> folder.
              </span>
            </div>
            <button
              onClick={checkBackendHealth}
              className="text-xs font-bold underline hover:text-white transition-colors"
            >
              Retry Connection
            </button>
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
