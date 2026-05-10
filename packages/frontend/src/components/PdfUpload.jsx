import React, { useState } from 'react';
import { motion } from 'framer-motion';

const PdfUpload = ({ onUpload }) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      onUpload(file);
    } else {
      alert('Please upload a valid PDF file');
    }
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <motion.div
      className="flex items-center justify-center min-h-[60vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={`w-full max-w-2xl p-12 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 glass-card ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-500/10 scale-105 shadow-[0_0_40px_rgba(99,102,241,0.2)]'
            : 'border-white/20 hover:border-indigo-400/50 hover:bg-white/5'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleChange}
          className="hidden"
          id="pdf-input"
        />
        <label htmlFor="pdf-input" className="flex flex-col items-center justify-center cursor-pointer">
          <motion.div
            className="text-6xl mb-4"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            📄
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-3 font-display">Upload Research Paper</h2>
          <p className="text-gray-400 text-center mb-8 font-sans text-lg">
            Drag and drop your PDF here or click to select
          </p>
          <motion.div
            className="px-8 py-4 btn-primary rounded-xl font-semibold tracking-wide"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Choose PDF
          </motion.div>
          <p className="text-gray-500 text-sm mt-6 font-medium">PDF files only • Max size: 50MB</p>
        </label>
      </motion.div>
    </motion.div>
  );
};

export default PdfUpload;
