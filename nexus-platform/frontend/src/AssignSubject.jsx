import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, BookOpen, User, AlertCircle } from 'lucide-react';
import api from './api';

const AssignSubject = ({ isOpen, onClose, classroomId, onSuccess }) => {
  const [subjects, setSubjects] = useState([]); // Only UNASSIGNED subjects
  const [teachers, setTeachers] = useState([]);
  const [academicYearId, setAcademicYearId] = useState(null);
  
  const [formData, setFormData] = useState({
    subject: '',
    teacher: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch Data on Open
  useEffect(() => {
    if (isOpen && classroomId) {
      const fetchData = async () => {
        try {
          setError(null);
          // 1. Fetch Classroom (for Academic Year)
          // 2. Fetch All Subjects
          // 3. Fetch Employees (Teachers)
          // 4. Fetch EXISTING Allocations for this class (to filter them out)
          const [clsRes, subRes, teachRes, allocRes] = await Promise.all([
            api.get(`core/classrooms/${classroomId}/`), 
            api.get('academics/subjects/'),
            api.get('hr/employees/'),
            api.get(`academics/allocations/?classroom=${classroomId}`)
          ]);

          // Handle Academic Year
          const yearData = clsRes.data.academic_year;
          const yearId = typeof yearData === 'object' ? yearData.id : yearData;
          setAcademicYearId(yearId);

          // Calculate Available Subjects (Total - Already Assigned)
          const assignedSubjectIds = allocRes.data.map(a => 
            typeof a.subject === 'object' ? a.subject.id : a.subject
          );
          
          const availableSubjects = subRes.data.filter(s => !assignedSubjectIds.includes(s.id));
          
          setSubjects(availableSubjects);
          setTeachers(teachRes.data);

        } catch (err) {
          console.error("Failed to load data", err);
          setError("Failed to load prerequisite data.");
        }
      };
      fetchData();
    }
  }, [isOpen, classroomId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!academicYearId) {
      setError("Academic Year not linked to this classroom.");
      return;
    }

    setLoading(true);
    try {
      await api.post('academics/allocations/', {
        classroom: classroomId,
        subject: formData.subject,
        teacher: formData.teacher,
        academic_year: academicYearId
      });
      onSuccess();
      onClose();
      // Reset form
      setFormData({ subject: '', teacher: '' }); 
    } catch (err) {
      // Friendly Error Handling
      if (err.response?.data?.non_field_errors) {
        setError("This subject is already assigned to this class.");
      } else {
        setError("Assignment failed. Please check your inputs.");
      }
      console.error(err);
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
                
                {/* Error Banner */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-200 text-sm">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}

                <form id="assign-form" onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Subject Selection */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase font-bold tracking-wider flex items-center gap-2">
                      <BookOpen size={14} className="text-blue-400" /> Select Subject
                    </label>
                    <select 
                      required
                      className="glass-input w-full p-4 rounded-2xl text-white bg-black/20 [&>option]:bg-slate-900 border border-white/10 focus:border-blue-500/50 outline-none transition-all"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    >
                      <option value="">-- Choose Subject --</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                      ))}
                    </select>
                    
                    {/* Helper Text */}
                    {subjects.length === 0 && (
                      <p className="text-xs text-orange-400 mt-1">
                        All available subjects are already assigned or none exist.
                      </p>
                    )}
                  </div>

                  {/* Teacher Selection */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase font-bold tracking-wider flex items-center gap-2">
                      <User size={14} className="text-purple-400" /> Assign Faculty
                    </label>
                    <select 
                      required
                      className="glass-input w-full p-4 rounded-2xl text-white bg-black/20 [&>option]:bg-slate-900 border border-white/10 focus:border-purple-500/50 outline-none transition-all"
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
                  disabled={loading || subjects.length === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg flex justify-center items-center gap-2 transition-all transform active:scale-95"
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