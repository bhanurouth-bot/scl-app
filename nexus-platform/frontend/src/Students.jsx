import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, UserX } from 'lucide-react'; // Added UserX for empty state
import { useNavigate } from 'react-router-dom';
import api from './api';
import Dock from './Dock';
import StudentCard from './StudentCard';
import AddStudent from './AddStudent';
import { GlassInput, GlassButton, Skeleton } from './components/GlassUI'; // <--- IMPORT NEW UI KIT

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchStudents = async () => {
    try {
      const response = await api.get('students/profiles/');
      setStudents(response.data);
    } catch (error) { console.error("Failed to fetch students:", error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, []);

  const filteredStudents = students.filter(student => {
    const fullName = `${student.user?.first_name || ''} ${student.user?.last_name || ''}`.toLowerCase();
    const studentId = student.student_id?.toLowerCase() || '';
    const query = searchTerm.toLowerCase();
    return fullName.includes(query) || studentId.includes(query);
  });

  // Stagger Animation Variant
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 } // Delay between each item
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden selection:bg-blue-500/30">
      
      {/* Background Ambience */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 mb-2 tracking-tight">Student Directory</h1>
          <p className="text-gray-400 font-medium">Manage admission records</p>
        </motion.div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-full md:w-72">
            <GlassInput 
              icon={Search} 
              placeholder="Search students..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <GlassButton onClick={() => setIsAddModalOpen(true)}>
             <Plus size={20} /> <span className="hidden md:inline">Add New</span>
          </GlassButton>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        // SKELETON LOADING STATE
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
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => (
                <motion.div 
                  key={student.id}
                  variants={itemVariants}
                  layout
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
                className="col-span-full flex flex-col items-center justify-center py-24 text-center border border-dashed border-white/10 rounded-[2rem] bg-white/5"
              >
                <div className="p-4 bg-white/5 rounded-full mb-4">
                    <UserX size={32} className="text-gray-500" />
                </div>
                <p className="text-gray-400 text-lg font-bold">No students found</p>
                <p className="text-gray-600 text-sm">Adjust your search or add a new student.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

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