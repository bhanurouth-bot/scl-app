import React, { useState, useEffect } from 'react';
import GlassModal from '../../components/GlassModal';
import { Clock, Plus, Trash2, CheckCircle } from 'lucide-react';

const ManageSlotsModal = ({ isOpen, onClose, onUpdate }) => {
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ name: '', start_time: '', end_time: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) fetchSlots();
  }, [isOpen]);

  const fetchSlots = async () => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch('http://127.0.0.1:8000/api/timetable/slots/', { 
        headers: { 'Authorization': `Bearer ${token}` } 
    });
    if (res.ok) setSlots(await res.json());
  };

  const addSlot = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('accessToken');
    
    // Formatting time for Django (HH:MM)
    const payload = {
        name: newSlot.name,
        start_time: newSlot.start_time,
        end_time: newSlot.end_time
    };

    const res = await fetch('http://127.0.0.1:8000/api/timetable/slots/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        setNewSlot({ name: '', start_time: '', end_time: '' });
        fetchSlots();
        onUpdate(); // Refresh the main grid
    }
    setLoading(false);
  };

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title="Configure Bell Schedule">
      <div className="space-y-6">
        
        {/* CREATE FORM */}
        <form onSubmit={addSlot} className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-4">
            <h4 className="text-sm font-bold text-purple-300 uppercase tracking-widest flex items-center gap-2">
                <Plus size={16}/> Add New Period
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input 
                    type="text" 
                    placeholder="Name (e.g. Period 1)" 
                    required 
                    value={newSlot.name} 
                    onChange={e => setNewSlot({...newSlot, name: e.target.value})} 
                    className="bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm"
                />
                <div className="relative">
                    <Clock size={14} className="absolute left-2 top-3 text-slate-500"/>
                    <input 
                        type="time" 
                        required 
                        value={newSlot.start_time} 
                        onChange={e => setNewSlot({...newSlot, start_time: e.target.value})} 
                        className="w-full bg-black/30 border border-white/10 rounded-lg py-2 pl-8 pr-2 text-white text-sm"
                    />
                </div>
                <div className="relative">
                    <Clock size={14} className="absolute left-2 top-3 text-slate-500"/>
                    <input 
                        type="time" 
                        required 
                        value={newSlot.end_time} 
                        onChange={e => setNewSlot({...newSlot, end_time: e.target.value})} 
                        className="w-full bg-black/30 border border-white/10 rounded-lg py-2 pl-8 pr-2 text-white text-sm"
                    />
                </div>
            </div>
            <button disabled={loading} className="w-full py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-sm shadow-lg transition-all">
                {loading ? "Adding..." : "Add Time Slot"}
            </button>
        </form>

        {/* LIST EXISTING SLOTS */}
        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            {slots.length === 0 && <div className="text-center text-slate-500 text-sm py-4">No slots defined yet.</div>}
            
            {slots.map(slot => (
                <div key={slot.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5 hover:border-purple-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                            {slot.id}
                        </div>
                        <div>
                            <div className="font-bold text-white text-sm">{slot.name}</div>
                            <div className="text-xs text-slate-400 font-mono">
                                {slot.start_time.slice(0,5)} - {slot.end_time.slice(0,5)}
                            </div>
                        </div>
                    </div>
                    {/* Note: Delete logic requires a DELETE endpoint in backend, skipping for now */}
                    <CheckCircle size={16} className="text-green-500/50"/>
                </div>
            ))}
        </div>

      </div>
    </GlassModal>
  );
};

export default ManageSlotsModal;