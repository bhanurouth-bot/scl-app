import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dock from '../components/Dock';
import GlassCard from '../components/GlassCard';
import CreateStudentModal from '../modules/Students/CreateStudentModal';
import { Search, Filter, MoreHorizontal, UserPlus, AlertCircle } from 'lucide-react';

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]); // Default to empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); // New Error State
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error("No access token found. Please login.");
      }

      const response = await fetch('http://127.0.0.1:8000/api/students/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // 1. Check for HTTP Errors (401, 403, 500)
      if (!response.ok) {
        if (response.status === 401) {
           navigate('/login'); // Auto-redirect if token expired
           return;
        }
        throw new Error(`Server Error: ${response.statusText}`);
      }

      const data = await response.json();

      // 2. Safety Check: Ensure data is actually an Array
      if (Array.isArray(data)) {
        setStudents(data);
      } else {
        console.error("API returned unexpected format:", data);
        setStudents([]); // Fallback to empty list to prevent crash
        setError("Invalid data received from server.");
      }

    } catch (err) {
      console.error("Failed to load students", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nexus-dark text-white relative selection:bg-blue-500/30">
      
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
         <div className="absolute inset-0 bg-nexus-dark/80 backdrop-blur-sm"></div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 pb-32">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Student Directory
            </h1>
            <p className="text-slate-400 mt-2">Manage admissions, academic records, and profiles.</p>
          </div>

          <button 
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all font-medium"
          >
            <UserPlus size={20} />
            New Admission
          </button>
        </div>

        {/* Toolbar */}
        <GlassCard className="mb-6 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative w-full md:w-96">
             <Search className="absolute left-3 top-3 text-slate-500" size={18} />
             <input 
               type="text" 
               placeholder="Search by name, ID, or roll number..." 
               className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-500"
             />
           </div>
           
           <div className="flex gap-3 w-full md:w-auto">
             <button className="flex-1 md:flex-none flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-slate-300 transition-colors text-sm">
               <Filter size={16} /> Filters
             </button>
             <button className="flex-1 md:flex-none flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-slate-300 transition-colors text-sm">
               Export CSV
             </button>
           </div>
        </GlassCard>

        {/* Error Banner (If API fails) */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={fetchStudents} className="ml-auto underline hover:text-red-300">Retry</button>
          </div>
        )}

        {/* The Glass Table */}
        <GlassCard className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-slate-400 text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium">Student Info</th>
                  <th className="p-4 font-medium">Academic</th>
                  <th className="p-4 font-medium">Roll No</th>
                  <th className="p-4 font-medium text-right">Fees Due</th>
                  <th className="p-4 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan="5" className="p-8 text-center text-slate-500">Loading directory...</td></tr>
                ) : students.length > 0 ? (
                  students.map((student) => (
                    <tr 
                      key={student.id} 
                      onClick={() => navigate(`/students/${student.id}`)}
                      className="hover:bg-white/5 transition-colors group cursor-pointer"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                            {student.first_name ? student.first_name[0] : '?'}
                          </div>
                          <div>
                            <div className="font-medium text-white">{student.first_name} {student.last_name}</div>
                            <div className="text-xs text-slate-500">{student.student_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-slate-300">
                          Class {student.grade}-{student.section}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300 font-mono">
                        #{student.roll_number || 'N/A'}
                      </td>
                      <td className="p-4 text-right">
                         <span className={`font-mono ${parseFloat(student.fees_due || 0) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                           ${student.fees_due}
                         </span>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={(e) => { e.stopPropagation(); }}
                          className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                   /* Empty State */
                   <tr>
                     <td colSpan="5" className="p-12 text-center">
                       <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                         <UserPlus size={32} />
                       </div>
                       <h3 className="text-lg font-medium text-white">No students yet</h3>
                       <p className="text-slate-400 mt-1 mb-6">Start by admitting the first student.</p>
                     </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Modal Injection */}
        <CreateStudentModal 
          isOpen={isCreateModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onStudentAdded={() => {
            fetchStudents(); 
            setCreateModalOpen(false); 
          }}
        />

      </main>

      <Dock />
    </div>
  );
};

export default Students;