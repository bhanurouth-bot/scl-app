import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers, Calendar, Users, Zap } from 'lucide-react';
import api from './api';

const BulkInvoiceModal = ({ isOpen, onClose, onSuccess }) => {
  const [classrooms, setClassrooms] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form Data
  const [formData, setFormData] = useState({
    classroom: '',
    academic_year: '',
    due_date: ''
  });

  // Fetch Dropdowns
  useEffect(() => {
    if (isOpen) {
      const load = async () => {
        try {
          const [clsRes, yearRes] = await Promise.all([
            api.get('core/classrooms/'),
            api.get('core/years/')
          ]);
          setClassrooms(clsRes.data);
          setYears(yearRes.data);
          
          // Auto-select current year
          const active = yearRes.data.find(y => y.is_current);
          if (active) setFormData(prev => ({ ...prev, academic_year: active.id }));
        } catch (err) {
          console.error(err);
        }
      };
      load();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.classroom || !formData.academic_year || !formData.due_date) {
        alert("Please fill all fields");
        return;
    }

    setLoading(true);
    try {
      const res = await api.post('finance/invoices/bulk_generate/', formData);
      alert(res.data.message); // "Generated 40 invoices..."
      onSuccess();
      onClose();
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || "Failed to generate. Check if Fee Structures exist for this class."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg bg-[#111] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative"
          >
            {/* Header */}
            <div className="p-8 pb-0 flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                        <Zap className="text-yellow-500 fill-yellow-500" size={24} /> 
                        Bulk Generator
                    </h2>
                    <p className="text-gray-400 text-sm">Generate invoices for an entire class based on Fee Structures.</p>
                </div>
                <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                
                {/* Academic Year */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Academic Year</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <select 
                            value={formData.academic_year}
                            onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white appearance-none outline-none focus:border-yellow-500 transition-colors [&>option]:bg-gray-900"
                        >
                            <option value="">Select Year</option>
                            {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Classroom */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Target Class</label>
                    <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <select 
                            value={formData.classroom}
                            onChange={(e) => setFormData({...formData, classroom: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white appearance-none outline-none focus:border-yellow-500 transition-colors [&>option]:bg-gray-900"
                        >
                            <option value="">Select Class</option>
                            {classrooms.map(c => <option key={c.id} value={c.id}>Grade {c.grade_level} - {c.section}</option>)}
                        </select>
                    </div>
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Payment Due Date</label>
                    <input 
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-white outline-none focus:border-yellow-500 transition-colors"
                    />
                </div>

                {/* Action Button */}
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                        <>
                            <Layers size={20} /> Generate Invoices
                        </>
                    )}
                </button>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BulkInvoiceModal;