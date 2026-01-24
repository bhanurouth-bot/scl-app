import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Calendar, AlertTriangle, Info, Plus, X, 
  Megaphone, User, Clock 
} from 'lucide-react';
import api from './api';
import Dock from './Dock';

const CATEGORY_STYLES = {
  'ANNOUNCEMENT': { color: 'bg-blue-500', icon: Info, label: 'Info' },
  'EVENT': { color: 'bg-purple-500', icon: Calendar, label: 'Event' },
  'HOLIDAY': { color: 'bg-green-500', icon: Megaphone, label: 'Holiday' },
  'URGENT': { color: 'bg-red-500', icon: AlertTriangle, label: 'Urgent' },
};

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
      title: '', content: '', category: 'ANNOUNCEMENT', audience: 'ALL'
  });

  const fetchNotices = async () => {
    try {
      const res = await api.get('notices/posts/');
      setNotices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        await api.post('notices/posts/', formData);
        setIsModalOpen(false);
        fetchNotices();
        setFormData({ title: '', content: '', category: 'ANNOUNCEMENT', audience: 'ALL' });
    } catch(err) {
        alert("Failed to post notice.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden selection:bg-blue-500/30">
      
      <div className="fixed top-[-20%] right-[-10%] w-[900px] h-[900px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
               <Bell className="text-blue-400" size={28} />
            </div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-200 tracking-tighter">
              Notices
            </h1>
          </div>
          <p className="text-gray-400 font-medium pl-2">School Announcements & Events</p>
        </motion.div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-[2rem] flex items-center gap-2 shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all"
        >
          <Plus size={20} /> Post Notice
        </button>
      </div>

      {/* --- Notice Grid --- */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 relative z-10">
         {loading ? <div className="text-gray-500 text-center col-span-full py-20">Loading Board...</div> : notices.map((notice, idx) => {
             const style = CATEGORY_STYLES[notice.category] || CATEGORY_STYLES['ANNOUNCEMENT'];
             const Icon = style.icon;

             return (
               <motion.div 
                 key={notice.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: idx * 0.05 }}
                 className="break-inside-avoid glass-panel p-6 rounded-[2rem] border border-white/10 bg-white/5 hover:border-blue-500/30 transition-all group relative overflow-hidden"
               >
                   <div className="flex justify-between items-start mb-4">
                       <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white flex items-center gap-2 ${style.color}`}>
                           <Icon size={12} /> {style.label}
                       </div>
                       <div className="text-xs text-gray-500 font-mono flex items-center gap-1">
                           <Clock size={12}/> {new Date(notice.created_at).toLocaleDateString()}
                       </div>
                   </div>

                   <h3 className="text-2xl font-bold text-white mb-3 leading-tight">{notice.title}</h3>
                   <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line mb-6">{notice.content}</p>

                   <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                       <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center text-[10px] font-bold border border-white/10">
                           {notice.posted_by_name ? notice.posted_by_name[0] : 'A'}
                       </div>
                       <span className="text-xs text-gray-500 font-medium">Posted by {notice.posted_by_name || 'Admin'}</span>
                   </div>
               </motion.div>
             );
         })}
      </div>

      <Dock />

      {/* --- POST MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full max-w-lg bg-[#111] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative">
                    <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X size={24} /></button>
                    <h2 className="text-2xl font-bold text-white mb-6">Create Notice</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input 
                            required 
                            placeholder="Title" 
                            value={formData.title} 
                            onChange={e => setFormData({...formData, title: e.target.value})} 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500" 
                        />
                        
                        <textarea 
                            required 
                            rows={4}
                            placeholder="Message content..." 
                            value={formData.content} 
                            onChange={e => setFormData({...formData, content: e.target.value})} 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 resize-none" 
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 ml-2 uppercase font-bold">Category</label>
                                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none [&>option]:bg-gray-900">
                                    <option value="ANNOUNCEMENT">Announcement</option>
                                    <option value="EVENT">Event</option>
                                    <option value="HOLIDAY">Holiday</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 ml-2 uppercase font-bold">Audience</label>
                                <select value={formData.audience} onChange={e => setFormData({...formData, audience: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none [&>option]:bg-gray-900">
                                    <option value="ALL">Everyone</option>
                                    <option value="STUDENT">Students Only</option>
                                    <option value="TEACHER">Teachers Only</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl mt-4">Post Notice</button>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Notices;