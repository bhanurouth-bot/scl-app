import React, { useState, useEffect } from 'react';
import Dock from '../components/Dock';
import GlassCard from '../components/GlassCard';
import GlassModal from '../components/GlassModal';
import ManageSlotsModal from '../modules/Timetable/ManageSlotsModal'; // <--- Ensure this path is correct
import { Calendar, Clock, Plus, Settings, User, AlertCircle } from 'lucide-react';

const Timetable = () => {
  // Data State
  const [slots, setSlots] = useState([]);
  const [entries, setEntries] = useState([]);
  const [subjects, setSubjects] = useState([]); // For dropdown
  
  // Filter State
  const [grade, setGrade] = useState('10');
  const [section, setSection] = useState('A');

  // Modal State
  const [isModalOpen, setModalOpen] = useState(false); // Add Class Modal
  const [isSlotModalOpen, setSlotModalOpen] = useState(false); // Manage Slots Modal
  
  // Form State
  const [newEntry, setNewEntry] = useState({ 
      day: 'MON', time_slot: '', subject: '', teacher: 1, room_number: 'Room 101' 
  });

  const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  useEffect(() => {
    fetchMeta();
  }, []);

  useEffect(() => {
    fetchTimetable();
  }, [grade, section]);

  const fetchMeta = async () => {
    const token = localStorage.getItem('accessToken');
    const headers = { 'Authorization': `Bearer ${token}` };
    
    try {
        const [sRes, subRes] = await Promise.all([
            fetch('http://127.0.0.1:8000/api/timetable/slots/', { headers }),
            fetch('http://127.0.0.1:8000/api/academics/subjects/', { headers })
        ]);

        if(sRes.ok) setSlots(await sRes.json());
        if(subRes.ok) setSubjects(await subRes.json());
    } catch (err) {
        console.error("Failed to fetch metadata", err);
    }
  };

  const fetchTimetable = async () => {
    const token = localStorage.getItem('accessToken');
    try {
        const res = await fetch(`http://127.0.0.1:8000/api/timetable/entries/?grade=${grade}&section=${section}`, { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        if(res.ok) setEntries(await res.json());
    } catch (err) {
        console.error("Failed to fetch timetable", err);
    }
  };

  const addToSchedule = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    // Note: We are hardcoding teacher: 1 (Admin) for now. 
    // Ideally, you'd fetch the teacher list and let the user select one.
    const payload = { ...newEntry, grade, section, teacher: 1 }; 

    const res = await fetch('http://127.0.0.1:8000/api/timetable/entries/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
    });
    
    if(res.ok) {
        setModalOpen(false);
        fetchTimetable();
        alert("Class added successfully!");
    } else {
        alert("Conflict Error! A teacher cannot be in two places at once, nor can a class have two subjects at the same time.");
    }
  };

  // Helper to find entry for a specific Day + Slot
  const getEntry = (day, slotId) => {
      return entries.find(e => e.day === day && e.time_slot === slotId);
  };

  return (
    <div className="min-h-screen bg-nexus-dark text-white relative selection:bg-purple-500/30">
       <div className="fixed inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2068&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
       <div className="absolute inset-0 bg-nexus-dark/90 backdrop-blur-sm"></div>

       <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 pb-32">
         
         <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white">Time Machine</h1>
              <p className="text-slate-400 mt-2">Class Schedule & Routine</p>
            </div>
            
            <div className="flex gap-4 items-center">
                 {/* MANAGE SLOTS BUTTON */}
                 <button 
                    onClick={() => setSlotModalOpen(true)} 
                    className="p-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl border border-white/10 transition-all flex items-center justify-center"
                    title="Configure Bell Schedule"
                 >
                    <Settings size={20} />
                 </button>

                 {/* GRADE SELECTOR */}
                 <div className="bg-white/5 p-2 rounded-xl flex gap-2 border border-white/10 items-center">
                     <span className="text-xs text-slate-500 font-bold px-2">CLASS</span>
                     <input 
                        type="text" 
                        value={grade} 
                        onChange={e=>setGrade(e.target.value)} 
                        className="w-12 bg-black/30 border border-white/10 rounded px-2 py-1 text-center text-white focus:outline-none focus:border-purple-500 transition-colors" 
                        placeholder="10"
                     />
                     <input 
                        type="text" 
                        value={section} 
                        onChange={e=>setSection(e.target.value)} 
                        className="w-10 bg-black/30 border border-white/10 rounded px-2 py-1 text-center text-white focus:outline-none focus:border-purple-500 transition-colors" 
                        placeholder="A"
                     />
                 </div>
                 
                 {/* ADD CLASS BUTTON */}
                 <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-lg font-bold transition-all transform hover:scale-105">
                    <Plus size={18}/> Add Class
                 </button>
            </div>
         </div>

         {/* TIMETABLE GRID */}
         <GlassCard className="overflow-x-auto pb-4 custom-scrollbar p-6 bg-black/20 backdrop-blur-md">
             {slots.length === 0 ? (
                 <div className="text-center py-20 text-slate-500">
                     <AlertCircle size={48} className="mx-auto mb-4 opacity-50"/>
                     <h3 className="text-lg font-bold text-white">No Schedule Configured</h3>
                     <p className="mb-6">You need to define time slots (periods) first.</p>
                     <button onClick={() => setSlotModalOpen(true)} className="px-6 py-2 bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white border border-purple-500/30 rounded-lg transition-all">
                         Configure Slots Now
                     </button>
                 </div>
             ) : (
                 <div className="min-w-[1000px]">
                     {/* HEADER ROW (PERIODS) */}
                     <div className="grid grid-cols-7 gap-4 mb-6 sticky top-0 z-10">
                         <div className="col-span-1 bg-transparent"></div> {/* Empty corner */}
                         {slots.map(slot => (
                             <div key={slot.id} className="text-center group">
                                 <div className="font-bold text-purple-300 uppercase text-xs tracking-widest mb-2 group-hover:text-white transition-colors">{slot.name}</div>
                                 <div className="text-[10px] font-mono text-slate-400 bg-white/5 py-1 px-2 rounded-full border border-white/5 inline-block group-hover:bg-purple-500/20 group-hover:border-purple-500/30 transition-all">
                                     {slot.start_time.slice(0,5)} - {slot.end_time.slice(0,5)}
                                 </div>
                             </div>
                         ))}
                     </div>

                     {/* DAY ROWS */}
                     {DAYS.map(day => (
                         <div key={day} className="grid grid-cols-7 gap-4 mb-4 items-stretch">
                             {/* Day Label */}
                             <div className="col-span-1 flex items-center justify-center">
                                 <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/10 flex items-center justify-center font-black text-slate-400 text-sm shadow-inner">
                                     {day}
                                 </div>
                             </div>

                             {/* Schedule Cells */}
                             {slots.map(slot => {
                                 const entry = getEntry(day, slot.id);
                                 return (
                                     <div key={slot.id} className="relative group h-full">
                                         {entry ? (
                                             <div className="h-full min-h-[100px] p-3 rounded-xl bg-gradient-to-br from-purple-900/40 to-slate-900/40 border-l-4 border-l-purple-500 border-y border-r border-white/5 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-900/20 transition-all cursor-pointer flex flex-col justify-between group-hover:-translate-y-1">
                                                 <div className="font-bold text-white text-sm line-clamp-2">{entry.subject_name}</div>
                                                 <div className="flex justify-between items-end mt-2">
                                                     <div className="text-[10px] text-purple-200 flex items-center gap-1 bg-purple-500/20 px-1.5 py-0.5 rounded">
                                                         <User size={10}/> {entry.teacher_name}
                                                     </div>
                                                     <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">{entry.room_number}</div>
                                                 </div>
                                             </div>
                                         ) : (
                                             <div className="h-full min-h-[100px] rounded-xl border-2 border-dashed border-white/5 flex items-center justify-center text-slate-700 text-xs font-medium hover:border-white/10 hover:bg-white/5 transition-all select-none">
                                                 Free
                                             </div>
                                         )}
                                     </div>
                                 );
                             })}
                         </div>
                     ))}
                 </div>
             )}
         </GlassCard>

         {/* ADD CLASS MODAL */}
         <GlassModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Assign Class">
            <form onSubmit={addToSchedule} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-slate-500 ml-1 mb-1 block">Day</label>
                        <select required value={newEntry.day} onChange={e=>setNewEntry({...newEntry, day: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none">
                            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 ml-1 mb-1 block">Time Slot</label>
                        <select required value={newEntry.time_slot} onChange={e=>setNewEntry({...newEntry, time_slot: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none">
                            <option value="">Select Period</option>
                            {slots.map(s => <option key={s.id} value={s.id}>{s.name} ({s.start_time.slice(0,5)})</option>)}
                        </select>
                    </div>
                </div>
                
                <div>
                    <label className="text-xs text-slate-500 ml-1 mb-1 block">Subject</label>
                    <select required value={newEntry.subject} onChange={e=>setNewEntry({...newEntry, subject: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none">
                        <option value="">Select Subject</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="text-xs text-slate-500 ml-1 mb-1 block">Room Number</label>
                    <input type="text" placeholder="e.g. Lab 2" required value={newEntry.room_number} onChange={e=>setNewEntry({...newEntry, room_number: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none"/>
                </div>

                <button className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold shadow-lg flex justify-center items-center gap-2 mt-2">
                    <Plus size={18}/> Save to Schedule
                </button>
            </form>
         </GlassModal>

         {/* MANAGE SLOTS MODAL */}
         <ManageSlotsModal 
            isOpen={isSlotModalOpen} 
            onClose={() => setSlotModalOpen(false)} 
            onUpdate={fetchMeta} 
         />

       </main>
       <Dock />
    </div>
  );
};

export default Timetable;