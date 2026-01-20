import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Layers, DollarSign, Trash2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import Dock from './Dock';

const FeeStructures = () => {
  const navigate = useNavigate();
  const [structures, setStructures] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [feeHeads, setFeeHeads] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    academic_year: '',
    classroom: '',
    fee_head: '',
    amount: '',
    due_date: ''
  });

  const fetchData = async () => {
    try {
      const [structRes, classRes, headRes, yearRes] = await Promise.all([
        api.get('finance/fee-structures/'),
        api.get('core/classrooms/'),
        api.get('finance/fee-heads/'),
        api.get('core/years/')
      ]);
      setStructures(structRes.data);
      setClassrooms(classRes.data);
      setFeeHeads(headRes.data);
      setAcademicYears(yearRes.data);

      // Auto-select active year if available
      const activeYear = yearRes.data.find(y => y.is_current);
      if (activeYear) setFormData(prev => ({ ...prev, academic_year: activeYear.id }));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('finance/fee-structures/', formData);
      fetchData();
      setIsModalOpen(false);
      setFormData(prev => ({ ...prev, amount: '', fee_head: '' })); // Keep class selected for speed
    } catch (err) {
      alert("Error: " + JSON.stringify(err.response?.data));
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Remove this fee rule?")) return;
    try {
      await api.delete(`finance/fee-structures/${id}/`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Group by Class for better UI
  const grouped = structures.reduce((acc, curr) => {
    const cls = curr.classroom_name || 'Unknown Class';
    if (!acc[cls]) acc[cls] = [];
    acc[cls].push(curr);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden selection:bg-yellow-500/30">
      
      {/* Ambience */}
      <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] bg-yellow-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <button onClick={() => navigate('/finance')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors group">
             <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/> Back to Finance
          </button>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-yellow-200 tracking-tight">
            Fee Structures
          </h1>
          <p className="text-gray-400 mt-2">Define tuition rules per class</p>
        </motion.div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-yellow-600 hover:bg-yellow-500 text-black px-6 py-4 rounded-2xl flex items-center gap-3 transition-all shadow-[0_0_30px_rgba(234,179,8,0.3)]"
        >
          <Plus size={20} /> <span className="font-bold">Add Rule</span>
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
         {Object.keys(grouped).length === 0 && !loading && (
             <div className="col-span-full text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-3xl">
                 No Fee Structures Defined.
             </div>
         )}

         {Object.keys(grouped).map((className, idx) => (
             <motion.div 
               key={className}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
               className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-white/5"
             >
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-yellow-500/20 text-yellow-400 rounded-xl"><Layers size={20}/></div>
                    <h3 className="text-xl font-bold text-white">{className}</h3>
                 </div>

                 <div className="space-y-3">
                    {grouped[className].map(rule => (
                        <div key={rule.id} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 group">
                            <div>
                                <div className="text-sm font-bold text-white">{rule.fee_name}</div>
                                <div className="text-xs text-gray-500">Due: {rule.due_date || 'N/A'}</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-yellow-400 font-mono font-bold">${rule.amount}</span>
                                <button onClick={() => handleDelete(rule.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    {/* Total Calculation */}
                    <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-4">
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Total Per Student</span>
                        <span className="text-lg font-bold text-white">
                            ${grouped[className].reduce((sum, item) => sum + parseFloat(item.amount), 0)}
                        </span>
                    </div>
                 </div>
             </motion.div>
         ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ scale: 0.9 }} animate={{ scale: 1 }} 
               className="glass-panel w-full max-w-lg p-8 rounded-[2.5rem] border border-white/20 shadow-2xl"
             >
                <h2 className="text-2xl font-bold text-white mb-6">New Fee Rule</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Academic Year */}
                  <div>
                    <label className="text-xs text-gray-500 ml-2">Academic Year</label>
                    <select 
                      required 
                      value={formData.academic_year}
                      onChange={e => setFormData({...formData, academic_year: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-yellow-500 [&>option]:bg-gray-900"
                    >
                        <option value="">Select Year</option>
                        {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                    </select>
                  </div>

                  {/* Class */}
                  <div>
                    <label className="text-xs text-gray-500 ml-2">Classroom</label>
                    <select 
                      required 
                      value={formData.classroom}
                      onChange={e => setFormData({...formData, classroom: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-yellow-500 [&>option]:bg-gray-900"
                    >
                        <option value="">Select Class</option>
                        {classrooms.map(c => <option key={c.id} value={c.id}>Grade {c.grade_level} - {c.section}</option>)}
                    </select>
                  </div>

                  {/* Fee Head */}
                  <div>
                    <label className="text-xs text-gray-500 ml-2">Fee Head</label>
                    <select 
                      required 
                      value={formData.fee_head}
                      onChange={e => setFormData({...formData, fee_head: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-yellow-500 [&>option]:bg-gray-900"
                    >
                        <option value="">Select Fee Type</option>
                        {feeHeads.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                    {feeHeads.length === 0 && <p className="text-xs text-red-400 mt-1">No Fee Heads found. Create one in Admin.</p>}
                  </div>

                  {/* Amount & Date */}
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 ml-2">Amount</label>
                        <div className="relative">
                            <DollarSign size={14} className="absolute left-3 top-3.5 text-gray-500"/>
                            <input 
                                required 
                                type="number" 
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={e => setFormData({...formData, amount: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 pl-8 p-3 rounded-xl text-white outline-none focus:border-yellow-500"
                            />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 ml-2">Due Date</label>
                        <input 
                            type="date" 
                            value={formData.due_date}
                            onChange={e => setFormData({...formData, due_date: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-yellow-500"
                        />
                      </div>
                  </div>

                  <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-white/10">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-white hover:bg-white/5 rounded-xl transition-colors">Cancel</button>
                    <button type="submit" className="px-8 py-3 bg-yellow-600 hover:bg-yellow-500 rounded-xl text-black font-bold flex items-center gap-2">
                        <Save size={18}/> Save Rule
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

export default FeeStructures;