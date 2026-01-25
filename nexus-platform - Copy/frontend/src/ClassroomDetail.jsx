import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Users, Plus, MoreHorizontal, User } from 'lucide-react';
import api from './api';
import Dock from './Dock';
import StudentCard from './StudentCard';
import AssignSubject from './AssignSubject';

const ClassroomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // --- State ---
  const [classroom, setClassroom] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('subjects'); // 'subjects' | 'students'
  const [loading, setLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // --- Fetch Logic (Reusable) ---
  const fetchCockpitData = async () => {
    try {
      // 1. Fetch Class Details
      const classRes = await api.get(`core/classrooms/${id}/`);
      setClassroom(classRes.data);

      // 2. Fetch Subjects (Allocations)
      const subRes = await api.get(`academics/allocations/?classroom=${id}`);
      setSubjects(subRes.data);

      // 3. Fetch Students
      const stuRes = await api.get(`students/profiles/?classroom=${id}`);
      setStudents(stuRes.data);
    } catch (err) {
      console.error("Failed to fetch cockpit data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCockpitData();
  }, [id]);

  // --- Loading State ---
  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-gray-500">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      Loading Cockpit...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden selection:bg-emerald-500/30">
      
      {/* --- Ambient Background --- */}
      <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      {/* --- Header --- */}
      <div className="mb-12 relative z-10">
        <button onClick={() => navigate('/academics')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/> Back to Academics
        </button>

        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <span className="text-emerald-400 font-bold tracking-widest uppercase text-xs bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Classroom Cockpit
            </span>
            <h1 className="text-6xl font-bold text-white mt-4 font-mono tracking-tighter">
              {classroom?.grade_level}-{classroom?.section}
            </h1>
          </motion.div>

          {/* Quick Stats */}
          <div className="flex gap-4">
            <div className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors">
              <div className="text-2xl font-bold text-white">{subjects.length}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">Subjects</div>
            </div>
            <div className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors">
              <div className="text-2xl font-bold text-white">{students.length}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">Students</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Tab Switcher (iOS Segmented Control) --- */}
      <div className="flex p-1 bg-white/5 rounded-2xl w-fit mb-10 border border-white/10 relative z-10">
        {['subjects', 'students'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all relative ${
              activeTab === tab ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {activeTab === tab && (
              <motion.div 
                layoutId="activeTab"
                className="absolute inset-0 bg-white/10 rounded-xl shadow-inner border border-white/5" 
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 capitalize">{tab}</span>
          </button>
        ))}
      </div>

      {/* --- Content Area --- */}
      <div className="relative z-10 min-h-[400px]">
        <AnimatePresence mode="wait">
          
          {/* SUBJECTS VIEW */}
          {activeTab === 'subjects' && (
            <motion.div 
              key="subjects"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {/* Add Subject Card */}
              <button 
                onClick={() => setIsAssignModalOpen(true)}
                className="border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center p-8 hover:bg-white/5 hover:border-emerald-500/30 transition-all group min-h-[250px]"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors border border-white/5">
                  <Plus size={24} />
                </div>
                <span className="text-gray-400 font-bold group-hover:text-white uppercase tracking-wider text-sm">Add Subject</span>
              </button>

              {/* Subject Cards */}
              {subjects.map((sub) => (
                <motion.div 
                  key={sub.id} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5 }}
                  className="glass-panel p-6 rounded-[2rem] relative group hover:bg-white/10 transition-colors border border-white/10"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-400 border border-white/5">
                      <BookOpen size={24} />
                    </div>
                    <button className="p-2 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-1">{sub.subject?.name || "Unnamed Subject"}</h3>
                  <p className="text-sm text-gray-400 mb-8 font-mono">{sub.subject?.code || "NO-CODE"}</p>

                  <div className="flex items-center gap-3 p-4 bg-black/40 rounded-2xl border border-white/5 backdrop-blur-md">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 border border-white/5">
                      <User size={16} />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Faculty</div>
                      <div className="text-sm font-semibold text-gray-200">
                        {sub.teacher?.user?.first_name 
                          ? `${sub.teacher.user.first_name} ${sub.teacher.user.last_name}` 
                          : "Unassigned"}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* STUDENTS VIEW */}
          {activeTab === 'students' && (
            <motion.div 
              key="students"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {students.length > 0 ? (
                students.map((student, index) => (
                  <motion.div key={student.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <StudentCard student={student} index={index} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-3xl bg-white/5">
                  <Users size={48} className="text-gray-600 mb-4 opacity-50"/>
                  <p className="text-gray-400 text-lg">No students assigned.</p>
                  <p className="text-gray-600 text-sm">Add students via the Student Directory.</p>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <Dock />

      {/* --- Assign Subject Modal --- */}
      <AssignSubject 
        isOpen={isAssignModalOpen} 
        onClose={() => setIsAssignModalOpen(false)}
        classroomId={id}
        onSuccess={fetchCockpitData} // Auto-refresh data on success
      />

    </div>
  );
};

export default ClassroomDetail;