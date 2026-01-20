import React, { useState, useEffect } from 'react';
import Dock from '../components/Dock';
import GlassCard from '../components/GlassCard';
import CreateNoticeModal from '../modules/Notices/CreateNoticeModal';
import { Plus, Bell, Trash2, Pin } from 'lucide-react';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => { fetchNotices(); }, []);

  const fetchNotices = async () => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch('http://127.0.0.1:8000/api/notices/', { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setNotices(await res.json());
  };

  const deleteNotice = async (id) => {
    if (!confirm('Delete this notice?')) return;
    const token = localStorage.getItem('accessToken');
    await fetch(`http://127.0.0.1:8000/api/notices/${id}/`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    fetchNotices();
  };

  const getColors = (cat) => {
    switch(cat) {
        case 'URGENT': return 'border-red-500/50 bg-red-500/10 hover:bg-red-500/20';
        case 'WARNING': return 'border-orange-500/50 bg-orange-500/10 hover:bg-orange-500/20';
        case 'SUCCESS': return 'border-green-500/50 bg-green-500/10 hover:bg-green-500/20';
        default: return 'border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-nexus-dark text-white relative selection:bg-blue-500/30">
       <div className="fixed inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
       <div className="absolute inset-0 bg-nexus-dark/90 backdrop-blur-sm z-0"></div>

       <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 pb-32">
         <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white">Notice Board</h1>
              <p className="text-slate-400 mt-2">Campus Announcements & Alerts</p>
            </div>
            <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg transition-all font-medium">
              <Plus size={20} /> Post Notice
            </button>
         </div>

         <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {notices.map(notice => (
               <GlassCard key={notice.id} className={`break-inside-avoid p-6 border-l-4 transition-all ${getColors(notice.category)}`}>
                  <div className="flex justify-between items-start mb-2">
                     <div className="flex items-center gap-2">
                        {notice.is_pinned && <Pin size={14} className="text-white fill-white" />}
                        <h3 className="font-bold text-lg text-white">{notice.title}</h3>
                     </div>
                     <button onClick={() => deleteNotice(notice.id)} className="text-white/30 hover:text-red-400"><Trash2 size={16}/></button>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">{notice.message}</p>
                  <div className="text-xs text-white/40 font-mono">
                     {new Date(notice.created_at).toLocaleString()}
                  </div>
               </GlassCard>
            ))}
         </div>

         <CreateNoticeModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onNoticeAdded={fetchNotices} />
       </main>
       <Dock />
    </div>
  );
};
export default Notices;