import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, Plus, GraduationCap, Sparkles, Layers, Book, FileText } from 'lucide-react'; // Added FileText
import api from './api';
import Dock from './Dock';
import AddClassroom from './AddClassroom';

const Academics = () => {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // --- Data Fetching ---
  const fetchClassrooms = async () => {
    try {
      const res = await api.get('core/classrooms/');
      setClassrooms(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  // --- Grouping Logic ---
  const groupedClasses = classrooms.reduce((acc, curr) => {
    const grade = curr.grade_level;
    if (!acc[grade]) acc[grade] = [];
    acc[grade].push(curr);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden selection:bg-emerald-500/30">
      
      {/* --- Ambient Background --- */}
      <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-b from-emerald-600/40 to-teal-900/0 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse"></div>
      <div className="fixed bottom-[-10%] left-[-20%] w-[900px] h-[900px] bg-gradient-to-t from-blue-600/30 to-purple-900/0 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <GraduationCap className="text-emerald-400" size={28} />
            </div>
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tight">
              Academics
            </h1>
          </div>
          <p className="text-lg text-gray-400 font-medium pl-1">Structure & Allocation Center</p>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
            {/* 1. Manage Subjects Button */}
            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/subjects')}
                className="bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white px-6 py-4 rounded-2xl flex items-center gap-2 border border-white/10 transition-colors backdrop-blur-md"
            >
                <Book size={18} />
                <span className="font-semibold hidden md:inline">Global Subjects</span>
            </motion.button>

            {/* 2. Exams & Grading Button (NEW) */}
            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/exams')}
                className="bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white px-6 py-4 rounded-2xl flex items-center gap-2 border border-white/10 transition-colors backdrop-blur-md"
            >
                <FileText size={18} />
                <span className="font-semibold hidden md:inline">Exams & Results</span>
            </motion.button>

            {/* 3. New Class Button */}
            <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsAddModalOpen(true)}
                className="relative overflow-hidden bg-emerald-600 text-white px-6 py-4 rounded-2xl flex items-center gap-3 shadow-[0_0_40px_rgba(16,185,129,0.4)] border border-white/20 transition-all group"
            >
                {/* Button Glare */}
                <div className="absolute top-0 bottom-0 left-[-100%] w-[50%] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-25deg] group-hover:left-[200%] transition-all duration-700 ease-in-out"></div>
                
                <div className="bg-white/20 p-1 rounded-lg relative z-10">
                    <Plus size={18} strokeWidth={3} />
                </div>
                <span className="font-semibold tracking-wide pr-2 relative z-10">New Class</span>
            </motion.button>
        </div>
      </div>

      {/* --- Content Grid --- */}
      {loading ? (
         <div className="flex flex-col items-center justify-center py-32 relative z-10">
            <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]"></div>
            <p className="text-gray-400 font-medium animate-pulse">Loading Academy...</p>
        </div>
      ) : Object.keys(groupedClasses).length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10 rounded-[3rem] bg-white/5 backdrop-blur-sm relative z-10"
        >
          <Layers size={64} className="text-gray-600 mb-6 opacity-50" />
          <p className="text-gray-300 text-2xl font-bold mb-2">Academic Structure Empty</p>
          <button onClick={() => setIsAddModalOpen(true)} className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-2 mt-4 hover:underline decoration-2 underline-offset-4">
             <Plus size={16} /> Create First Grade
          </button>
        </motion.div>
      ) : (
        <div className="space-y-16 relative z-10">
          {Object.keys(groupedClasses).sort((a,b) => parseInt(a) - parseInt(b)).map((grade, index) => (
            <motion.div 
              key={grade}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Sticky Header */}
              <div className="flex items-center gap-4 mb-8 sticky top-4 z-20 pl-2">
                 <div className="px-4 py-2 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-baseline gap-3 shadow-lg">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Grade {grade}</h2>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{groupedClasses[grade].length} Sections</span>
                 </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                
                {groupedClasses[grade].sort((a,b) => a.section.localeCompare(b.section)).map((cls) => (
                  <motion.div 
                    key={cls.id}
                    onClick={() => navigate(`/academics/${cls.id}`)} // Navigate to Cockpit
                    whileHover={{ y: -5, scale: 1.01 }}
                    className="group relative p-1 rounded-[2.2rem] bg-gradient-to-b from-white/10 to-white/5 shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
                  >
                    {/* --- THE GLARE EFFECT --- */}
                    <div className="absolute inset-0 z-20 pointer-events-none rounded-[2.2rem] overflow-hidden">
                        <div className="absolute top-0 bottom-0 left-[-150%] w-[100%] bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-[-25deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out"></div>
                    </div>

                    {/* The Inner Card */}
                    <div className="relative h-full bg-[#0a0a0a]/80 backdrop-blur-xl rounded-[2rem] p-6 border-t border-l border-white/10">
                        
                        {/* Ambient Glow Blob */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-[50px] group-hover:bg-emerald-500/30 transition-colors"></div>

                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border border-white/10 px-2 py-1 rounded-lg">Section</span>
                                <h3 className="text-5xl font-bold text-white mt-2 font-mono tracking-tighter">{cls.section}</h3>
                            </div>
                            
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30 transition-all">
                                <Sparkles size={16} className="text-gray-500 group-hover:text-emerald-400" />
                            </div>
                        </div>

                        <div className="space-y-3 relative z-10">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400"><BookOpen size={12}/></div>
                                    <span className="text-xs text-gray-300 font-medium">Subjects</span>
                                </div>
                                <span className="text-xs font-bold text-white">View</span>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400"><Users size={12}/></div>
                                    <span className="text-xs text-gray-300 font-medium">Students</span>
                                </div>
                                <span className="text-xs font-bold text-white">View</span>
                            </div>
                        </div>

                    </div>
                  </motion.div>
                ))}

                {/* Add Section Ghost Card */}
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsAddModalOpen(true)}
                  className="relative overflow-hidden rounded-[2.2rem] border-2 border-dashed border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/5 flex flex-col items-center justify-center min-h-[220px] gap-3 transition-all group"
                >
                    <div className="absolute top-0 bottom-0 left-[-150%] w-[100%] bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent skew-x-[-25deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out"></div>
                    
                    <div className="w-14 h-14 rounded-full bg-white/5 group-hover:bg-emerald-500/20 flex items-center justify-center transition-colors relative z-10">
                      <Plus size={24} className="text-gray-500 group-hover:text-emerald-400" />
                    </div>
                    <span className="text-xs font-bold text-gray-500 group-hover:text-white tracking-widest uppercase relative z-10">Add Section</span>
                </motion.button>

              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dock />

      {/* --- Add Classroom Modal --- */}
      <AddClassroom 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchClassrooms} 
      />
    </div>
  );
};

export default Academics;