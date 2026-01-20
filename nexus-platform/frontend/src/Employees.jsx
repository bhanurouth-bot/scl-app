import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Briefcase, Phone, User, Calendar, Settings, Droplets } from 'lucide-react';
import api from './api';
import Dock from './Dock';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'setup'

  // Form State
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', 
    employee_id: '', 
    department: '', designation: '', 
    join_date: '', basic_salary: ''
  });

  const [setupData, setSetupData] = useState({ name: '', type: 'DEPT' }); 

  const fetchData = async () => {
    try {
      const [empRes, deptRes, desigRes] = await Promise.all([
        api.get('hr/employees/'),
        api.get('hr/departments/'),
        api.get('hr/designations/')
      ]);
      setEmployees(empRes.data);
      setDepartments(deptRes.data);
      setDesignations(desigRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      await api.post('hr/employees/', formData);
      fetchData();
      setIsModalOpen(false);
    } catch (err) {
      alert("Error: " + JSON.stringify(err.response?.data));
    }
  };

  const handleCreateSetup = async (e) => {
    e.preventDefault();
    try {
      const endpoint = setupData.type === 'DEPT' ? 'hr/departments/' : 'hr/designations/';
      const payload = setupData.type === 'DEPT' ? { name: setupData.name } : { title: setupData.name };
      
      await api.post(endpoint, payload);
      fetchData();
      setSetupData({ ...setupData, name: '' });
    } catch (err) {
      alert("Error creating metadata");
    }
  };

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden selection:bg-cyan-500/30">
      
      {/* --- Liquid Ambience --- */}
      {/* Moving Blobs */}
      <div className="fixed top-[-10%] right-[-10%] w-[900px] h-[900px] bg-gradient-to-b from-cyan-500/20 to-blue-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[900px] h-[900px] bg-gradient-to-t from-purple-500/20 to-pink-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/5 rounded-full border border-white/20 backdrop-blur-xl shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]">
               <Droplets className="text-cyan-400" size={28} />
            </div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-200 tracking-tighter">
              Staff
            </h1>
          </div>
          <p className="text-gray-400 font-medium pl-2">Liquid Directory & HR Management</p>
        </motion.div>

        <div className="flex gap-4">
           {/* Liquid Button: Secondary */}
           <button 
             onClick={() => setActiveTab(activeTab === 'list' ? 'setup' : 'list')}
             className="bg-white/5 hover:bg-white/10 text-white px-6 py-4 rounded-[2rem] flex items-center gap-2 transition-all border border-white/10 backdrop-blur-2xl shadow-lg"
           >
             <Settings size={20} /> <span className="hidden md:inline font-bold">{activeTab === 'list' ? 'Roles & Depts' : 'View Staff'}</span>
           </button>
           
           {/* Liquid Button: Primary */}
           <button 
             onClick={() => setIsModalOpen(true)}
             className="relative overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-4 rounded-[2rem] flex items-center gap-3 transition-all shadow-[0_0_40px_rgba(6,182,212,0.4)] border border-white/20"
           >
             <Plus size={20} strokeWidth={3} /> <span className="font-bold tracking-wide">Add Employee</span>
           </button>
        </div>
      </div>

      {/* --- SETUP TAB (Liquid Containers) --- */}
      {activeTab === 'setup' && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Departments */}
            <div className="relative p-8 rounded-[3rem] border border-white/20 bg-gradient-to-b from-white/10 to-white/0 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                <div className="absolute inset-0 rounded-[3rem] bg-white/5 pointer-events-none border-t border-l border-white/20"></div> {/* Specular Highlight */}
                
                <h3 className="text-2xl font-bold text-white mb-6">Departments</h3>
                <div className="flex flex-wrap gap-3 mb-8">
                    {departments.map(d => (
                        <span key={d.id} className="px-4 py-2 bg-black/20 rounded-2xl text-sm font-medium border border-white/5 text-cyan-100 shadow-inner">{d.name}</span>
                    ))}
                </div>
                <form onSubmit={handleCreateSetup} className="flex gap-3">
                    <input 
                        placeholder="New Dept Name" 
                        className="flex-1 bg-black/20 border border-white/10 p-4 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                        value={setupData.type === 'DEPT' ? setupData.name : ''}
                        onChange={(e) => setSetupData({ name: e.target.value, type: 'DEPT' })}
                        onFocus={() => setSetupData({...setupData, type: 'DEPT'})}
                    />
                    <button type="submit" className="bg-cyan-600/80 hover:bg-cyan-500 p-4 rounded-2xl text-white transition-colors backdrop-blur-md border border-white/10"><Plus size={24}/></button>
                </form>
            </div>

            {/* Designations */}
            <div className="relative p-8 rounded-[3rem] border border-white/20 bg-gradient-to-b from-white/10 to-white/0 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                <div className="absolute inset-0 rounded-[3rem] bg-white/5 pointer-events-none border-t border-l border-white/20"></div>

                <h3 className="text-2xl font-bold text-white mb-6">Designations</h3>
                <div className="flex flex-wrap gap-3 mb-8">
                    {designations.map(d => (
                        <span key={d.id} className="px-4 py-2 bg-black/20 rounded-2xl text-sm font-medium border border-white/5 text-purple-100 shadow-inner">{d.title}</span>
                    ))}
                </div>
                <form onSubmit={handleCreateSetup} className="flex gap-3">
                    <input 
                        placeholder="New Job Title" 
                        className="flex-1 bg-black/20 border border-white/10 p-4 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                        value={setupData.type === 'DESIG' ? setupData.name : ''}
                        onChange={(e) => setSetupData({ name: e.target.value, type: 'DESIG' })}
                        onFocus={() => setSetupData({...setupData, type: 'DESIG'})}
                    />
                    <button type="submit" className="bg-purple-600/80 hover:bg-purple-500 p-4 rounded-2xl text-white transition-colors backdrop-blur-md border border-white/10"><Plus size={24}/></button>
                </form>
            </div>
        </motion.div>
      )}

      {/* --- STAFF GRID (Liquid Cards) --- */}
      {activeTab === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative z-10">
            {employees.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-32 border border-dashed border-white/10 rounded-[3rem] bg-white/5 backdrop-blur-md">
                    <p className="text-gray-400 text-lg">Directory Empty</p>
                </div>
            ) : employees.map((emp, idx) => (
              <motion.div 
                key={emp.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative p-6 rounded-[2.5rem] overflow-hidden transition-all duration-500"
              >
                 {/* --- THE LIQUID GLASS LAYER --- */}
                 {/* 1. Base Gradient (Transparent top, fades out bottom) */}
                 <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-[40px] border border-white/10 group-hover:border-white/20 transition-colors"></div>
                 
                 {/* 2. Specular Highlights (Top & Left edges shine) */}
                 <div className="absolute inset-0 rounded-[2.5rem] border-t border-l border-white/30 pointer-events-none"></div>
                 
                 {/* 3. Inner Shadow for Depth */}
                 <div className="absolute inset-0 rounded-[2.5rem] shadow-[inset_0_0_40px_rgba(255,255,255,0.05)] pointer-events-none"></div>

                 {/* Content */}
                 <div className="relative z-10">
                     <div className="flex items-start justify-between mb-8">
                        {/* Avatar Bubble */}
                        <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-cyan-400/80 to-blue-600/80 flex items-center justify-center text-3xl font-bold text-white shadow-lg border border-white/20 backdrop-blur-md">
                          {emp.user?.first_name?.[0] || "U"}
                        </div>
                        
                        {/* ID Badge */}
                        <span className="text-[10px] font-bold font-mono text-cyan-200 bg-cyan-500/20 px-3 py-1.5 rounded-xl border border-cyan-500/30 backdrop-blur-md">
                            {emp.employee_id}
                        </span>
                     </div>

                     <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-cyan-200 transition-colors">{emp.user?.first_name} {emp.user?.last_name}</h3>
                     <p className="text-sm text-gray-400 mb-6">{emp.email}</p>

                     <div className="space-y-3">
                       <div className="flex items-center justify-between p-3 rounded-2xl bg-black/20 border border-white/5 backdrop-blur-sm group-hover:bg-black/30 transition-colors">
                         <div className="flex items-center gap-3 text-sm text-gray-300">
                             <Briefcase size={16} className="text-cyan-400" />
                             <span className="font-medium">{emp.designation_details?.title || "N/A"}</span>
                         </div>
                       </div>
                       
                       <div className="flex items-center justify-between p-3 rounded-2xl bg-black/20 border border-white/5 backdrop-blur-sm group-hover:bg-black/30 transition-colors">
                         <div className="flex items-center gap-3 text-sm text-gray-300">
                             <User size={16} className="text-purple-400" />
                             <span className="font-medium">{emp.department_details?.name || "N/A"}</span>
                         </div>
                       </div>
                     </div>
                 </div>
              </motion.div>
            ))}
          </div>
      )}

      {/* --- CREATE MODAL (Glass Sheet) --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
               className="relative w-full max-w-2xl p-10 rounded-[3rem] overflow-hidden"
             >
                {/* Modal Background: Heavy Glass */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800/80 to-black/90 backdrop-blur-3xl border border-white/20"></div>
                
                <div className="relative z-10">
                    <h2 className="text-4xl font-bold text-white mb-2">New Employee</h2>
                    <p className="text-gray-400 mb-8">Create a new profile and access credentials.</p>

                    <form onSubmit={handleCreateEmployee} className="space-y-6">
                    
                    <div className="grid grid-cols-2 gap-5">
                        <input name="first_name" placeholder="First Name" required onChange={handleChange} className="bg-white/5 border border-white/10 p-4 rounded-2xl text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all placeholder-gray-500" />
                        <input name="last_name" placeholder="Last Name" required onChange={handleChange} className="bg-white/5 border border-white/10 p-4 rounded-2xl text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all placeholder-gray-500" />
                    </div>
                    
                    <input name="email" type="email" placeholder="Email Address" required onChange={handleChange} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all placeholder-gray-500" />
                    
                    <div className="grid grid-cols-2 gap-5">
                        <input name="employee_id" placeholder="ID (e.g. EMP-001)" required onChange={handleChange} className="bg-white/5 border border-white/10 p-4 rounded-2xl text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all placeholder-gray-500" />
                        <input name="basic_salary" type="number" placeholder="Basic Salary" required onChange={handleChange} className="bg-white/5 border border-white/10 p-4 rounded-2xl text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all placeholder-gray-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="relative">
                            <select name="department" required onChange={handleChange} className="w-full appearance-none bg-white/5 border border-white/10 p-4 rounded-2xl text-white focus:outline-none focus:border-cyan-500/50 [&>option]:bg-gray-900">
                            <option value="">Select Department</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>

                        <div className="relative">
                            <select name="designation" required onChange={handleChange} className="w-full appearance-none bg-white/5 border border-white/10 p-4 rounded-2xl text-white focus:outline-none focus:border-cyan-500/50 [&>option]:bg-gray-900">
                            <option value="">Select Designation</option>
                            {designations.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                        <span className="text-gray-400 pl-2">Joining Date</span>
                        <input name="join_date" type="date" required onChange={handleChange} className="bg-transparent text-white focus:outline-none text-right" />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-2xl text-white hover:bg-white/10 transition-colors font-bold">Cancel</button>
                        <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-2xl text-white font-bold shadow-lg shadow-cyan-500/20">Create Profile</button>
                    </div>
                    </form>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Dock />
    </div>
  );
};

export default Employees;