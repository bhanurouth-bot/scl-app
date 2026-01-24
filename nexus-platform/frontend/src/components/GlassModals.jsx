import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle, Info, HelpCircle } from 'lucide-react';
import { GlassButton } from './GlassUI';

// --- 1. CONFIRMATION MODAL (Yes/No) ---
export const ConfirmationModal = ({ 
  isOpen, onClose, onConfirm, 
  title, message, 
  variant = 'danger', // 'danger' | 'warning' | 'info'
  isLoading 
}) => {
  if (!isOpen) return null;

  const colors = {
    danger: 'bg-red-500',
    warning: 'bg-orange-500',
    info: 'bg-blue-500'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#0a0a0a] border border-white/10 p-8 rounded-[2rem] w-full max-w-sm shadow-2xl relative overflow-hidden"
      >
        {/* Glow Line */}
        <div className={`absolute top-0 left-0 w-full h-1.5 ${colors[variant] || colors.info}`}></div>

        <div className="flex flex-col items-center text-center">
            <div className={`p-4 rounded-full mb-4 ${variant === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                {variant === 'danger' ? <AlertTriangle size={32} /> : <HelpCircle size={32} />}
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                {message}
            </p>
            
            <div className="flex gap-3 w-full">
                <GlassButton onClick={onClose} variant="ghost" className="flex-1">
                    Cancel
                </GlassButton>
                <GlassButton 
                    onClick={onConfirm} 
                    className={`flex-1 ${variant === 'danger' ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}`}
                    disabled={isLoading}
                >
                    {isLoading ? 'Processing...' : 'Confirm'}
                </GlassButton>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- 2. ALERT MODAL (Success/Error Message) ---
export const AlertModal = ({ isOpen, onClose, title, message, type = 'success' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
       <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#0a0a0a] border border-white/10 p-8 rounded-[2rem] w-full max-w-sm shadow-2xl relative text-center"
      >
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {type === 'success' ? <CheckCircle size={32} /> : <XCircle size={32} />}
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 mb-6">{message}</p>
        
        <GlassButton onClick={onClose} className="w-full bg-white/5 hover:bg-white/10">
            Okay, Got it
        </GlassButton>
      </motion.div>
    </div>
  );
};