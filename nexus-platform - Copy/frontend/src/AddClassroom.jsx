import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Calendar, Layers } from 'lucide-react';
import api from './api';

const AddClassroom = ({ isOpen, onClose, onSuccess }) => {
  const [years, setYears] = useState([]);
  const [showYearInput, setShowYearInput] = useState(false); // Toggle to create new year
  const [formData, setFormData] = useState({
    grade_level: '',
    section: '',
    academic_year: ''
  });
  const [newYearName, setNewYearName] = useState(`${new Date().getFullYear()}-${new Date().getFullYear()+1}`);
  const [loading, setLoading] = useState(false);

  // Fetch Years on Open
  useEffect(() => {
    if (isOpen) fetchYears();
  }, [isOpen]);

  const fetchYears = async () => {
    try {
      const res = await api.get('core/years/');
      setYears(res.data);
      // Auto-select the first active year if available
      if (res.data.length > 0) {
        setFormData(prev => ({ ...prev, academic_year: res.data[0].id }));
      } else {
        setShowYearInput(true); // Force create year if none exist
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateYear = async () => {
    try {
      const res = await api.post('core/years/', {
        name: newYearName,
        start_date: `${new Date().getFullYear()}-04-01`, // Default start
        end_date: `${new Date().getFullYear()+1}-03-31`, // Default end
        is_current: true
      });
      setYears([...years, res.data]);
      setFormData(prev => ({ ...prev, academic_year: res.data.id }));
      setShowYearInput(false);
    } catch (err) {
      alert("Failed to create year: " + JSON.stringify(err.response?.data));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('core/classrooms/', formData);
      onSuccess();
      onClose();
    } catch (err) {
      alert("Error: " + JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel w-full max-w-md rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-bold text-white">Add Classroom</h2>
                <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-white" /></button>
              </div>

              <div className="p-6 space-y-6">
                {/* 1. Academic Year Section */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 uppercase font-bold tracking-wider flex items-center gap-2">
                    <Calendar size={14} /> Academic Session
                  </label>
                  
                  {!showYearInput && years.length > 0 ? (
                    <div className="flex gap-2">
                      <select 
                        className="glass-input flex-1 p-3 rounded-xl text-white bg-black/20 [&>option]:bg-slate-900"
                        value={formData.academic_year}
                        onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
                      >
                        {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                      </select>
                      <button onClick={() => setShowYearInput(true)} className="p-3 bg-white/10 rounded-xl hover:bg-white/20 text-white">
                        <PlusIcon />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 animate-in fade-in">
                      <input 
                        value={newYearName} 
                        onChange={(e) => setNewYearName(e.target.value)}
                        className="glass-input flex-1 p-3 rounded-xl text-white" 
                        placeholder="e.g. 2025-2026"
                      />
                      <button onClick={handleCreateYear} className="px-4 bg-emerald-600 rounded-xl text-white text-sm font-bold hover:bg-emerald-500">
                        Set Year
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Class Details */}
                <form id="class-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Grade Level</label>
                      <input 
                        required 
                        placeholder="e.g. 10" 
                        className="glass-input w-full p-3 rounded-xl text-white"
                        value={formData.grade_level}
                        onChange={(e) => setFormData({...formData, grade_level: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Section</label>
                      <input 
                        required 
                        placeholder="e.g. A" 
                        className="glass-input w-full p-3 rounded-xl text-white"
                        value={formData.section}
                        onChange={(e) => setFormData({...formData, section: e.target.value})}
                      />
                    </div>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10 bg-black/20">
                <button 
                  type="submit" 
                  form="class-form"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg flex justify-center items-center gap-2 transition-all"
                >
                  {loading ? 'Creating...' : <><Save size={18} /> Create Classroom</>}
                </button>
              </div>

            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Mini helper icon
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

export default AddClassroom;