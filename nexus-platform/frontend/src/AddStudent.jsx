import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User, BookOpen, Calendar, Shield } from 'lucide-react';
import api from './api';

const AddStudent = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', password: 'Student@123',
    student_id: '', roll_number: '', classroom: '', admission_year: '',
    gender: 'M', date_of_birth: '', blood_group: '',
    guardian_name: '', guardian_phone: ''
  });

  const [classes, setClasses] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch Dropdown Data
  useEffect(() => {
    if (isOpen) {
      const fetchMetadata = async () => {
        try {
          const [classRes, yearRes] = await Promise.all([
            api.get('core/classrooms/'),
            api.get('core/years/')
          ]);
          setClasses(classRes.data);
          setYears(yearRes.data);
          
          // Auto-generate Student ID (Mock logic)
          const randomId = `STU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
          setFormData(prev => ({ ...prev, student_id: randomId }));
        } catch (err) {
          console.error("Failed to load metadata", err);
        }
      };
      fetchMetadata();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('students/profiles/', formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Submission failed:", error.response?.data);
      alert(JSON.stringify(error.response?.data)); // Simple error handling for now
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
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Sliding Sheet */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-2 bottom-2 right-2 w-full max-w-2xl glass-panel rounded-3xl border border-white/20 shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div>
                <h2 className="text-2xl font-bold text-white">New Admission</h2>
                <p className="text-blue-200 text-sm">Create a student profile and login account</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            {/* Form Scroll Area */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <form id="add-student-form" onSubmit={handleSubmit} className="space-y-8">
                
                {/* Section 1: Identity */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <User size={18} />
                    <span className="text-sm font-bold uppercase tracking-wider">Identity</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <label className="block text-xs text-gray-400 mb-1">First Name</label>
                      <input name="first_name" required onChange={handleChange} className="glass-input w-full p-3 rounded-xl text-white" placeholder="John" />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs text-gray-400 mb-1">Last Name</label>
                      <input name="last_name" required onChange={handleChange} className="glass-input w-full p-3 rounded-xl text-white" placeholder="Doe" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Generated Password</label>
                      <input name="password" value={formData.password} readOnly className="glass-input w-full p-3 rounded-xl text-gray-400 cursor-not-allowed bg-black/20" />
                    </div>
                  </div>
                </div>

                {/* Section 2: Academic */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-purple-400 mb-2">
                    <BookOpen size={18} />
                    <span className="text-sm font-bold uppercase tracking-wider">Academic Info</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Student ID</label>
                      <input name="student_id" value={formData.student_id} onChange={handleChange} className="glass-input w-full p-3 rounded-xl text-white" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Roll Number</label>
                      <input name="roll_number" type="number" onChange={handleChange} className="glass-input w-full p-3 rounded-xl text-white" placeholder="01" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Classroom</label>
                      <select name="classroom" onChange={handleChange} className="glass-input w-full p-3 rounded-xl text-white [&>option]:bg-slate-900">
                        <option value="">Select Class</option>
                        {classes.map(c => (
                          <option key={c.id} value={c.id}>{c.grade_level} - {c.section}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Admission Year</label>
                      <select name="admission_year" onChange={handleChange} className="glass-input w-full p-3 rounded-xl text-white [&>option]:bg-slate-900">
                        <option value="">Select Year</option>
                        {years.map(y => (
                          <option key={y.id} value={y.id}>{y.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 3: Personal Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 mb-2">
                    <Calendar size={18} />
                    <span className="text-sm font-bold uppercase tracking-wider">Personal</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Date of Birth</label>
                      <input name="date_of_birth" type="date" onChange={handleChange} className="glass-input w-full p-3 rounded-xl text-white" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Gender</label>
                      <select name="gender" onChange={handleChange} className="glass-input w-full p-3 rounded-xl text-white [&>option]:bg-slate-900">
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Blood Group</label>
                      <input name="blood_group" onChange={handleChange} className="glass-input w-full p-3 rounded-xl text-white" placeholder="O+" />
                    </div>
                  </div>
                </div>

                {/* Section 4: Guardian */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-orange-400 mb-2">
                    <Shield size={18} />
                    <span className="text-sm font-bold uppercase tracking-wider">Guardian</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Guardian Name</label>
                      <input name="guardian_name" onChange={handleChange} className="glass-input w-full p-3 rounded-xl text-white" placeholder="Parent Name" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Phone Number</label>
                      <input name="guardian_phone" onChange={handleChange} className="glass-input w-full p-3 rounded-xl text-white" placeholder="+1 234..." />
                    </div>
                  </div>
                </div>

              </form>
            </div>

            {/* Footer Action */}
            <div className="p-6 border-t border-white/10 bg-black/20 backdrop-blur-md">
              <button 
                type="submit" 
                form="add-student-form"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 flex justify-center items-center gap-2"
              >
                {loading ? 'Creating Profile...' : (
                  <>
                    <Save size={20} />
                    <span>Save Student Record</span>
                  </>
                )}
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddStudent;