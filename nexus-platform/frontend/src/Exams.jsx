import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Calendar, Plus, ChevronRight, Clock, FileText, Trash2 } from 'lucide-react';
import api from './api';
import Dock from './Dock';

const Exams = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State for New Exam Batch
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBatch, setNewBatch] = useState({ name: '', start_date: '', end_date: '', academic_year: '' });
  const [years, setYears] = useState([]);

  // Fetch Data
  const fetchData = async () => {
    try {
      const [batchRes, yearRes] = await Promise.all([
        api.get('exams/batches/'),
        api.get('core/years/')
      ]);
      setBatches(batchRes.data);
      setYears(yearRes.data);
      
      // Auto-select current year
      const activeYear = yearRes.data.find(y => y.is_current);
      if (activeYear) setNewBatch(prev => ({ ...prev, academic_year: activeYear.id }));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      await api.post('exams/batches/', newBatch);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Failed to create batch: " + JSON.stringify(err.response?.data));
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if(!window.confirm("Delete this exam batch? This will delete all papers and marks inside it.")) return;
    try {
        await api.delete(`exams/batches/${id}/`);
        fetchData();
    } catch(err) { alert("Failed to delete."); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden selection:bg-pink-500/30">
      
      {/* Background Ambience */}
      <div className="fixed top-[-10%] left-[-10%] w-[900px] h-[900px] bg-pink-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
               <GraduationCap className="text-pink-400" size={28} />
            </div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-100 to-pink-200 tracking-tighter">
              Exams
            </h1>
          </div>
          <p className="text-gray-400 font-medium pl-2">Examination & Grading</p>
        </motion.div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-pink-600 hover:bg-pink-500 text-white font-bold px-8 py-4 rounded-[2rem] flex items-center gap-2 shadow-[0_0_40px_rgba(236,72,153,0.3)] transition-all"
        >
          <Plus size={20} /> New Exam Batch
        </button>
      </div>

      {/* Exam Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
         {loading ? <div className="text-gray-500">Loading Exams...</div> : batches.length === 0 ? (
             <div className="col-span-full text-center py-20 border border-dashed border-white/10 rounded-[2rem] text-gray-500">
                 No Exams Scheduled. Click "New Exam Batch" to start.
             </div>
         ) : batches.map((batch, idx) => (
             <motion.div 
               key={batch.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
               onClick={() => navigate(`/exams/${batch.id}`)}
               className="glass-panel p-8 rounded-[2.5rem] border border-white/10 bg-white/5 hover:bg-white/10 transition-all group cursor-pointer relative overflow-hidden"
             >
                 {/* Decorative Icon */}
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
                    <FileText size={120} />
                 </div>

                 <div className="relative z-10">
                     <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 rounded-lg bg-pink-500/20 text-pink-300 text-xs font-bold uppercase tracking-wider border border-pink-500/20">
                            {batch.is_published ? 'Published' : 'Draft'}
                        </span>
                        <button onClick={(e) => handleDelete(batch.id, e)} className="text-gray-600 hover:text-red-400 p-2"><Trash2 size={18} /></button>
                     </div>

                     <h3 className="text-2xl font-bold text-white mb-2 leading-tight">{batch.name}</h3>
                     
                     <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
                        <Calendar size={14} />
                        <span>{batch.start_date} — {batch.end_date}</span>
                     </div>

                     <div className="flex items-center gap-2 text-pink-400 font-bold group-hover:gap-4 transition-all">
                        <span>View Papers</span>
                        <ChevronRight size={18} />
                     </div>
                 </div>
             </motion.div>
         ))}
      </div>

      <Dock />

      {/* Modal: New Batch */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
             <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full max-w-md bg-[#111] border border-white/10 rounded-[2rem] p-8 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-6">Create Exam Event</h2>
                <form onSubmit={handleCreateBatch} className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold ml-2">Event Name</label>
                        <input required placeholder="e.g. Finals 2026" value={newBatch.name} onChange={e => setNewBatch({...newBatch, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-pink-500" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold ml-2">Start Date</label>
                            <input required type="date" value={newBatch.start_date} onChange={e => setNewBatch({...newBatch, start_date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-pink-500" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold ml-2">End Date</label>
                            <input required type="date" value={newBatch.end_date} onChange={e => setNewBatch({...newBatch, end_date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-pink-500" />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold ml-2">Academic Year</label>
                        <select required value={newBatch.academic_year} onChange={e => setNewBatch({...newBatch, academic_year: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-pink-500 [&>option]:bg-gray-900">
                            <option value="">Select Year</option>
                            {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                        </select>
                    </div>

                    <button type="submit" className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 rounded-xl mt-4">Create Batch</button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-gray-500 hover:text-white py-2">Cancel</button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Exams;