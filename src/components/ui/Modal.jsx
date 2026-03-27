import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Reusable Premium Modal component following strict SaaS rules:
 * - absolute positioning (relative to app-main/sidebar area)
 * - centered flex container
 * - sibling backdrop
 * - dynamic viewport height handling
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = 'max-w-md', 
  showClose = true,
  showHeader = true,
  footer = null,
  noPadding = false
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed top-[var(--navbar-h)] left-[var(--sidebar-w)] w-[calc(100vw-var(--sidebar-w))] h-[calc(100dvh-var(--navbar-h))] z-[9999] flex items-center justify-center overflow-hidden pointer-events-auto p-4 transition-all duration-300">
          {/* Backdrop only in the workspace area */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm" 
            onClick={onClose} 
          />
          
          {/* Modal Content - PERFECTLY centered in workspace */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 15 }}
            className={`relative w-full ${maxWidth} bg-white border border-slate-200 rounded-3xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90%]`}
            onClick={(e) => e.stopPropagation()}
          >
            {showHeader && (
              <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-3">
                  {title}
                </h3>
                {showClose && (
                  <button 
                    onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            <div className={`overflow-y-auto flex-1 ${noPadding ? 'p-0' : 'p-6'}`}>
              {children}
            </div>

            {footer && (
              <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/20 flex justify-end gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
