import React from 'react';
import { motion } from 'framer-motion';
import { InteractiveHoverButton } from '../components/ui/interactive-hover-button';
import { FileText, Clock, Settings, LogOut, Upload } from 'lucide-react';

const Dashboard = ({ userEmail, onLogout, onUploadNew, onOpenPaper, onOpenSettings }) => {
  // Mock data for previously uploaded papers
  const recentPapers = [
    { id: 1, name: "Attention Is All You Need.pdf", date: "2 hours ago", status: "Ready", size: "2.4 MB" },
    { id: 2, name: "Llama 3 Technical Report.pdf", date: "Yesterday", status: "Ready", size: "15.1 MB" },
    { id: 3, name: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks.pdf", date: "3 days ago", status: "Ready", size: "8.2 MB" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-gray-800 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <FileText className="text-white h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Paper Analysis Platform</h1>
          </motion.div>

          <div className="flex items-center gap-4">
            <button 
              onClick={onOpenSettings}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition"
            >
              <Settings size={20} />
            </button>
            <div className="h-6 w-px bg-gray-800 hidden sm:block"></div>
            <div className="hidden sm:flex items-center gap-3 pr-2">
              <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                <span className="text-sm font-medium">{userEmail?.charAt(0).toUpperCase() || 'U'}</span>
              </div>
              <span className="text-sm text-gray-300 font-medium truncate max-w-[150px]">{userEmail}</span>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-full transition"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
            <p className="text-gray-400">Manage your research papers or analyze a new one.</p>
          </div>
          <div onClick={onUploadNew}>
            <InteractiveHoverButton 
              text="Upload New Paper" 
              className="px-6 py-3 bg-white text-black font-semibold shadow-lg shadow-white/10"
            />
          </div>
        </motion.div>

        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-6 flex items-center gap-2">
            <Clock size={18} className="text-blue-400" /> Recent Papers
          </h3>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {recentPapers.map((paper) => (
              <motion.div
                key={paper.id}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => onOpenPaper(paper)}
                className="group cursor-pointer bg-gray-900/40 border border-gray-800 hover:border-blue-500/50 rounded-2xl p-6 backdrop-blur-sm transition-all shadow-xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <FileText className="text-blue-400 h-6 w-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                    {paper.status}
                  </span>
                </div>
                
                <h4 className="text-lg font-semibold text-white mb-2 line-clamp-2 leading-tight">
                  {paper.name}
                </h4>
                
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
                  <span className="text-xs text-gray-500">{paper.date}</span>
                  <span className="text-xs font-medium text-gray-400">{paper.size}</span>
                </div>
              </motion.div>
            ))}

            {/* Empty State / Upload Card */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              onClick={onUploadNew}
              className="cursor-pointer border-2 border-dashed border-gray-800 hover:border-gray-600 rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[220px] transition-colors bg-gray-900/20"
            >
              <div className="p-4 bg-gray-800 rounded-full mb-4 text-gray-400">
                <Upload size={24} />
              </div>
              <h4 className="text-lg font-medium text-gray-300 mb-1">Upload another paper</h4>
              <p className="text-sm text-gray-500">PDF up to 20MB</p>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
