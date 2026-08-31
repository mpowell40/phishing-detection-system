import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Commenting out history-related states due to issues with onedrive transfer
  // const [showHistory, setShowHistory] = useState(false);
  // const [history, setHistory] = useState([]);
  // const [historyLoading, setHistoryLoading] = useState(false);

  // ❌ Commenting out fetchHistory call
  // useEffect(() => {
  //   fetchHistory();
  // }, []);

  // const fetchHistory = async () => {
  //   setHistoryLoading(true);
  //   try {
  //     const response = await axios.get('http://localhost:5000/history');
  //     setHistory(response.data);
  //   } catch (err) {
  //     setError('Failed to load history');
  //   } finally {
  //     setHistoryLoading(false);
  //   }
  // };

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

      // ❌ No history refresh
      // await fetchHistory();
    } catch (err) {
      setError('Error contacting the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl p-8 transition-all duration-300 hover:shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            ML Phishing Detector
          </h1>
          <p className="text-gray-600">
            Check URLs and messages for potential phishing threats
          </p>
        </div>

        {/* ===== Prediction Form ===== */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter a URL to check (optional)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Message Text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter message text to check"
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.01] ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Check for Phishing
              </>
            )}
          </button>
        </form>

        {/* History Toggle Button and Panel removed */}

        {error && (
          <div className="mt-6 p-4 bg-red-100 border-l-4 border-red-500 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* ===== Prediction Result ===== */}
        {result && (
          <div className={`mt-6 p-6 rounded-lg border-2 ${
            result.threat_level === 'High' ? 'bg-red-50 border-red-300' :
            result.threat_level === 'Medium' ? 'bg-amber-50 border-amber-300' :
            'bg-emerald-50 border-emerald-300'
          }`}>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
              Analysis Result
            </h2>
            <div className="space-y-3">
              <p className="flex items-center">
                <span className="font-medium text-gray-700 w-24">Label:</span>
                <span className="capitalize font-semibold text-gray-900">{result.label}</span>
              </p>
              <p className="flex items-center">
                <span className="font-medium text-gray-700 w-24">Confidence:</span>
                <span className="font-semibold text-gray-900">
                  {(result.probability * 100).toFixed(2)}%
                </span>
              </p>
              <p className="flex items-center">
                <span className="font-medium text-gray-700 w-24">Threat Level:</span>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  result.threat_level === 'High' ? 'bg-red-100 text-red-800' :
                  result.threat_level === 'Medium' ? 'bg-amber-100 text-amber-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {result.threat_level}
                </span>
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Trained using Logistic Regression and XGBClassifier Model</p>
        </div>
      </div>
    </div>
  );
}

export default App;
