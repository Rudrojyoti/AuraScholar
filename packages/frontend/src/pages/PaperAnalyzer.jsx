import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PdfUpload from '../components/PdfUpload';
import OutputTabs from '../components/OutputTabs';
import QuestionBox from '../components/QuestionBox';
import { Settings, ArrowLeft } from 'lucide-react';

const PaperAnalyzer = ({ userEmail, onLogout, onBackToDashboard, onOpenSettings }) => {
  const [uploadedPaper, setUploadedPaper] = useState(null);
  const [paperId, setPaperId] = useState(null);
  const [summary, setSummary] = useState('');
  const [methodology, setMethodology] = useState('');
  const [contributions, setContributions] = useState('');
  const [limitations, setLimitations] = useState('');
  const [futureWork, setFutureWork] = useState('');
  const [loading, setLoading] = useState(false);
  const [qaHistory, setQaHistory] = useState([]);

  const handlePdfUpload = async (file) => {
    setLoading(true);
    setUploadedPaper(file);
    setQaHistory([]);
    setPaperId(null);

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
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
        alert('Error parsing PDF: ' + result.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Network error while uploading PDF.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestion = async (question) => {
    if (!paperId) return alert('Please wait for the paper to finish processing.');
    
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId, question })
      });
      const result = await response.json();

      if (result.status === 'success') {
        setQaHistory([...qaHistory, { q: question, a: result.data.answer }]);
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Ask error:', error);
      alert('Network error while asking question.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur sticky top-0 z-40">
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                📄 Research Paper Analyzer
              </h1>
              <p className="text-gray-400 text-sm mt-1">AI-powered RAG system for deep paper insights</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            <button 
              onClick={onOpenSettings}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition"
            >
              <Settings size={20} />
            </button>
            <div className="text-right hidden sm:block border-l border-gray-700 pl-4">
              <p className="text-gray-300 text-sm">Logged in as</p>
              <p className="text-white font-semibold text-xs truncate max-w-xs">{userEmail}</p>
            </div>
            <motion.button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg transition"
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gradient-to-r from-gray-800/50 to-gray-800/20 border border-gray-700 rounded-lg p-4 gap-4">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm">📂 Current Paper</p>
                  <p className="text-white font-semibold text-lg truncate">{uploadedPaper.name}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Size: {(uploadedPaper.size / 1024 / 1024).toFixed(2)} MB
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
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition whitespace-nowrap"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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
                  className="bg-gray-800/50 border border-gray-700 rounded-lg p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">💬 Q&A History</h3>
                    <p className="text-gray-400 text-sm">{qaHistory.length} question{qaHistory.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {qaHistory.map((item, idx) => (
                      <motion.div
                        key={idx}
                        className="bg-gray-900/50 border-l-4 border-blue-500 pl-4 py-3 rounded-r"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <p className="text-blue-400 font-semibold text-sm">Q: {item.q}</p>
                        <p className="text-gray-300 mt-2 text-sm leading-relaxed">A: {item.a}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Stats Footer */}
              <motion.div
                className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">Paper Name</p>
                    <p className="text-white font-semibold text-sm truncate">{uploadedPaper.name}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">Questions Asked</p>
                    <p className="text-white font-semibold text-sm">{qaHistory.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">Status</p>
                    <p className="text-green-400 font-semibold text-sm">Ready</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">User</p>
                    <p className="text-white font-semibold text-sm truncate">{userEmail.split('@')[0]}</p>
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
