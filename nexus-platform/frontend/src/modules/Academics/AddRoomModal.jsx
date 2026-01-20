import React, { useState } from 'react';
import GlassModal from '../../components/GlassModal';
import { MapPin, Users, CheckCircle, Loader, AlertCircle } from 'lucide-react';

const AddRoomModal = ({ isOpen, onClose, onRoomAdded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    capacity: 30,
    has_projector: false,
    has_ac: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://127.0.0.1:8000/api/academics/rooms/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create room.');

      onRoomAdded();
      onClose();
      setFormData({ name: '', capacity: 30, has_projector: false, has_ac: false });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title="Construct Room">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="text-red-400 text-sm">{error}</div>}

        <div className="space-y-1">
          <label className="text-xs text-slate-400 ml-1">Room Name / Number</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-slate-500" size={18} />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Lab 202 or Hall B"
              required
              className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400 ml-1">Student Capacity</label>
          <div className="relative">
            <Users className="absolute left-3 top-3 text-slate-500" size={18} />
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({...formData, capacity: e.target.value})}
              className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="flex gap-4">
            <button 
                type="button"
                onClick={() => setFormData({...formData, has_projector: !formData.has_projector})}
                className={`flex-1 p-3 rounded-xl border transition-all ${formData.has_projector ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'bg-white/5 border-white/10 text-slate-400'}`}
            >
                Projector {formData.has_projector ? 'Installed' : 'No'}
            </button>
            <button 
                type="button"
                onClick={() => setFormData({...formData, has_ac: !formData.has_ac})}
                className={`flex-1 p-3 rounded-xl border transition-all ${formData.has_ac ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300' : 'bg-white/5 border-white/10 text-slate-400'}`}
            >
                AC {formData.has_ac ? 'Installed' : 'No'}
            </button>
        </div>

        <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
          {loading ? <Loader className="animate-spin" /> : <><CheckCircle size={20} /> Create Room</>}
        </button>
      </form>
    </GlassModal>
  );
};

export default AddRoomModal;