import React, { useState } from 'react';
import { motion } from 'framer-motion';

const OutputTabs = ({ summary, methodology, contributions, limitations, futureWork, loading }) => {
  const [activeTab, setActiveTab] = useState('summary');

  const tabs = [
    { id: 'summary', label: '📊 Summary', content: summary },
    { id: 'methodology', label: '🔬 Methodology', content: methodology },
    { id: 'contributions', label: '✨ Contributions', content: contributions },
    { id: 'limitations', label: '⚠️ Limitations', content: limitations },
    { id: 'future', label: '🚀 Future Work', content: futureWork }
  ];

  return (
    <motion.div
      className="glass-card rounded-2xl overflow-hidden shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex border-b border-white/10 bg-white/5 backdrop-blur-md overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-6 py-5 font-semibold transition-all whitespace-nowrap font-sans text-sm tracking-wide ${
              activeTab === tab.id
                ? 'text-indigo-300 border-b-2 border-indigo-500 bg-white/5'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      <div className="p-8 min-h-96">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <motion.div
              className="text-center"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="text-4xl mb-4">✨</div>
              <p className="text-gray-400 text-lg">Processing paper with AI...</p>
            </motion.div>
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {tabs.find((t) => t.id === activeTab)?.content ? (
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans text-base">
                {tabs.find((t) => t.id === activeTab)?.content}
              </div>
            ) : (
              <p className="text-gray-500 italic text-center mt-10">No content yet. Upload a paper to get started.</p>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default OutputTabs;
