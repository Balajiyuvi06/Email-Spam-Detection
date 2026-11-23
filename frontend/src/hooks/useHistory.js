import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'aegis_spam_detection_history_v1';

export function useHistory() {
  const [history, setHistory] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const saveHistory = useCallback((items) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      setHistory(items);
    } catch (e) {
      console.error('Failed to save prediction history to localStorage', e);
    }
  }, []);

  const addEntry = useCallback((predictionResult, originalInput) => {
    const previewLength = 160;
    const bodyPreview =
      originalInput.text.length > previewLength
        ? `${originalInput.text.slice(0, previewLength)}...`
        : originalInput.text;

    const newEntry = {
      id: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      subject: originalInput.subject?.trim() || null,
      preview: bodyPreview,
      isSpam: predictionResult.is_spam,
      label: predictionResult.label,
      confidence: predictionResult.confidence,
      decisionScore: predictionResult.decision_score,
      riskLevel: predictionResult.risk_level,
      charCount: predictionResult.char_count,
      wordCount: predictionResult.word_count,
      topTokens: predictionResult.top_tokens || [],
      inferenceTimeMs: predictionResult.inference_time_ms || null,
    };

    setHistory((prev) => {
      const updated = [newEntry, ...prev].slice(0, 500); // Keep max 500 scans
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving updated history:', err);
      }
      return updated;
    });

    return newEntry;
  }, []);

  const removeEntry = useCallback((id) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Error removing history entry:', err);
      }
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHistory([]);
    } catch (err) {
      console.error('Error clearing history:', err);
    }
  }, []);

  // Compute metrics from actual history data
  const stats = {
    total: history.length,
    spamCount: history.filter((h) => h.isSpam).length,
    legitimateCount: history.filter((h) => !h.isSpam).length,
    spamRate: history.length
      ? Math.round((history.filter((h) => h.isSpam).length / history.length) * 100)
      : 0,
    avgConfidence: history.length
      ? Math.round(
          history.reduce((acc, h) => acc + (h.confidence || 0), 0) / history.length
        )
      : 0,
  };

  return {
    history,
    stats,
    addEntry,
    removeEntry,
    clearHistory,
  };
}

