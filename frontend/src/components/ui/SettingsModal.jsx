import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Sun, User, Bell } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose, userEmail }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900/50">
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Account</h3>
                <div className="flex items-center gap-4 bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{userEmail}</p>
                    <p className="text-sm text-gray-400">Pro Plan</p>
                  </div>
                </div>
              </div>

              {/* Preferences Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Preferences</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-800 hover:bg-gray-800/50 transition">
                    <div className="flex items-center gap-3 text-gray-300">
                      <Moon size={20} />
                      <span>Theme</span>
                    </div>
                    <div className="flex items-center bg-gray-900 rounded-lg p-1 border border-gray-700">
                      <button className="px-3 py-1 bg-gray-700 text-white rounded shadow-sm text-sm">Dark</button>
                      <button className="px-3 py-1 text-gray-400 hover:text-white rounded text-sm transition">Light</button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-800 hover:bg-gray-800/50 transition">
                    <div className="flex items-center gap-3 text-gray-300">
                      <Bell size={20} />
                      <span>Notifications</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-800 bg-gray-900/50 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
