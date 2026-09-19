import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
import PdfUpload from '../components/PdfUpload';
import OutputTabs from '../components/OutputTabs';
import QuestionBox from '../components/QuestionBox';
import { Settings, ArrowLeft } from 'lucide-react';

const PaperAnalyzer = ({ userEmail, onLogout, onBackToDashboard, onOpenSettings, getToken }) => {
  const [uploadedPaper, setUploadedPaper] = useState(null);
  const [paperId, setPaperId] = useState(null);
  const [summary, setSummary] = useState('');
  const [methodology, setMethodology] = useState('');
  const [contributions, setContributions] = useState('');
  const [limitations, setLimitations] = useState('');
  const [futureWork, setFutureWork] = useState('');
  const [loading, setLoading] = useState(false);
  const [qaHistory, setQaHistory] = useState([]);

  const handlePdfUpload = async (fileData) => {
    setLoading(true);
    setUploadedPaper(fileData);
    setQaHistory([]);
    setPaperId(null);

    try {
      const token = getToken ? await getToken() : null;
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          paperName: fileData.name,
          fileBase64: fileData.fileBase64,
          fileUrl: fileData.url,
          userId: userEmail || 'guest_user'
        }),
      });
      const result = await response.json();

      if (result.status === 'success') {
        setPaperId(result.data.paperId);
        setSummary(result.data.summary || 'Summary not available.');
        setMethodology(result.data.methodology || 'Methodology not available.');
        setContributions('Available in later phases...');
        setLimitations('Available in later phases...');
        setFutureWork('Available in later phases...');
      } else {
        alert('Error parsing PDF: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Network error while processing PDF. Please verify backend is running on port 3001.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestion = async (question) => {
    if (!paperId) return alert('Please wait for the paper to finish processing.');

    setLoading(true);

    try {
      const token = getToken ? await getToken() : null;
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          paperId, 
          question,
          userId: userEmail || 'guest_user'
        })
      });
      const result = await response.json();

      if (result.status === 'success') {
        setQaHistory(prev => [...prev, { q: question, a: result.data.answer }]);
      } else {
        alert('Error: ' + (result.message || 'Could not answer question.'));
      }
    } catch (error) {
      console.error('Ask error:', error);
      alert('Network error while asking question.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-sans">
      {/* Abstract background shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="glass-panel sticky top-0 z-40 border-b-0 rounded-b-2xl mb-6 mx-4 mt-2">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <button
              onClick={onBackToDashboard}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold font-display text-gradient">
                Research Paper Analyzer
              </h1>
              <p className="text-gray-400 text-sm mt-1 font-sans">Powered by Qwen 3.8 AI & Vector Analysis</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenSettings}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition"
            >
              <Settings size={20} />
            </button>
            <div className="text-right hidden sm:block border-l border-white/10 pl-4">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Logged in as</p>
              <p className="text-white font-medium text-sm truncate max-w-xs">{userEmail || 'Guest Researcher'}</p>
            </div>
            <motion.button
              onClick={onLogout}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition border border-red-500/20 backdrop-blur-sm font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Logout
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {!uploadedPaper ? (
            <motion.div
              key="upload-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PdfUpload onUpload={handlePdfUpload} />
            </motion.div>
          ) : (
            <motion.div
              key="analyzer-view"
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Paper Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between glass-card rounded-2xl p-6 gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none" />
                <div className="flex-1 z-10">
                  <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-1">Current Paper</p>
                  <p className="text-white font-bold text-xl font-display truncate">{uploadedPaper.name}</p>
                  <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-400"></span>
                    Ready for Analysis
                  </p>
                </div>
                <motion.button
                  onClick={() => {
                    setUploadedPaper(null);
                    setSummary('');
                    setMethodology('');
                    setContributions('');
                    setLimitations('');
                    setFutureWork('');
                    setQaHistory([]);
                  }}
                  className="px-6 py-2.5 btn-secondary rounded-xl font-medium whitespace-nowrap z-10"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Upload Different
                </motion.button>
              </div>

              {/* Analysis Tabs */}
              <OutputTabs
                summary={summary}
                methodology={methodology}
                contributions={contributions}
                limitations={limitations}
                futureWork={futureWork}
                loading={loading}
              />

              {/* Question Box */}
              <QuestionBox onAsk={handleQuestion} loading={loading} />

              {/* Q&A History */}
              {qaHistory.length > 0 && (
                <motion.div
                  className="glass-card rounded-2xl p-6 md:p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                    <h3 className="text-2xl font-bold font-display text-white">Discussion History</h3>
                    <div className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
                      {qaHistory.length} Exchange{qaHistory.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="space-y-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {qaHistory.map((item, idx) => (
                      <motion.div
                        key={idx}
                        className="glass-panel p-5 rounded-xl border-l-4 border-l-indigo-500"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <p className="text-indigo-300 font-semibold text-sm mb-2 font-sans flex items-start gap-2">
                          <span className="bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded text-xs">Q</span> 
                          {item.q}
                        </p>
                        <div className="text-gray-300 text-sm leading-relaxed font-sans pl-6 border-l border-white/5 ml-3">
                          {item.a}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Stats Footer */}
              <motion.div
                className="glass-card rounded-2xl p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 divide-x divide-white/5">
                  <div className="text-center px-4">
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Paper</p>
                    <p className="text-white font-medium text-sm truncate font-display">{uploadedPaper.name}</p>
                  </div>
                  <div className="text-center px-4">
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Interactions</p>
                    <p className="text-white font-medium text-sm font-display text-2xl">{qaHistory.length}</p>
                  </div>
                  <div className="text-center px-4">
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Status</p>
                    <div className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-semibold">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                      Ready
                    </div>
                  </div>
                  <div className="text-center px-4">
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">User</p>
                    <p className="text-white font-medium text-sm truncate font-display">{(userEmail || 'researcher').split('@')[0]}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default PaperAnalyzer;
