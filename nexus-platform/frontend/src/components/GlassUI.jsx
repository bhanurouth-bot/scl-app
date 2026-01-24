import React from 'react';
import { motion } from 'framer-motion';

// --- BUTTON ---
export const GlassButton = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg border border-white/10 backdrop-blur-md";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20",
    success: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20",
    danger: "bg-red-600 hover:bg-red-500 text-white shadow-red-900/20",
    ghost: "bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// --- INPUT ---
export const GlassInput = ({ icon: Icon, ...props }) => (
  <div className="relative group w-full">
    {Icon && <Icon className="absolute left-4 top-3.5 text-gray-500 w-5 h-5 group-focus-within:text-blue-400 transition-colors pointer-events-none" />}
    <input 
      className={`w-full bg-black/20 border border-white/10 rounded-xl py-3 text-white placeholder-gray-600 focus:outline-none focus:bg-black/40 focus:border-blue-500/50 transition-all ${Icon ? 'pl-12 pr-4' : 'px-4'}`}
      {...props}
    />
  </div>
);

// --- SELECT ---
export const GlassSelect = ({ children, ...props }) => (
  <div className="relative w-full">
    <select 
      className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white appearance-none focus:outline-none focus:bg-black/40 focus:border-blue-500/50 transition-all cursor-pointer [&>option]:bg-gray-900"
      {...props}
    >
      {children}
    </select>
    {/* Custom Arrow */}
    <div className="absolute right-4 top-3.5 pointer-events-none text-gray-500">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
    </div>
  </div>
);

// --- SKELETON LOADER ---
export const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`}></div>
);