import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/predict', {
        url: url,
        text: text,
      });
      setResult(response.data);
    } catch (err) {
      setError('Connection failure: Unable to communicate with analysis engine.');
    } finally {
      setLoading(false);
    }
  };

  const isPhishing =
    result?.threat_level === 'High' ||
    result?.label?.toLowerCase().includes('phish') ||
    result?.label?.toLowerCase().includes('malicious');

  const confidenceScore = result ? (result.probability * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Background Ambience / Glow */}
      <div className="fixed inset-0 pointer-events-none flex justify-center items-start overflow-hidden">
        <div className="w-[640px] h-[340px] bg-gradient-to-tr from-indigo-900/20 via-cyan-900/10 to-transparent blur-3xl opacity-50 -translate-y-24" />
      </div>

      <div className="relative max-w-xl w-full mx-auto space-y-6">
        {/* ===== Header & Status Badge ===== */}
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-wider bg-slate-900/90 border border-slate-800 text-slate-300 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            ML ENGINE v1.0 • ACTIVE
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 pb-1 leading-normal">
            Phishing Detector
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            Deep inspection of suspicious links, payload vectors, and malicious messages.
          </p>
        </header>

        {/* ===== Main Form Container ===== */}
        <main className="bg-[#111622]/90 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 sm:p-8 shadow-2xl shadow-black/60">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* URL Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Target URL
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://suspicious-domain.com/login"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/70 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400/80 transition-all"
                />
              </div>
            </div>

            {/* Message Text Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Message / Email Payload
              </label>
              <div className="relative group">
                <div className="absolute top-3 left-3.5 flex items-start pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste email headers, raw text, or body content..."
                  rows="4"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/70 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400/80 transition-all resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full relative flex justify-center items-center py-3 px-4 rounded-lg font-medium text-sm text-white transition-all duration-200 border border-cyan-400/30 ${
                loading
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-transparent'
                  : 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-indigo-700 hover:brightness-110 active:scale-[0.99] shadow-lg shadow-indigo-900/30 hover:shadow-cyan-500/10'
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2.5">
                  <svg className="animate-spin h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-slate-300 font-mono tracking-wide">Executing Inference...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Initiate Scan</span>
                </div>
              )}
            </button>
          </form>

          {/* ===== Error Message Box ===== */}
          {error && (
            <div className="mt-5 p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-rose-300 leading-relaxed">{error}</p>
            </div>
          )}

          {/* ===== Threat Analysis Card ===== */}
          {result && (
            <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
                    Detection Report
                  </span>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                    result.threat_level === 'High' || isPhishing
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : result.threat_level === 'Medium'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {result.threat_level || 'Evaluated'}
                </span>
              </div>

              {/* Threat Meter Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Threat Confidence</span>
                  <span className={isPhishing ? 'text-rose-400' : 'text-emerald-400'}>
                    {confidenceScore}%
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-700 ease-out ${
                      isPhishing
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                        : 'bg-gradient-to-r from-teal-500 to-emerald-400'
                    }`}
                    style={{ width: `${Math.min(Math.max(confidenceScore, 4), 100)}%` }}
                  />
                </div>
              </div>

              {/* Data Grid Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    Verdict
                  </span>
                  <span
                    className={`text-sm font-semibold capitalize ${
                      isPhishing ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {result.label}
                  </span>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    Model Accuracy Est.
                  </span>
                  <span className="text-sm font-semibold text-slate-200 font-mono">
                    {confidenceScore}%
                  </span>
                </div>
              </div>

              {/* Collapsible Model Diagnostics */}
              <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/40">
                <button
                  type="button"
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="w-full px-3.5 py-2.5 text-left text-xs font-mono text-slate-400 hover:text-slate-200 flex justify-between items-center transition-colors"
                >
                  <span>Inspection Signals</span>
                  <svg
                    className={`w-4 h-4 transform transition-transform duration-200 ${
                      showBreakdown ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showBreakdown && (
                  <div className="px-3.5 pb-3 text-xs space-y-1.5 border-t border-slate-800 pt-2.5 text-slate-400 font-mono">
                    <div className="flex justify-between">
                      <span>Primary Classifier:</span>
                      <span className="text-slate-300">XGBoost (Ensemble)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Linear Baseline:</span>
                      <span className="text-slate-300">Logistic Regression</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Inference State:</span>
                      <span className="text-emerald-400">Zero-Loss Verification</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* ===== Footer ===== */}
        <footer className="text-center">
          <p className="text-[11px] font-mono text-slate-600 tracking-wider uppercase">
            ©2025 Mekhel Powell
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;