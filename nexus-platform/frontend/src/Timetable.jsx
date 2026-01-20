import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Plus, Trash2, Search, ChevronDown, Save, MapPin } from 'lucide-react';
import api from './api';
import Dock from './Dock';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const Timetable = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  
  const [slots, setSlots] = useState([]);
  const [entries, setEntries] = useState([]);
  
  // Data for Modals
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'slots'
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cellData, setCellData] = useState(null); // { day, slotId }
  
  // Forms
  const [slotForm, setSlotForm] = useState({ name: '', start_time: '', end_time: '' });
  const [entryForm, setEntryForm] = useState({ subject: '', teacher: '', room_number: '' });

  // --- Fetch Initial Data ---
  const fetchBasics = async () => {
    try {
      const [clsRes, slotRes, subRes, teachRes] = await Promise.all([
        api.get('core/classrooms/'),
        api.get('timetable/slots/'),
        api.get('academics/subjects/'),
        api.get('hr/employees/')
      ]);
      setClassrooms(clsRes.data);
      setSlots(slotRes.data);
      setSubjects(subRes.data);
      setTeachers(teachRes.data);
      
      // Auto-select first class
      if(clsRes.data.length > 0 && !selectedClass) {
        setSelectedClass(clsRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Fetch Entries for Selected Class ---
  const fetchEntries = async () => {
    if (!selectedClass) return;
    try {
      const res = await api.get(`timetable/entries/?classroom=${selectedClass}`);
      setEntries(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchBasics(); }, []);
  useEffect(() => { fetchEntries(); }, [selectedClass]);

  // --- Handlers ---

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    try {
      await api.post('timetable/slots/', slotForm);
      const res = await api.get('timetable/slots/');
      setSlots(res.data);
      setSlotForm({ name: '', start_time: '', end_time: '' });
    } catch (err) {
      alert("Error creating slot");
    }
  };

  const handleDeleteSlot = async (id) => {
    if(!window.confirm("Delete this time slot?")) return;
    await api.delete(`timetable/slots/${id}/`);
    const res = await api.get('timetable/slots/');
    setSlots(res.data);
  };

  const handleCellClick = (day, slotId) => {
    // Check if entry exists
    const existing = entries.find(e => e.day === day && e.time_slot === slotId);
    if (existing) {
      if(window.confirm(`Delete ${existing.subject_name} class?`)) {
        api.delete(`timetable/entries/${existing.id}/`).then(fetchEntries);
      }
    } else {
      // Open Modal to Add
      setCellData({ day, slotId });
      setEntryForm({ subject: '', teacher: '', room_number: 'Room 101' });
      setIsModalOpen(true);
    }
  };

  const handleSaveEntry = async (e) => {
    e.preventDefault();
    try {
      await api.post('timetable/entries/', {
        classroom: selectedClass,
        day: cellData.day,
        time_slot: cellData.slotId,
        ...entryForm
      });
      fetchEntries();
      setIsModalOpen(false);
    } catch (err) {
      alert("Failed to assign class: " + JSON.stringify(err.response?.data));
    }
  };

  // --- Render Helpers ---
  const getEntry = (day, slotId) => entries.find(e => e.day === day && e.time_slot === slotId);

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden selection:bg-purple-500/30">
      
      {/* Liquid Background */}
      <div className="fixed top-[-10%] left-[-10%] w-[900px] h-[900px] bg-gradient-to-br from-purple-900/20 to-blue-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse"></div>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
               <Calendar className="text-purple-400" size={28} />
            </div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-purple-200 tracking-tighter">
              Timetable
            </h1>
          </div>
          <p className="text-gray-400 font-medium pl-2">Master Schedule & Allocations</p>
        </motion.div>

        <div className="flex gap-4">
           {/* Manage Slots Toggle */}
           <button 
             onClick={() => setViewMode(viewMode === 'grid' ? 'slots' : 'grid')}
             className={`px-6 py-4 rounded-[2rem] flex items-center gap-2 transition-all border backdrop-blur-md ${
               viewMode === 'slots' ? 'bg-purple-600 border-purple-400 text-white' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
             }`}
           >
             <Clock size={20} /> <span className="font-bold">Manage Slots</span>
           </button>
           
           {/* Class Selector */}
           <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={18} className="text-purple-300" />
              </div>
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                className="appearance-none bg-white/5 hover:bg-white/10 text-white pl-12 pr-12 py-4 rounded-[2rem] border border-white/10 focus:border-purple-500/50 outline-none backdrop-blur-xl transition-all cursor-pointer font-bold min-w-[200px]"
              >
                {classrooms.map(c => (
                  <option key={c.id} value={c.id} className="bg-gray-900">
                    Grade {c.grade_level} - {c.section}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
           </div>
        </div>
      </div>

      {/* --- VIEW: SLOT MANAGER --- */}
      {viewMode === 'slots' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-4xl mx-auto">
          <div className="glass-panel p-8 rounded-[3rem] border border-white/10 bg-black/40 backdrop-blur-xl">
             <h2 className="text-2xl font-bold text-white mb-6">Define Bell Schedule</h2>
             
             {/* List */}
             <div className="space-y-3 mb-8">
               {slots.length === 0 && <p className="text-gray-500 text-center py-4">No time slots defined.</p>}
               {slots.sort((a,b) => a.start_time.localeCompare(b.start_time)).map(s => (
                 <div key={s.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                       <div className="p-2 bg-purple-500/20 rounded-lg text-purple-300"><Clock size={16}/></div>
                       <span className="font-bold text-white w-32">{s.name}</span>
                       <span className="text-gray-400 font-mono text-sm">{s.start_time.slice(0,5)} - {s.end_time.slice(0,5)}</span>
                    </div>
                    <button onClick={() => handleDeleteSlot(s.id)} className="text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={18}/></button>
                 </div>
               ))}
             </div>

             {/* Add Form */}
             <form onSubmit={handleCreateSlot} className="flex gap-4 p-4 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                <input required placeholder="Slot Name (e.g. Period 1)" value={slotForm.name} onChange={e => setSlotForm({...slotForm, name: e.target.value})} className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none px-2" />
                <input required type="time" value={slotForm.start_time} onChange={e => setSlotForm({...slotForm, start_time: e.target.value})} className="bg-white/10 rounded-xl px-3 py-2 text-white outline-none" />
                <span className="text-gray-500 self-center">-</span>
                <input required type="time" value={slotForm.end_time} onChange={e => setSlotForm({...slotForm, end_time: e.target.value})} className="bg-white/10 rounded-xl px-3 py-2 text-white outline-none" />
                <button type="submit" className="bg-purple-600 hover:bg-purple-500 px-6 py-2 rounded-xl text-white font-bold transition-colors">Add</button>
             </form>
          </div>
        </motion.div>
      )}

      {/* --- VIEW: GRID --- */}
      {viewMode === 'grid' && (
        <div className="relative z-10 overflow-x-auto pb-4">
          <div className="min-w-[1000px] grid grid-cols-[150px_repeat(6,1fr)] gap-4">
             
             {/* Header Row */}
             <div className="col-start-1"></div> {/* Empty top-left */}
             {DAYS.map(day => (
               <div key={day} className="text-center py-4 bg-white/5 rounded-2xl border border-white/5 font-bold text-purple-200 tracking-wider">
                 {day}
               </div>
             ))}

             {/* Rows */}
             {slots.sort((a,b) => a.start_time.localeCompare(b.start_time)).map(slot => (
               <React.Fragment key={slot.id}>
                  {/* Time Label (Left Col) */}
                  <div className="flex flex-col justify-center items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                     <span className="font-bold text-white">{slot.name}</span>
                     <span className="text-xs text-gray-500 font-mono mt-1">{slot.start_time.slice(0,5)}</span>
                     <span className="text-xs text-gray-500 font-mono">{slot.end_time.slice(0,5)}</span>
                  </div>

                  {/* Day Cells */}
                  {DAYS.map(day => {
                    const entry = getEntry(day, slot.id);
                    return (
                      <motion.div 
                        key={`${day}-${slot.id}`}
                        whileHover={{ scale: 0.98 }}
                        onClick={() => handleCellClick(day, slot.id)}
                        className={`
                          relative p-4 rounded-2xl border transition-all cursor-pointer min-h-[120px] flex flex-col justify-center
                          ${entry 
                            ? 'bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-500/30 hover:border-purple-400' 
                            : 'bg-black/20 border-white/5 hover:bg-white/5 border-dashed hover:border-white/20'
                          }
                        `}
                      >
                        {entry ? (
                          <>
                            <h3 className="font-bold text-white text-lg leading-tight">{entry.subject_name}</h3>
                            <div className="mt-2 flex items-center gap-2 text-xs text-purple-200">
                               <MapPin size={12} /> {entry.room_number}
                            </div>
                            <div className="mt-1 text-xs text-gray-400">{entry.teacher_name}</div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full text-white/10 group-hover:text-white/30">
                             <Plus size={24} />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
               </React.Fragment>
             ))}
          </div>
        </div>
      )}

      {/* --- ASSIGN MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
               className="glass-panel w-full max-w-md p-8 rounded-[2.5rem] border border-white/20 shadow-2xl bg-black/80"
             >
                <h2 className="text-2xl font-bold text-white mb-1">Assign Class</h2>
                <p className="text-gray-400 mb-6 text-sm">
                   {cellData?.day} • {slots.find(s => s.id === cellData?.slotId)?.name}
                </p>

                <form onSubmit={handleSaveEntry} className="space-y-4">
                   {/* Subject */}
                   <div className="space-y-1">
                      <label className="text-xs text-gray-500 ml-2">Subject</label>
                      <select required value={entryForm.subject} onChange={e => setEntryForm({...entryForm, subject: e.target.value})} className="w-full bg-white/10 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-purple-500">
                        <option value="">Select Subject</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                      </select>
                   </div>

                   {/* Teacher */}
                   <div className="space-y-1">
                      <label className="text-xs text-gray-500 ml-2">Teacher</label>
                      <select required value={entryForm.teacher} onChange={e => setEntryForm({...entryForm, teacher: e.target.value})} className="w-full bg-white/10 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-purple-500">
                        <option value="">Select Teacher</option>
                        {teachers.map(t => <option key={t.user.id} value={t.user.id}>{t.user.first_name} {t.user.last_name}</option>)}
                      </select>
                   </div>

                   {/* Room */}
                   <div className="space-y-1">
                      <label className="text-xs text-gray-500 ml-2">Room Number</label>
                      <input required value={entryForm.room_number} onChange={e => setEntryForm({...entryForm, room_number: e.target.value})} className="w-full bg-white/10 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-purple-500" placeholder="e.g. Lab 3" />
                   </div>

                   <div className="flex gap-3 mt-6">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-400 hover:text-white">Cancel</button>
                      <button type="submit" className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-bold">Save</button>
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

export default Timetable;