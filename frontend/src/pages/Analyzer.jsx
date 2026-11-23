import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Send,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  Zap,
  Tag,
  Cpu,
  Layers,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function Analyzer({
  onAddHistory,
  initialText = '',
  initialSubject = '',
  backendOnline,
  setActiveTab
}) {
  const [subject, setSubject] = useState(initialSubject);
  const [text, setText] = useState(initialText);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const sampleMessages = [
    {
      type: 'spam',
      badge: 'Spam 🚨',
      title: 'Prize Notification',
      subject: 'Congratulations! Claim your £1000 prize',
      text: 'Congratulations! You have won a free prize. Click here now to claim your £1000 cash reward. Call 08002986030 now to confirm your code KL341.',
    },
    {
      type: 'spam',
      badge: 'Spam 🚨',
      title: 'Urgent Account Reward',
      subject: 'URGENT: Limited time reward voucher',
      text: 'WINNER!! As a valued customer you have been selected to receive a free gift voucher. Claim code WL29. Valid for 12 hours only. Reply CLAIM now.',
    },
    {
      type: 'spam',
      badge: 'Spam 🚨',
      title: 'Cash Jackpot Entry',
      subject: 'SIX chances to win CASH!',
      text: 'SIX chances to win CASH! From 100 to 20,000 pounds txt CSH11 and send to 87575. Cost 150p/day, 6days, 16+ TsandCs apply Reply HL 4 info.',
    },
    {
      type: 'ham',
      badge: 'Ham ✅',
      title: 'Team Meeting Notes',
      subject: 'Notes from Q3 Project Sync',
      text: 'Hi team, please find the meeting notes attached from today’s discussion. Let me know if you have any questions or feedback before Friday.',
    },
    {
      type: 'ham',
      badge: 'Ham ✅',
      title: 'Appointment Notice',
      subject: 'Appointment Scheduled',
      text: 'Your appointment is scheduled for tomorrow at 10 AM. Please bring your photo ID and arrive 10 minutes early.',
    },
    {
      type: 'ham',
      badge: 'Ham ✅',
      title: 'Report Request',
      subject: 'Project deliverables review',
      text: 'Can you send me the latest project report when you have time? We need to review the milestones before our client meeting.',
    },
  ];

  const handleApplySample = (sample) => {
    setSubject(sample.subject);
    setText(sample.text);
    setError(null);
    setResult(null);
  };

  const handleClear = () => {
    setSubject('');
    setText('');
    setError(null);
    setResult(null);
  };

  const handleAnalyze = async (e) => {
    e?.preventDefault();
    if (!text.trim() && !subject.trim()) {
      setError('Please provide email text or a subject to analyze.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await api.predict(text, subject);
      setResult(data);
      // Add to persistent history in localStorage
      if (onAddHistory) {
        onAddHistory(data, { text, subject });
      }
    } catch (err) {
      setError(err.message || 'An error occurred during prediction.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResult = () => {
    if (!result) return;
    const summary = `AegisSpam AI Result:\nClassification: ${result.label}\nConfidence: ${result.confidence}%\nDecision Score: ${result.decision_score}\nRisk: ${result.risk_level}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const charCount = (subject.length + text.length);
  const wordCount = (subject + ' ' + text).trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      {/* Sample Pills Section */}
      <div className="p-5 rounded-2xl bg-[#0D1527] border border-[#1E2E52] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Sample Email Payloads (Click to Load)
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Real samples tested with LinearSVC
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {sampleMessages.map((sample, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleApplySample(sample)}
              className={`p-2.5 text-left rounded-xl text-xs transition-all border ${
                sample.type === 'spam'
                  ? 'bg-[#140C1A] hover:bg-[#1F1029] border-rose-500/30 text-rose-300'
                  : 'bg-[#0A161E] hover:bg-[#0F2230] border-emerald-500/30 text-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-white">{sample.title}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    sample.type === 'spam'
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {sample.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">{sample.text}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form & Prediction Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Form (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0D1527] border border-[#1E2E52] shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-[#1E2E52]/60 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                Message Input
              </h3>
              <p className="text-xs text-slate-400">
                Paste raw email headers, subject lines, SMS text, or body content
              </p>
            </div>
            <button
              type="button"
              onClick={handleClear}
              disabled={loading || (!subject && !text)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <div className="space-y-1">
                <p className="font-bold">Prediction Failed</p>
                <p className="text-rose-300/90">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleAnalyze} className="space-y-4">
            {/* Optional Subject Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Subject <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. URGENT: Verify your reward or Meeting Agenda"
                className="w-full px-4 py-2.5 rounded-xl bg-[#080E1C] border border-[#1E2E52] text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
              />
            </div>

            {/* Email Body Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Email Body / Message Text <span className="text-rose-400">*</span>
                </label>
                <div className="text-[11px] text-slate-400 font-mono">
                  {charCount} chars &bull; {wordCount} words
                </div>
              </div>
              <textarea
                rows={9}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the email body, SMS text message, or suspicious communication here..."
                className="w-full p-4 rounded-2xl bg-[#080E1C] border border-[#1E2E52] text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans resize-none leading-relaxed"
              />
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Runs 5,000 TF-IDF features through LinearSVC</span>
              </div>

              <button
                type="submit"
                disabled={loading || (!text.trim() && !subject.trim())}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-950 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing Payload...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Analyze Email</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Prediction Results Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div
              className={`p-6 rounded-3xl border shadow-2xl transition-all duration-300 relative overflow-hidden ${
                result.is_spam
                  ? 'bg-gradient-to-b from-[#1C0E18] to-[#120810] border-rose-500/40 shadow-rose-950/40 glow-rose'
                  : 'bg-gradient-to-b from-[#091B1F] to-[#071318] border-emerald-500/40 shadow-emerald-950/40 glow-emerald'
              }`}
            >
              {/* Card Header & Badge */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-2xl ${
                      result.is_spam
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {result.is_spam ? (
                      <ShieldAlert className="w-7 h-7 animate-bounce" />
                    ) : (
                      <ShieldCheck className="w-7 h-7" />
                    )}
                  </div>
                  <div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        result.is_spam
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {result.is_spam ? 'Threat Detected' : 'Verified Ham'}
                    </span>
                    <h3 className="text-xl font-black text-white tracking-tight mt-1">
                      {result.label}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={handleCopyResult}
                  className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                  title="Copy result summary"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Message Explanation */}
              <div className="py-4 space-y-1">
                <p className="text-sm font-semibold text-white">{result.message}</p>
                <p className="text-xs text-slate-300/80 leading-relaxed">
                  {result.is_spam
                    ? 'The classifier identified linguistic patterns, promotional urgency, or prize indicators characteristic of spam messages.'
                    : 'The linguistic structure, vocabulary distribution, and phrasing align with legitimate personal or transactional emails.'}
                </p>
              </div>

              {/* Confidence & Decision Score Telemetry */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Model Confidence
                  </span>
                  <span
                    className={`text-base font-extrabold font-mono ${
                      result.is_spam ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {result.confidence}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 rounded-full ${
                      result.is_spam ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Decision Score
                    </span>
                    <span className="font-mono font-bold text-white text-xs">
                      {result.decision_score > 0 ? `+${result.decision_score}` : result.decision_score}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Inference Time
                    </span>
                    <span className="font-mono font-bold text-cyan-400 text-xs">
                      {result.inference_time_ms ? `${result.inference_time_ms} ms` : '< 1 ms'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Explainability Keywords / Top Influencing Tokens */}
              {result.top_tokens && result.top_tokens.length > 0 && (
                <div className="py-4 border-t border-white/10 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-cyan-400" />
                    Key Decision Features
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Terms extracted from the message that influenced the classification:
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {result.top_tokens.map((tokenObj, i) => (
                      <span
                        key={i}
                        className={`px-2 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1 ${
                          tokenObj.impact === 'spam'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        <span>{tokenObj.token}</span>
                        <span className="text-[10px] opacity-75">
                          ({tokenObj.weight > 0 ? `+${tokenObj.weight}` : tokenObj.weight})
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer as required by prompt */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5 text-[11px] text-slate-400 mt-2">
                <HelpCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <p className="leading-snug">
                  {result.disclaimer}
                </p>
              </div>
            </div>
          ) : (
            /* Standby / Empty State for Results */
            <div className="p-8 rounded-3xl bg-[#0D1527] border border-[#1E2E52] flex flex-col items-center justify-center text-center space-y-4 min-h-[380px]">
              <div className="w-16 h-16 rounded-3xl bg-[#080E1C] border border-[#1E2E52] flex items-center justify-center text-slate-500 shadow-inner">
                <ShieldCheck className="w-8 h-8 text-cyan-400/50" />
              </div>
              <div className="space-y-1.5 max-w-xs">
                <h4 className="text-base font-bold text-white">Ready for Analysis</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter message text on the left or select a sample payload to trigger real-time ML inference.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#080E1C]/80 border border-[#1E2E52]/60 text-left text-xs w-full space-y-2 mt-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Model Architecture
                </span>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Classifier</span>
                  <span className="font-semibold text-cyan-400">LinearSVC (C=10)</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Features</span>
                  <span className="font-mono text-slate-400">5,000 TF-IDF</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Confidence</span>
                  <span className="font-mono text-slate-400">Platt Sigmoid</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

