import React, { useState } from 'react';
import GlassModal from '../../components/GlassModal';
import { Type, AlignLeft, AlertTriangle, CheckCircle, Loader } from 'lucide-react';

const CreateNoticeModal = ({ isOpen, onClose, onNoticeAdded }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    category: 'INFO',
    is_pinned: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      await fetch('http://127.0.0.1:8000/api/notices/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      onNoticeAdded();
      onClose();
      setFormData({ title: '', message: '', category: 'INFO', is_pinned: false });
    } catch (err) {
      alert("Failed to post notice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title="Broadcast Notice">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="space-y-1">
            <label className="text-xs text-slate-400 ml-1">Title</label>
            <div className="relative">
                <Type className="absolute left-3 top-3 text-slate-500" size={18} />
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white" placeholder="e.g. School Closed" required />
            </div>
        </div>

        <div className="space-y-1">
            <label className="text-xs text-slate-400 ml-1">Message</label>
            <div className="relative">
                <AlignLeft className="absolute left-3 top-3 text-slate-500" size={18} />
                <textarea value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white h-24" placeholder="Type your announcement..." required />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-xs text-slate-400 ml-1">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white appearance-none">
                    <option value="INFO">Information (Blue)</option>
                    <option value="WARNING">Warning (Orange)</option>
                    <option value="URGENT">Urgent (Red)</option>
                    <option value="SUCCESS">Success (Green)</option>
                </select>
            </div>
            <div className="flex items-end pb-1">
                <button type="button" onClick={() => setFormData({...formData, is_pinned: !formData.is_pinned})} className={`w-full py-2.5 rounded-xl border transition-all ${formData.is_pinned ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                    {formData.is_pinned ? '📌 Pinned to Top' : 'Pin Notice?'}
                </button>
            </div>
        </div>

        <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
           {loading ? <Loader className="animate-spin" /> : <><CheckCircle size={20} /> Post Notice</>}
        </button>
      </form>
    </GlassModal>
  );
};
export default CreateNoticeModal;