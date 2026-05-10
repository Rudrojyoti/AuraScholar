import React from 'react';
import { motion } from 'framer-motion';
import { UploadDropzone } from "@uploadthing/react";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const PdfUpload = ({ onUpload }) => {
  return (
    <motion.div
      className="flex items-center justify-center min-h-[60vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-full max-w-2xl p-8 border-2 border-dashed border-white/20 rounded-3xl transition-all duration-300 glass-card hover:border-indigo-400/50 hover:bg-white/5"
      >
        <h2 className="text-3xl font-bold text-white mb-3 font-display text-center">Upload Research Paper</h2>
        <p className="text-gray-400 text-center mb-8 font-sans text-lg">
          Powered by Uploadthing
        </p>

        <UploadDropzone
          endpoint="pdfUploader"
          url={`${API_BASE_URL}/uploadthing`}
          onClientUploadComplete={(res) => {
            // Do something with the response
            if (res && res.length > 0) {
              const file = res[0];
              onUpload({ url: file.url, name: file.name });
            }
          }}
          onUploadError={(error) => {
            // Do something with the error.
            alert(`ERROR! ${error.message}`);
          }}
          appearance={{
            button: "bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded",
            container: "bg-transparent border-none",
            label: "text-gray-300",
            allowedContent: "text-gray-500",
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default PdfUpload;

