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
      className="glass-card rounded-2xl p-6 md:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <h3 className="text-2xl font-bold text-white mb-2 font-display">Ask a Question</h3>
      <p className="text-gray-400 text-sm mb-6 font-sans">
        Ask anything about the paper. Answers are based only on the uploaded document.
      </p>
      
      <form onSubmit={handleSubmit} className="flex gap-3 relative">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="E.g., What is the main contribution of this paper?"
          className="flex-1 px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all font-sans"
          disabled={loading}
        />
        <motion.button
          type="submit"
          disabled={loading}
          className="px-8 py-4 btn-primary rounded-xl font-semibold disabled:opacity-50 transition-all flex items-center justify-center min-w-[120px]"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Thinking...
            </span>
          ) : (
            'Ask AI'
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default QuestionBox;
