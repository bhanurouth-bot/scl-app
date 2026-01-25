import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, DollarSign, TrendingUp, AlertCircle, 
  Plus, CheckCircle, FileText, Layers, Download 
} from 'lucide-react';
import api from './api';
import Dock from './Dock';
import BulkInvoiceModal from './BulkInvoiceModal';
import PaymentModal from './PaymentModal';

const Finance = () => {
  const navigate = useNavigate();
  
  // --- State ---
  const [stats, setStats] = useState({ total_revenue: 0, collected: 0, pending: 0 });
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // --- Fetch Data ---
  const fetchData = async () => {
    try {
      const [statRes, invRes] = await Promise.all([
        api.get('finance/invoices/stats/'),
        api.get('finance/invoices/')
      ]);
      setStats(statRes.data);
      setInvoices(invRes.data);
    } catch (err) {
      console.error("Finance Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- Helpers ---
  const fmt = (amt) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amt || 0);

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden selection:bg-green-500/30">
      
      {/* --- Liquid Gold Background --- */}
      <div className="fixed top-[-10%] right-[-10%] w-[900px] h-[900px] bg-gradient-to-b from-yellow-600/20 to-green-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-gradient-to-t from-emerald-600/10 to-yellow-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
      
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
               <CreditCard className="text-yellow-400" size={28} />
            </div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-100 to-yellow-200 tracking-tighter">
              Finance
            </h1>
          </div>
          <p className="text-gray-400 font-medium pl-2">Revenue, Fees & Collection</p>
        </motion.div>

        {/* --- Quick Actions --- */}
        <div className="flex gap-4">
            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/finance/structures')}
                className="bg-white/5 hover:bg-white/10 text-white font-bold px-6 py-4 rounded-[2rem] flex items-center gap-2 border border-white/10 backdrop-blur-md transition-all"
            >
                <Layers size={20} /> <span className="hidden md:inline">Fee Structures</span>
            </motion.button>
            
            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/finance/heads')}
                className="bg-white/5 hover:bg-white/10 text-white font-bold px-6 py-4 rounded-[2rem] flex items-center gap-2 border border-white/10 backdrop-blur-md transition-all"
            >
                <FileText size={20} /> <span className="hidden md:inline">Fee Types</span>
            </motion.button>

            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsBulkOpen(true)}
                className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold px-8 py-4 rounded-[2rem] flex items-center gap-2 shadow-[0_0_40px_rgba(234,179,8,0.3)] transition-all"
            >
                <Plus size={20} /> New Invoice
            </motion.button>
        </div>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative z-10">
        <motion.div className="glass-panel p-8 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 relative overflow-hidden group">
           <div className="relative z-10">
               <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Total Invoiced</p>
               <h2 className="text-5xl font-bold text-white tracking-tight">{fmt(stats.total_revenue)}</h2>
           </div>
        </motion.div>
        
        <motion.div className="glass-panel p-8 rounded-[2.5rem] bg-gradient-to-br from-green-500/20 to-transparent border border-green-500/20 relative overflow-hidden group">
           <div className="relative z-10">
               <p className="text-green-200 text-sm font-bold uppercase tracking-wider mb-2">Collected</p>
               <h2 className="text-5xl font-bold text-green-400 tracking-tight">{fmt(stats.collected)}</h2>
           </div>
        </motion.div>

        <motion.div className="glass-panel p-8 rounded-[2.5rem] bg-gradient-to-br from-red-500/20 to-transparent border border-red-500/20 relative overflow-hidden group">
           <div className="relative z-10">
               <p className="text-red-200 text-sm font-bold uppercase tracking-wider mb-2">Pending Dues</p>
               <h2 className="text-5xl font-bold text-red-400 tracking-tight">{fmt(stats.pending)}</h2>
           </div>
        </motion.div>
      </div>

      {/* --- INVOICE LIST --- */}
      <div className="relative z-10">
         <h3 className="text-2xl font-bold text-white mb-6 pl-4 flex items-center gap-2">
            Recent Invoices
            <span className="text-sm font-normal text-gray-500 bg-white/10 px-2 py-1 rounded-lg">{invoices.length}</span>
         </h3>
         
         {loading ? (
             <div className="flex flex-col items-center justify-center py-20">
                 <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
             </div>
         ) : invoices.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-[2rem] bg-white/5">
                 <p className="text-gray-400 text-lg">No invoices generated yet.</p>
             </div>
         ) : (
             <div className="grid grid-cols-1 gap-4 pb-20">
                {invoices.map((inv, idx) => (
                   <motion.div 
                     key={inv.id}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: idx * 0.05 }}
                     whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.08)" }}
                     className={`glass-panel p-6 rounded-[2rem] border border-white/5 bg-white/5 transition-all flex flex-col md:flex-row items-center justify-between group ${inv.status !== 'PAID' ? 'cursor-pointer hover:border-yellow-500/30' : ''}`}
                   >
                      <div 
                        className="flex items-center gap-5 w-full md:w-auto flex-1"
                        onClick={() => { if (inv.status !== 'PAID') setSelectedInvoice(inv); }}
                      >
                         <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl border shadow-lg ${
                            inv.status === 'PAID' ? 'bg-green-500/10 border-green-500/20 text-green-400 shadow-green-900/20' : 
                            inv.status === 'PARTIAL' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 shadow-yellow-900/20' :
                            'bg-red-500/10 border-red-500/20 text-red-400 shadow-red-900/20'
                         }`}>
                            {inv.status === 'PAID' ? <CheckCircle size={28}/> : <FileText size={28}/>}
                         </div>
                         
                         <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="font-mono text-xs font-bold text-gray-400 bg-black/40 px-2 py-1 rounded-lg border border-white/10 tracking-wider">
                                    {inv.invoice_number}
                                </span>
                                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                                    {inv.classroom_name || 'Class N/A'}
                                </span>
                            </div>
                            <h4 className="text-xl font-bold text-white group-hover:text-yellow-200 transition-colors">
                                {inv.student_name || 'Unknown Student'}
                            </h4>
                            <p className="text-sm text-gray-400">Due: {inv.due_date}</p>
                         </div>
                      </div>

                      <div className="flex items-center gap-6 mt-4 md:mt-0">
                         {/* --- DOWNLOAD BUTTON --- */}
                         <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(`http://127.0.0.1:8000/api/finance/invoices/${inv.id}/download/`, '_blank');
                            }}
                            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-blue-400 border border-transparent hover:border-blue-400/30 transition-all"
                            title="Download PDF"
                         >
                            <Download size={20} />
                         </button>

                         <div className="text-right">
                             <div className="text-3xl font-bold text-white font-mono tracking-tight">{fmt(inv.total_amount)}</div>
                             
                             {inv.balance_due > 0 ? (
                                 <div className="flex items-center justify-end gap-2 text-xs font-bold text-red-400 mt-1 bg-red-500/10 px-2 py-1 rounded-lg inline-flex float-right">
                                    <AlertCircle size={12} />
                                    <span>Due: {fmt(inv.balance_due)}</span>
                                 </div>
                             ) : (
                                 <div className="flex items-center justify-end gap-2 text-xs font-bold text-green-400 mt-1 bg-green-500/10 px-2 py-1 rounded-lg inline-flex float-right">
                                    <CheckCircle size={12} />
                                    <span>PAID</span>
                                 </div>
                             )}
                         </div>
                      </div>
                   </motion.div>
                ))}
             </div>
         )}
      </div>

      <Dock />
      <BulkInvoiceModal isOpen={isBulkOpen} onClose={() => setIsBulkOpen(false)} onSuccess={fetchData} />
      <PaymentModal invoice={selectedInvoice} isOpen={!!selectedInvoice} onClose={() => setSelectedInvoice(null)} onSuccess={fetchData} />
    </div>
  );
};

export default Finance;