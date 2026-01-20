import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus } from 'lucide-react';
import api from './api';
import Dock from './Dock';
import StudentCard from './StudentCard';
import AddStudent from './AddStudent';
import StudentDetail from './StudentDetail';

const Students = () => {
  // --- State Management ---
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null); // If not null, Detail Modal is open

  // --- Data Fetching ---
  const fetchStudents = async () => {
    try {
      const response = await api.get('students/profiles/');
      setStudents(response.data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // --- Filter Logic ---
  const filteredStudents = students.filter(student => {
    const firstName = student.user?.first_name || '';
    const lastName = student.user?.last_name || '';
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    const studentId = student.student_id?.toLowerCase() || '';
    const query = searchTerm.toLowerCase();

    return fullName.includes(query) || studentId.includes(query);
  });

  return (
    <div className="min-h-screen bg-black text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden">
      
      {/* --- Background Ambience --- */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* --- Header & Controls --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Student Directory</h1>
          <p className="text-gray-400">Manage admission records and identity profiles</p>
        </motion.div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Glass Search Bar */}
          <div className="relative group w-full md:w-72">
            <Search className="absolute left-4 top-3.5 text-gray-500 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:bg-white/10 focus:border-blue-500/50 transition-all placeholder-gray-600"
            />
          </div>

          {/* Add Button */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] border border-white/10"
          >
            <Plus size={24} />
          </motion.button>
        </div>
      </div>

      {/* --- The Grid --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 animate-pulse">Loading Identity Decks...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-0">
          <AnimatePresence>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => (
                <motion.div 
                  key={student.id || index}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setSelectedStudent(student)} // Open Detail View
                >
                  <StudentCard student={student} index={index} />
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="col-span-full flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-3xl bg-white/5"
              >
                <p className="text-gray-400 text-lg mb-2">No students found.</p>
                <p className="text-gray-600 text-sm">Try adjusting your search or add a new student.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* --- Floating Navigation Dock --- */}
      <Dock />

      {/* --- Modals --- */}
      
      {/* 1. Add Student Sheet */}
      <AddStudent 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchStudents(); // Refresh grid after adding
        }} 
      />

      {/* 2. Student Detail / Edit Inspector */}
      <StudentDetail 
        isOpen={!!selectedStudent} 
        student={selectedStudent} 
        onClose={() => setSelectedStudent(null)}
        onUpdate={() => {
          fetchStudents(); // Refresh grid after editing/deleting
          setSelectedStudent(null); // Close modal
        }}
      />

    </div>
  );
};

export default Students;