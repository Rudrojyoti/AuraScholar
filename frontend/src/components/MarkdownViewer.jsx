import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

const MarkdownViewer = ({ file }) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch(`/assets/${file}`)
      .then((res) => res.text())
      .then(setContent)
      .catch((err) => console.error('Failed to load markdown', err));
  }, [file]);

  return (
    <motion.div
      className="prose dark:prose-invert max-w-none p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </motion.div>
  );
};

export default MarkdownViewer;
