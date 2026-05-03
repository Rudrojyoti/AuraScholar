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
        className={`w-full max-w-2xl p-12 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
          isDragActive
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-600 bg-gray-800/30 hover:border-blue-400'
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
          <h2 className="text-2xl font-bold text-white mb-2">Upload Research Paper</h2>
          <p className="text-gray-400 text-center mb-4">
            Drag and drop your PDF here or click to select
          </p>
          <motion.div
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Choose PDF
          </motion.div>
          <p className="text-gray-500 text-sm mt-4">PDF files only • Max size: 50MB</p>
        </label>
      </motion.div>
    </motion.div>
  );
};

export default PdfUpload;
