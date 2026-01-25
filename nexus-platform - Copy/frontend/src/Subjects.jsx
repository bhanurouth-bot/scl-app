import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Save, Book, Hash, FileText, Trash2, Microscope, Layers, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import Dock from './Dock';

const Subjects = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Updated Form Data based on your Django Model
  const [formData, setFormData] = useState({ 
    name: '', 
    code: '', 
    subject_type: 'THEORY', 
    credits: 1,
    description: '' 
  });

  const fetchSubjects = async () => {
    try {
      const res = await api.get('academics/subjects/');
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('academics/subjects/', formData);
      fetchSubjects();
      setIsModalOpen(false);
      // Reset Form
      setFormData({ name: '', code: '', subject_type: 'THEORY', credits: 1, description: '' }); 
    } catch (err) {
      alert("Error: " + JSON.stringify(err.response?.data));
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if(window.confirm("Delete this subject? This will remove it from all allocated classes.")) {
        await api.delete(`academics/subjects/${id}/`);
        fetchSubjects();
    }
  };

  // Helper for dynamic visuals
  const getTypeStyle = (type) => {
    switch(type) {
      case 'PRACTICAL': return { color: 'text-purple-400', bg: 'bg-purple-500/20', icon: Microscope };
      case 'ELECTIVE': return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: Star };
      default: return { color: 'text-blue-400', bg: 'bg-blue-500/20', icon: Book };
    }
  };

  // Helper for gradients
  const getGradient = (type) => {
    switch(type) {
      case 'PRACTICAL': return 'from-purple-600 to-indigo-600';
      case 'ELECTIVE': return 'from-orange-500 to-yellow-500';
      default: return 'from-blue-600 to-cyan-500';
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden selection:bg-pink-500/30">
      
      {/* --- Vibrant Background --- */}
      <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] bg-pink-900/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <button onClick={() => navigate('/academics')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors group">
             <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/> Back to Academics
          </button>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-pink-200 tracking-tight">
            Global Subjects
          </h1>
          <p className="text-gray-400 mt-2">Master database of all courses (Theory, Labs & Electives)</p>
        </motion.div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-4 rounded-2xl flex items-center gap-3 border border-white/20 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform"/> <span className="font-bold">New Subject</span>
        </button>
      </div>

      {/* --- Grid --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            Loading Database...
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 relative z-10">
            
            {subjects.map((sub, idx) => {
                const style = getTypeStyle(sub.subject_type);
                const Icon = style.icon;
                
                return (
                    <motion.div 
                        key={sub.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="aspect-square glass-panel p-6 rounded-[2rem] relative group overflow-hidden border border-white/10 hover:border-white/30 transition-all hover:-translate-y-1"
                    >
                        {/* Dynamic Background Blob */}
                        <div className={`absolute top-[-30%] right-[-30%] w-40 h-40 rounded-full bg-gradient-to-br ${getGradient(sub.subject_type)} blur-[50px] opacity-30 group-hover:opacity-50 transition-opacity`}></div>
                        
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            
                            {/* Top Row: Code & Delete */}
                            <div className="flex justify-between items-start">
                                <span className="font-mono text-[10px] font-bold text-white/70 border border-white/10 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md">
                                    {sub.code}
                                </span>
                                <button 
                                    onClick={(e) => handleDelete(sub.id, e)} 
                                    className="p-1.5 rounded-full hover:bg-red-500/20 text-white/20 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 size={14}/>
                                </button>
                            </div>

                            {/* Middle: Name */}
                            <div>
                                <h3 className="text-xl font-bold text-white leading-tight mb-1">{sub.name}</h3>
                                <div className={`flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase ${style.color}`}>
                                    <Icon size={10} />
                                    {sub.subject_type}
                                </div>
                            </div>

                            {/* Bottom: Credits */}
                            <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs text-gray-400">
                                <span>Credits</span>
                                <span className="text-white font-mono bg-white/5 px-2 py-0.5 rounded-md">{sub.credits}</span>
                            </div>
                        </div>
                    </motion.div>
                );
            })}

            {/* Quick Add Card */}
            <button 
                onClick={() => setIsModalOpen(true)}
                className="aspect-square rounded-[2rem] border-2 border-dashed border-white/10 hover:border-white/30 hover:bg-white/5 flex flex-col items-center justify-center transition-all group gap-2"
            >
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                    <Plus size={24} className="text-gray-500 group-hover:text-pink-400" />
                </div>
                <span className="text-xs font-bold text-gray-500 group-hover:text-white uppercase tracking-widest">Add New</span>
            </button>

        </div>
      )}

      {/* --- Create Modal --- */}
      <AnimatePresence>
        {isModalOpen && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
                onClick={() => setIsModalOpen(false)}
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="glass-panel w-full max-w-lg p-8 rounded-[2.5rem] border border-white/20 shadow-2xl relative overflow-hidden"
                >
                    {/* Modal Gradient */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 blur-[80px] pointer-events-none"></div>

                    <h2 className="text-3xl font-bold text-white mb-1">New Subject</h2>
                    <p className="text-gray-400 text-sm mb-8">Define a new course for the curriculum.</p>

                    <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                        
                        {/* Name & Code */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <label className="text-xs text-gray-400 uppercase font-bold mb-1 block pl-1">Subject Name</label>
                                <input required placeholder="e.g. Adv Mathematics" className="glass-input w-full p-3 rounded-xl text-white border border-white/10 focus:border-pink-500/50" 
                                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div className="col-span-1">
                                <label className="text-xs text-gray-400 uppercase font-bold mb-1 block pl-1">Code</label>
                                <input required placeholder="MATH-102" className="glass-input w-full p-3 rounded-xl text-white border border-white/10 focus:border-pink-500/50 uppercase" 
                                    value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                            </div>
                        </div>

                        {/* Type & Credits */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold mb-1 block pl-1">Type</label>
                                <select 
                                    className="glass-input w-full p-3 rounded-xl text-white bg-black/40 [&>option]:bg-zinc-900 border border-white/10"
                                    value={formData.subject_type}
                                    onChange={e => setFormData({...formData, subject_type: e.target.value})}
                                >
                                    <option value="THEORY">Theory</option>
                                    <option value="PRACTICAL">Practical / Lab</option>
                                    <option value="ELECTIVE">Elective</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 uppercase font-bold mb-1 block pl-1">Credits</label>
                                <input type="number" min="0" className="glass-input w-full p-3 rounded-xl text-white border border-white/10" 
                                    value={formData.credits} onChange={e => setFormData({...formData, credits: e.target.value})} />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-xs text-gray-400 uppercase font-bold mb-1 block pl-1">Description</label>
                            <textarea placeholder="Brief curriculum overview..." className="glass-input w-full p-3 rounded-xl text-white h-24 resize-none border border-white/10" 
                                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                        </div>
                        
                        <button type="submit" className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-pink-900/20 flex justify-center items-center gap-2 mt-4 active:scale-95">
                            <Save size={18} /> Save to Database
                        </button>
                    </form>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      <Dock />
    </div>
  );
};

export default Subjects;