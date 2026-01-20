import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const GlassModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      
      {/* 1. The Backdrop (Darkens the Dashboard) */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* 2. The Window (Pop-up) */}
      <div className="relative w-full max-w-lg transform transition-all duration-300 scale-100 opacity-100">
        <div className="bg-nexus-dark/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
          
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-white/10 bg-white/5">
            <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 text-slate-200">
            {children}
          </div>

        </div>
      </div>
    </div>
  );
};

export default GlassModal;