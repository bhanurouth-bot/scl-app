import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, UserX, Filter } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import api from './api';
import Dock from './Dock';
import StudentCard from './StudentCard';
import AddStudent from './AddStudent';
import { GlassInput, GlassButton, GlassSelect, Skeleton } from './components/GlassUI';

// --- HELPER: Debounce Hook ---
// Prevents API spam while typing
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const Students = () => {
  const navigate = useNavigate();
  
  // Data State
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500); // Wait 500ms
  const [selectedClass, setSelectedClass] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // --- FETCH LOGIC ---
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      // Build dynamic query string
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (selectedClass) params.append('classroom', selectedClass);
      
      const response = await api.get(`students/profiles/?${params.toString()}`);
      setStudents(response.data);
    } catch (error) { 
      console.error("Failed to fetch students:", error); 
    } finally { 
      setLoading(false); 
    }
  }, [debouncedSearch, selectedClass]);

  // Trigger fetch when filters change
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden selection:bg-blue-500/30">
      
      {/* Background Ambience */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* --- HEADER & TOOLBAR --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-10 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 mb-2 tracking-tight">Student Directory</h1>
          <p className="text-gray-400 font-medium">Manage {students.length} active enrollments</p>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
          {/* Search Bar */}
          <div className="w-full md:w-64">
            <GlassInput 
              icon={Search} 
              placeholder="Search ID, Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Classroom Filter */}
          <div className="w-full md:w-48">
             <GlassSelect 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
             >
                <option value="">All Classes</option>
                {/* Note: In a real app, map these from an API call to /academics/classrooms/ */}
                <option value="1">Grade 10 - A</option>
                <option value="2">Grade 10 - B</option>
                <option value="3">Grade 11 - Sci</option>
             </GlassSelect>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full md:w-auto">
             <GlassButton variant="ghost" onClick={fetchStudents} title="Refresh Data">
                <Filter size={20} />
             </GlassButton>
             <GlassButton onClick={() => setIsAddModalOpen(true)} className="w-full md:w-auto">
                <Plus size={20} /> <span className="ml-1">Add Student</span>
             </GlassButton>
          </div>
        </div>
      </div>

      {/* --- GRID CONTENT --- */}
      <div className="relative min-h-[400px]">
        {loading ? (
          // SKELETON LOADING
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {[...Array(8)].map((_, i) => (
               <Skeleton key={i} className="h-64 rounded-[2rem]" />
             ))}
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-0"
          >
            <AnimatePresence mode="popLayout">
              {students.length > 0 ? (
                students.map((student, index) => (
                  <motion.div 
                    key={student.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => navigate(`/students/${student.id}`)}
                    className="cursor-pointer"
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <StudentCard student={student} index={index} />
                  </motion.div>
                ))
              ) : (
                // EMPTY STATE
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="col-span-full py-24 text-center border border-dashed border-white/10 rounded-[2rem] bg-white/5"
                >
                  <div className="p-4 bg-white/5 rounded-full mb-4 inline-flex items-center justify-center">
                      <UserX size={32} className="text-gray-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-300">No students found</h3>
                  <p className="text-gray-500 mt-2">Try adjusting your filters or search query.</p>
                  <button 
                    onClick={() => {setSearchTerm(''); setSelectedClass('');}}
                    className="mt-6 text-blue-400 hover:text-blue-300 text-sm font-bold underline underline-offset-4"
                  >
                    Clear all filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <Dock />
      
      <AddStudent 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => fetchStudents()} 
      />

    </div>
  );
};

export default Students;