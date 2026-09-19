import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';

const PdfUpload = ({ onUpload }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [processing, setProcessing] = useState(false);

  const processFile = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      alert('Please upload a valid PDF document.');
      return;
    }

    setSelectedFile(file);
    setProcessing(true);

    const reader = new FileReader();
    reader.onload = () => {
      setProcessing(false);
      onUpload({
        name: file.name,
        size: file.size,
        fileBase64: reader.result
      });
    };
    reader.onerror = () => {
      setProcessing(false);
      alert('Failed to read the PDF file locally.');
    };
    reader.readAsDataURL(file);
  };

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
    if (file) {
      processFile(file);
    }
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
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
        className={`w-full max-w-2xl p-12 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 glass-card text-center ${
          isDragActive
            ? 'border-indigo-400 bg-indigo-500/10 scale-105 shadow-[0_0_40px_rgba(99,102,241,0.3)]'
            : 'border-white/20 hover:border-indigo-400/50 hover:bg-white/5'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
      >
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleChange}
          className="hidden"
          id="pdf-upload-input"
          disabled={processing}
        />
        <label htmlFor="pdf-upload-input" className="cursor-pointer block">
          <motion.div
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {processing ? (
              <div className="w-8 h-8 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            ) : selectedFile ? (
              <CheckCircle2 size={40} className="text-green-400" />
            ) : (
              <Upload size={36} />
            )}
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-3 font-display">
            {processing ? "Reading PDF..." : selectedFile ? selectedFile.name : "Upload Research Paper"}
          </h2>
          <p className="text-gray-400 text-center mb-8 font-sans text-base max-w-md mx-auto">
            {processing
              ? "Preparing document for AI analysis..."
              : "Drag and drop your PDF research paper here, or click to browse"}
          </p>

          <div className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25 transition">
            <FileText size={18} />
            {selectedFile ? "Choose Another PDF" : "Select PDF Document"}
          </div>

          <p className="text-gray-500 text-xs mt-6 font-medium">Supports all research paper PDFs up to 50MB</p>
        </label>
      </motion.div>
    </motion.div>
  );
};

export default PdfUpload;
