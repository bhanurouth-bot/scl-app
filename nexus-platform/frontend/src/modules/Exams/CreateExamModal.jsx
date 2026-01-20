import React, { useState } from 'react';
import GlassModal from '../../components/GlassModal';
import { Type, Calendar, CheckCircle, Loader, AlertCircle } from 'lucide-react';

const CreateExamModal = ({ isOpen, onClose, onExamCreated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    start_date: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://127.0.0.1:8000/api/exams/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create exam.');

      onExamCreated(); // Refresh the parent list
      onClose();
      setFormData({ name: '', start_date: '' });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title="Declare New Exam">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <AlertCircle size={16} /> {error}
            </div>
        )}

        <div className="space-y-1">
          <label className="text-xs text-slate-400 ml-1">Exam Title</label>
          <div className="relative">
            <Type className="absolute left-3 top-3 text-slate-500" size={18} />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Final Exams 2026"
              required
              className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400 ml-1">Start Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 text-slate-500" size={18} />
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({...formData, start_date: e.target.value})}
              required
              className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
          {loading ? <Loader className="animate-spin" /> : <><CheckCircle size={20} /> Create Exam</>}
        </button>
      </form>
    </GlassModal>
  );
};

export default CreateExamModal;