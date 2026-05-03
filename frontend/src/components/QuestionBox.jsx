import React, { useState } from 'react';
import { motion } from 'framer-motion';

const QuestionBox = ({ onAsk, loading }) => {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim()) {
      onAsk(question);
      setQuestion('');
    }
  };

  return (
    <motion.div
      className="bg-gray-800/50 border border-gray-700 rounded-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <h3 className="text-xl font-bold text-white mb-4">❓ Ask a Question</h3>
      <p className="text-gray-400 text-sm mb-4">
        Ask anything about the paper. Answers are based only on the uploaded document.
      </p>
      
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="E.g., What is the main contribution of this paper?"
          className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
          disabled={loading}
        />
        <motion.button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-semibold disabled:opacity-50 transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? '⏳' : '🔍'}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default QuestionBox;
