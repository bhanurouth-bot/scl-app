import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, UserPlus, LogOut, Search, 
  MapPin, Phone, Grid, List as ListIcon, 
  ChevronRight, Bell, Plus, History
} from 'lucide-react';
import api from './api';
import Dock from './Dock';
import { ConfirmationModal, AlertModal } from './components/GlassModals';

const Visitors = () => {
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'new' | 'history'
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Data
  const [visitors, setVisitors] = useState([]);
  const [stats, setStats] = useState({ active_now: 0, total_today: 0 });
  const [formData, setFormData] = useState({ name: '', phone: '', purpose: '', person_to_meet: '' });

  // Modals
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const [alertModal, setAlertModal] = useState({ isOpen: false });

  // --- Clock ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Fetch Data ---
  useEffect(() => {
    fetchData();
    fetchStats();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let statusFilter = activeTab === 'active' ? 'ON_CAMPUS' : 'CHECKED_OUT';
      if (activeTab === 'new') return;
      const res = await api.get(`visitors/visitors/?status=${statusFilter}`);
      setVisitors(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
        const res = await api.get('visitors/visitors/stats/');
        setStats(res.data);
    } catch (err) { console.error(err); }
  };

  // --- Actions ---
  const handleCheckIn = async () => {
      if(!formData.name || !formData.purpose) {
          setAlertModal({ isOpen: true, title: "Missing Info", message: "Name and Purpose required.", type: "error" });
          return;
      }
      setLoading(true);
      try {
          await api.post('visitors/visitors/', formData);
          setAlertModal({ isOpen: true, title: "Pass Issued", message: "Visitor logged successfully.", type: "success" });
          setFormData({ name: '', phone: '', purpose: '', person_to_meet: '' });
          setActiveTab('active');
      } catch (err) { 
          setAlertModal({ isOpen: true, title: "Error", message: "Check-in failed.", type: "error" });
      } finally { setLoading(false); }
  };

  const performCheckOut = async () => {
      if (!confirmModal.id) return;
      try {
          await api.post(`visitors/visitors/${confirmModal.id}/check_out/`);
          fetchData(); fetchStats();
          setConfirmModal({ ...confirmModal, isOpen: false });
      } catch (err) { alert("Failed"); }
  };

  return (
    <div className="min-h-screen bg-black overflow-hidden relative font-sans selection:bg-blue-500/40 text-sm">
      
      {/* 1. Dynamic Wallpaper */}
      <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-black"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 brightness-100 contrast-125 mix-blend-overlay"></div>
      </div>

      {/* 2. The Application Window */}
      <div className="relative z-10 flex items-center justify-center h-screen p-4 md:p-12">
        <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="w-full max-w-[1400px] h-full max-h-[900px] bg-[#1a1a1a]/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden relative ring-1 ring-black/50"
        >
            
            {/* --- TITLE BAR (CLEAN) --- */}
            <div className="h-12 bg-white/5 border-b border-white/5 flex items-center justify-between px-4 shrink-0 select-none drag-region">
                
                {/* Title */}
                <div className="flex items-center gap-2 opacity-80">
                    <div className="p-1 rounded bg-blue-500/20 border border-blue-500/30">
                        <Shield size={14} className="text-blue-400" />
                    </div>
                    <span className="font-semibold text-white/90 tracking-wide">Gatekeeper</span>
                </div>

                {/* Toolbar Actions */}
                <div className="flex gap-3">
                     <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors"><Search size={14} className="text-gray-400"/></button>
                     <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors"><Bell size={14} className="text-gray-400"/></button>
                </div>
            </div>

            {/* --- MAIN BODY --- */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* A. SIDEBAR */}
                <aside className="w-64 bg-black/20 backdrop-blur-xl border-r border-white/5 flex flex-col p-4 shrink-0">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Locations</div>
                    <nav className="space-y-1 mb-6">
                        <SidebarItem 
                            label="On Campus" 
                            icon={MapPin} 
                            active={activeTab === 'active'} 
                            onClick={() => setActiveTab('active')} 
                            badge={stats.active_now}
                        />
                         <SidebarItem 
                            label="History" 
                            icon={History} 
                            active={activeTab === 'history'} 
                            onClick={() => setActiveTab('history')} 
                        />
                    </nav>

                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Actions</div>
                    <nav className="space-y-1 mb-6">
                        <SidebarItem 
                            label="New Entry" 
                            icon={Plus} 
                            active={activeTab === 'new'} 
                            onClick={() => setActiveTab('new')} 
                            color="text-blue-400"
                        />
                    </nav>

                    <div className="mt-auto">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <h4 className="font-bold text-xs text-white mb-1">Security Status</h4>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-[10px] text-gray-400">System Nominal</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* B. CONTENT VIEW */}
                <main className="flex-1 flex flex-col bg-white/[0.02] relative">
                    
                    {/* Path Bar */}
                    <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2 text-gray-500 bg-white/[0.02]">
                         <span className="hover:bg-white/5 px-2 py-1 rounded cursor-pointer transition-colors">Gatekeeper</span>
                         <ChevronRight size={12} />
                         <span className="text-white font-medium hover:bg-white/5 px-2 py-1 rounded cursor-pointer transition-colors">
                             {activeTab === 'active' ? 'Active Visitors' : activeTab === 'new' ? 'Check-in' : 'Log History'}
                         </span>
                         
                         <div className="ml-auto flex bg-black/30 rounded-lg p-0.5 border border-white/10">
                             <button onClick={() => setViewMode('grid')} className={`p-1 rounded-md ${viewMode === 'grid' ? 'bg-white/20 text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}><Grid size={12}/></button>
                             <button onClick={() => setViewMode('list')} className={`p-1 rounded-md ${viewMode === 'list' ? 'bg-white/20 text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}><ListIcon size={12}/></button>
                         </div>
                    </div>

                    {/* Viewport */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                        <AnimatePresence mode="wait">
                            
                            {/* NEW ENTRY FORM */}
                            {activeTab === 'new' && (
                                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto mt-10">
                                    <div className="bg-[#1e1e1e]/80 border border-white/10 rounded-2xl shadow-2xl p-8 backdrop-blur-md">
                                        <div className="flex justify-center mb-6">
                                            <div className="w-24 h-24 rounded-full bg-gradient-to-t from-gray-800 to-gray-700 border border-white/10 flex items-center justify-center shadow-inner">
                                                <UserPlus size={32} className="text-gray-400" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <MacInput label="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                                <MacInput label="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                            </div>
                                            <MacInput label="Meeting" placeholder="Host Name" value={formData.person_to_meet} onChange={e => setFormData({...formData, person_to_meet: e.target.value})} />
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1 block">Purpose</label>
                                                <input className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-blue-500 outline-none" 
                                                    value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})}
                                                />
                                            </div>
                                            <button 
                                                onClick={handleCheckIn}
                                                disabled={loading}
                                                className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all"
                                            >
                                                {loading ? 'Issuing Pass...' : 'Print Badge & Check In'}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* VISITOR LIST */}
                            {activeTab !== 'new' && (
                                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'grid-cols-1 gap-1'}`}>
                                    {visitors.map((v, i) => (
                                        <motion.div
                                            key={v.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            className={`
                                                group relative bg-white/[0.03] hover:bg-blue-600/10 border border-white/5 hover:border-blue-500/30 
                                                transition-all cursor-default select-none
                                                ${viewMode === 'grid' ? 'rounded-xl p-4 flex flex-col' : 'rounded-lg px-4 py-2 flex items-center justify-between'}
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-b from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold text-gray-300 shadow-md">
                                                    {v.name[0]}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-200 group-hover:text-white">{v.name}</h4>
                                                    <p className="text-[10px] text-gray-500 group-hover:text-blue-200">Meeting: {v.person_to_meet}</p>
                                                </div>
                                            </div>

                                            <div className={`${viewMode === 'grid' ? 'mt-4 pt-3 border-t border-white/5 flex justify-between items-end' : 'text-right'}`}>
                                                 <div className="text-[10px] text-gray-500">
                                                     {activeTab === 'active' ? `In: ${new Date(v.check_in_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}` : `Out: ${new Date(v.check_out_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`}
                                                 </div>
                                                 
                                                 {activeTab === 'active' && (
                                                     <button 
                                                        onClick={() => { setConfirmModal({ isOpen: true, id: v.id, title: "Check Out?", message: `Sign out ${v.name}?` }); }}
                                                        className="text-[10px] bg-white/10 hover:bg-red-500 hover:text-white px-2 py-1 rounded text-gray-400 transition-colors"
                                                     >
                                                         Sign Out
                                                     </button>
                                                 )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Status Bar */}
                    <div className="h-6 bg-[#1a1a1a] border-t border-white/5 flex items-center px-4 justify-between text-[10px] text-gray-500">
                         <span>{visitors.length} records</span>
                         <span>Updated: {currentTime.toLocaleTimeString()}</span>
                    </div>

                </main>
            </div>
        </motion.div>
      </div>

      <Dock />

      {/* --- MODALS --- */}
      <ConfirmationModal 
         isOpen={confirmModal.isOpen} 
         onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
         onConfirm={performCheckOut}
         title={confirmModal.title}
         message={confirmModal.message}
         variant="danger"
      />
      <AlertModal 
         isOpen={alertModal.isOpen} 
         onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
         title={alertModal.title}
         message={alertModal.message}
         type={alertModal.type}
      />
    </div>
  );
};

// --- Components ---
const SidebarItem = ({ label, icon: Icon, active, onClick, badge, color }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all group ${
            active ? 'bg-[#007AFF] text-white shadow-sm font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
    >
        <Icon size={14} className={active ? 'text-white' : (color || 'text-gray-500 group-hover:text-white')} />
        <span className="text-xs">{label}</span>
        {badge > 0 && (
            <span className={`ml-auto text-[10px] px-1.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-400'}`}>
                {badge}
            </span>
        )}
    </button>
);

const MacInput = ({ label, ...props }) => (
    <div>
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1 block">{label}</label>
        <input 
            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-600"
            {...props}
        />
    </div>
);

export default Visitors;