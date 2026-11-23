/**
 * Centralized API service for communicating with the Flask machine learning backend.
 */

const DEFAULT_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const normalizeApiUrl = (url) => {
  if (!url) return '';
  let clean = url.trim().replace(/\/+$/, '');
  // Automatically append /api if the user provided the root domain (e.g., https://service.onrender.com)
  if (!clean.endsWith('/api')) {
    clean = `${clean}/api`;
  }
  return clean;
};

export const getApiBaseUrl = () => {
  const stored = localStorage.getItem('email_spam_api_url');
  if (stored && stored.trim()) {
    return normalizeApiUrl(stored);
  }
  return normalizeApiUrl(DEFAULT_API_URL);
};

export const setApiBaseUrl = (url) => {
  if (url && url.trim()) {
    const cleanUrl = normalizeApiUrl(url);
    localStorage.setItem('email_spam_api_url', cleanUrl);
    return cleanUrl;
  } else {
    localStorage.removeItem('email_spam_api_url');
    return normalizeApiUrl(DEFAULT_API_URL);
  }
};

async function request(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.error || `Server responded with status ${res.status}`;
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error(
        `Cannot connect to backend server at ${baseUrl}. Ensure your backend service is live and reachable.`
      );
    }
    throw err;
  }
}

export const api = {
  checkHealth: () => request('/health'),
  predict: (text, subject = '') =>
    request('/predict', {
      method: 'POST',
      body: JSON.stringify({ text, subject }),
    }),
  getModelInfo: () => request('/model-info'),
  getDatasetStats: () => request('/dataset-stats'),
  getSamples: () => request('/samples'),
};
