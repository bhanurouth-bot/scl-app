import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Tag, Trash2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import Dock from './Dock';

const FeeHeads = () => {
  const navigate = useNavigate();
  const [heads, setHeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '' });

  const fetchHeads = async () => {
    try {
      const res = await api.get('finance/fee-heads/');
      setHeads(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHeads(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('finance/fee-heads/', formData);
      fetchHeads();
      setIsModalOpen(false);
      setFormData({ name: '' });
    } catch (err) {
      alert("Error: " + JSON.stringify(err.response?.data));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this fee type? It may break existing invoices.")) return;
    try {
      await api.delete(`finance/fee-heads/${id}/`);
      fetchHeads();
    } catch (err) {
      alert("Cannot delete: This fee type is likely in use.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden selection:bg-orange-500/30">
      
      {/* Background Ambience */}
      <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] bg-orange-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <button onClick={() => navigate('/finance')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors group">
             <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/> Back to Finance
          </button>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-orange-200 tracking-tight">
            Fee Categories
          </h1>
          <p className="text-gray-400 mt-2">Master list of fee types (Heads)</p>
        </motion.div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-4 rounded-2xl flex items-center gap-3 transition-all shadow-[0_0_30px_rgba(249,115,22,0.3)]"
        >
          <Plus size={20} /> <span className="font-bold">New Category</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10">
         {loading ? <p className="text-gray-500">Loading...</p> : heads.map((head, idx) => (
             <motion.div 
               key={head.id}
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: idx * 0.05 }}
               className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-white/5 flex items-center justify-between group hover:border-orange-500/50 transition-colors"
             >
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-orange-500/20 to-red-500/20 text-orange-400 rounded-xl">
                        <Tag size={20} />
                    </div>
                    <span className="font-bold text-lg text-white">{head.name}</span>
                 </div>
                 
                 <button 
                    onClick={() => handleDelete(head.id)}
                    className="p-2 rounded-full hover:bg-white/10 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                 >
                    <Trash2 size={18} />
                 </button>
             </motion.div>
         ))}
         
         {/* Empty State */}
         {!loading && heads.length === 0 && (
             <div className="col-span-full text-center py-20 border border-dashed border-white/10 rounded-[2rem]">
                 <p className="text-gray-400 mb-2">No Fee Heads found.</p>
                 <p className="text-sm text-gray-500">Create "Tuition Fee", "Transport", etc.</p>
             </div>
         )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ scale: 0.9 }} animate={{ scale: 1 }} 
               className="glass-panel w-full max-w-md p-8 rounded-[2.5rem] border border-white/20 shadow-2xl"
             >
                <h2 className="text-2xl font-bold text-white mb-6">Add Fee Category</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="text-xs text-gray-500 ml-2 uppercase font-bold">Category Name</label>
                    <input 
                        required 
                        autoFocus
                        placeholder="e.g. Tuition Fee"
                        value={formData.name}
                        onChange={e => setFormData({ name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-orange-500 mt-2 text-lg"
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-white hover:bg-white/5 rounded-xl transition-colors">Cancel</button>
                    <button type="submit" className="px-8 py-3 bg-orange-600 hover:bg-orange-500 rounded-xl text-white font-bold flex items-center gap-2">
                        <Save size={18}/> Save
                    </button>
                  </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Dock />
    </div>
  );
};

export default FeeHeads;