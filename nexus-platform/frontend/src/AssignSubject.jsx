import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, BookOpen, User } from 'lucide-react';
import api from './api';

const AssignSubject = ({ isOpen, onClose, classroomId, onSuccess }) => {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    subject: '',
    teacher: ''
  });
  const [loading, setLoading] = useState(false);

  // Fetch Data on Open
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [subRes, teachRes] = await Promise.all([
            api.get('academics/subjects/'),
            api.get('hr/employees/')
          ]);
          setSubjects(subRes.data);
          setTeachers(teachRes.data);
        } catch (err) {
          console.error("Failed to load dropdowns", err);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create the Allocation Link
      await api.post('academics/allocations/', {
        classroom: classroomId,
        subject: formData.subject,
        teacher: formData.teacher
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert("Assignment Failed: " + JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel w-full max-w-lg rounded-3xl border border-white/20 shadow-2xl overflow-hidden relative"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                  <h2 className="text-xl font-bold text-white">Assign Curriculum</h2>
                  <p className="text-xs text-blue-200">Map a subject and teacher to this class</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              {/* Form */}
              <div className="p-8 space-y-6">
                <form id="assign-form" onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Subject Selection */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase font-bold tracking-wider flex items-center gap-2">
                      <BookOpen size={14} className="text-blue-400" /> Select Subject
                    </label>
                    <select 
                      required
                      className="glass-input w-full p-4 rounded-2xl text-white bg-black/20 [&>option]:bg-slate-900 border border-white/10 focus:border-blue-500/50"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    >
                      <option value="">-- Choose Subject --</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                      ))}
                    </select>
                    {subjects.length === 0 && (
                      <p className="text-xs text-red-400">No subjects found. Please create subjects in Academics first.</p>
                    )}
                  </div>

                  {/* Teacher Selection */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase font-bold tracking-wider flex items-center gap-2">
                      <User size={14} className="text-purple-400" /> Assign Faculty
                    </label>
                    <select 
                      required
                      className="glass-input w-full p-4 rounded-2xl text-white bg-black/20 [&>option]:bg-slate-900 border border-white/10 focus:border-purple-500/50"
                      value={formData.teacher}
                      onChange={(e) => setFormData({...formData, teacher: e.target.value})}
                    >
                      <option value="">-- Choose Teacher --</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.user?.first_name} {t.user?.last_name} ({t.employee_id})
                        </option>
                      ))}
                    </select>
                  </div>

                </form>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10 bg-black/20 backdrop-blur-md">
                <button 
                  type="submit" 
                  form="assign-form"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg flex justify-center items-center gap-2 transition-all transform active:scale-95"
                >
                  {loading ? 'Mapping...' : <><Save size={18} /> Confirm Allocation</>}
                </button>
              </div>

            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AssignSubject;