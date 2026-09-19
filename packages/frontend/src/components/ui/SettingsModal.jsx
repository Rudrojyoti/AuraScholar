import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserProfile from '../../pages/UserProfile';

const SettingsModal = ({ isOpen, onClose, userEmail }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-[#030308]"
        >
          <UserProfile
            userEmail={userEmail}
            onBack={onClose}
            onLogout={onClose}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
