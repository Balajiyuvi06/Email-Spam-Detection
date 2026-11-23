import React, { useState, useMemo } from 'react';
import {
  History as HistoryIcon,
  Search,
  Filter,
  Trash2,
  Download,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  Clock,
  ArrowUpDown,
  Inbox,
  ExternalLink
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

export default function History({
  history,
  onRemoveEntry,
  onClearHistory,
  setActiveTab,
  onSelectScan
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'spam', 'ham'
  const [showClearModal, setShowClearModal] = useState(false);

  // Filtered and searched entries
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      // Type filter
      if (filterType === 'spam' && !item.isSpam) return false;
      if (filterType === 'ham' && item.isSpam) return false;

      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const inSubject = item.subject?.toLowerCase().includes(q);
      const inPreview = item.preview?.toLowerCase().includes(q);
      return inSubject || inPreview;
    });
  }, [history, filterType, searchQuery]);

  // Export to JSON
  const handleExportJSON = () => {
    if (!history.length) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `spam-detection-history-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0D1527] border border-[#1E2E52]">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <HistoryIcon className="w-5 h-5 text-cyan-400" />
            Detection History
          </h2>
          <p className="text-xs text-slate-400">
            Stored locally in browser storage &bull; {history.length} total entries recorded
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportJSON}
            disabled={!history.length}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#111C35] hover:bg-[#162444] border border-[#1E2E52] transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => setShowClearModal(true)}
            disabled={!history.length}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/30 transition-all disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search preview or subject..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D1527] border border-[#1E2E52] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white bg-[#0D1527] border border-[#1E2E52]'
            }`}
          >
            All Scans ({history.length})
          </button>
          <button
            onClick={() => setFilterType('spam')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'spam'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-white bg-[#0D1527] border border-[#1E2E52]'
            }`}
          >
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            Spam ({history.filter((h) => h.isSpam).length})
          </button>
          <button
            onClick={() => setFilterType('ham')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'ham'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white bg-[#0D1527] border border-[#1E2E52]'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Legitimate ({history.filter((h) => !h.isSpam).length})
          </button>
        </div>
      </div>

      {/* History Table / List */}
      {filteredHistory.length > 0 ? (
        <div className="rounded-3xl bg-[#0D1527] border border-[#1E2E52] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-[#1E2E52] bg-[#080E1C]/70">
                <tr>
                  <th className="py-3.5 px-5">Classification</th>
                  <th className="py-3.5 px-5">Message Subject & Preview</th>
                  <th className="py-3.5 px-5">Confidence</th>
                  <th className="py-3.5 px-5">Decision Score</th>
                  <th className="py-3.5 px-5">Timestamp</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2E52]/40 text-slate-300">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-[#111C35]/60 transition-colors">
                    {/* Badge */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          item.isSpam
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {item.isSpam ? (
                          <ShieldAlert className="w-3.5 h-3.5" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        )}
                        {item.label}
                      </span>
                    </td>

                    {/* Preview */}
                    <td className="py-4 px-5 max-w-sm md:max-w-md">
                      {item.subject && (
                        <div className="font-bold text-white text-xs truncate mb-0.5">
                          {item.subject}
                        </div>
                      )}
                      <p className="text-slate-400 line-clamp-2 leading-relaxed">
                        {item.preview}
                      </p>
                    </td>

                    {/* Confidence */}
                    <td className="py-4 px-5 whitespace-nowrap font-mono font-bold">
                      <span className={item.isSpam ? 'text-rose-400' : 'text-emerald-400'}>
                        {item.confidence ? `${item.confidence}%` : 'N/A'}
                      </span>
                    </td>

                    {/* Decision score */}
                    <td className="py-4 px-5 whitespace-nowrap font-mono text-slate-300">
                      {item.decisionScore !== null ? (
                        <span className={item.decisionScore > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                          {item.decisionScore > 0 ? `+${item.decisionScore}` : item.decisionScore}
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </td>

                    {/* Timestamp */}
                    <td className="py-4 px-5 whitespace-nowrap text-slate-400">
                      <div>
                        {new Date(item.timestamp).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => onRemoveEntry(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-16 rounded-3xl bg-[#0D1527] border border-[#1E2E52] flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <Inbox className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h4 className="text-base font-bold text-white">
              {searchQuery ? 'No Matching Records Found' : 'No History Recorded'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {searchQuery
                ? `No email scans match "${searchQuery}". Try adjusting your search term or filter.`
                : 'Scanned emails and SMS messages will automatically appear here with full classification results.'}
            </p>
          </div>
          {!searchQuery && (
            <button
              onClick={() => setActiveTab('analyzer')}
              className="mt-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md transition-colors"
            >
              Analyze An Email Now
            </button>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearModal}
        title="Clear Detection History"
        message="Are you sure you want to permanently clear all stored email detection records from your local browser storage? This action cannot be undone."
        confirmText="Clear All History"
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

