import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, CalendarCheck, BookOpen, ChevronRight, 
  GraduationCap 
} from 'lucide-react';
import api from './api';
import Dock from './Dock';

const Classes = () => {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get('core/classrooms/');
      setClassrooms(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden selection:bg-cyan-500/30">
      
      <div className="fixed top-[-20%] left-[-10%] w-[900px] h-[900px] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
               <BookOpen className="text-cyan-400" size={28} />
            </div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-200 tracking-tighter">
              My Classes
            </h1>
          </div>
          <p className="text-gray-400 font-medium pl-2">Academic Classroom Management</p>
        </motion.div>
      </div>

      {/* --- Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
         {classrooms.map((cls, idx) => (
             <motion.div 
               key={cls.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.05 }}
               className="glass-panel p-6 rounded-[2.5rem] border border-white/10 bg-white/5 hover:border-cyan-500/30 transition-all group relative overflow-hidden"
             >
                 {/* Background Decor */}
                 <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all"></div>

                 <div className="flex justify-between items-start mb-8 relative">
                     <div>
                         <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1 block">Classroom</span>
                         <h3 className="text-4xl font-bold text-white">
                             {cls.grade_level}<span className="text-gray-500 text-2xl">-{cls.section}</span>
                         </h3>
                     </div>
                     <div className="p-3 bg-white/5 rounded-full border border-white/10">
                         <GraduationCap size={24} className="text-gray-300" />
                     </div>
                 </div>

                 {/* Quick Actions */}
                 <div className="grid grid-cols-2 gap-3 relative">
                     <button 
                        onClick={() => navigate(`/attendance?classId=${cls.id}`)}
                        className="flex flex-col items-center justify-center gap-2 bg-black/20 hover:bg-cyan-600 hover:text-white p-4 rounded-2xl border border-white/5 transition-all group/btn"
                     >
                         <CalendarCheck size={20} className="text-cyan-400 group-hover/btn:text-white"/>
                         <span className="text-xs font-bold">Attendance</span>
                     </button>

                     <button 
                        // FIX: Now points to /students instead of /gradebook
                        onClick={() => navigate(`/students?classId=${cls.id}`)}
                        className="flex flex-col items-center justify-center gap-2 bg-black/20 hover:bg-purple-600 hover:text-white p-4 rounded-2xl border border-white/5 transition-all group/btn"
                     >
                         <Users size={20} className="text-purple-400 group-hover/btn:text-white"/>
                         <span className="text-xs font-bold">Students</span>
                     </button>
                 </div>

                 <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
                     <div className="flex -space-x-2">
                         {[1,2,3].map(i => (
                             <div key={i} className="w-8 h-8 rounded-full bg-gray-800 border-2 border-[#111] flex items-center justify-center text-[8px] text-gray-500">
                                 <Users size={12}/>
                             </div>
                         ))}
                         <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-[#111] flex items-center justify-center text-[10px] font-bold text-white">
                             +24
                         </div>
                     </div>
                     <button className="text-xs font-bold text-gray-400 flex items-center gap-1 hover:text-white transition-colors">
                         View Details <ChevronRight size={14}/>
                     </button>
                 </div>
             </motion.div>
         ))}
      </div>

      <Dock />
    </div>
  );
};

export default Classes;