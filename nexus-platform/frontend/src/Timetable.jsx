import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DndContext, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';
import { Calendar, Save, Trash2, Clock, BookOpen, User, AlertTriangle, Sparkles } from 'lucide-react';
import api from './api';
import Dock from './Dock';
import { GlassSelect, GlassButton } from './components/GlassUI';

// --- DRAGGABLE COMPONENT (Subject Card) ---
const DraggableSubject = ({ id, subject, teacher }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: id,
    data: { subject, teacher } // Pass data to the drop event
  });

  return (
    <div 
      ref={setNodeRef} 
      {...listeners} 
      {...attributes}
      className={`p-3 rounded-xl border border-white/10 bg-white/5 cursor-grab active:cursor-grabbing hover:bg-white/10 transition-all ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="font-bold text-white text-sm">{subject?.name || 'Subject'}</div>
      <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
        <User size={10} /> {teacher ? `${teacher.user.first_name} ${teacher.user.last_name}` : 'No Teacher'}
      </div>
    </div>
  );
};

// --- DROPPABLE COMPONENT (Time Slot) ---
const DroppableSlot = ({ id, day, time, children, onRemove }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${day}::${time}`, // Unique ID for the slot
  });

  return (
    <div 
      ref={setNodeRef} 
      className={`relative h-24 rounded-xl border border-dashed transition-all flex items-center justify-center p-1 ${isOver ? 'bg-indigo-500/20 border-indigo-500' : 'bg-black/20 border-white/10 hover:border-white/20'}`}
    >
      {children ? (
         <div className="w-full h-full bg-indigo-600/20 border border-indigo-500/50 rounded-lg p-2 relative group">
             <div className="font-bold text-white text-xs">{children.subject.name}</div>
             <div className="text-[10px] text-indigo-200 mt-1 truncate">
                {children.teacher ? `${children.teacher.user.first_name}` : 'No Teacher'}
             </div>
             {/* Delete Button (Hover) */}
             <button 
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="absolute top-1 right-1 text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-300 transition-opacity"
             >
                 <Trash2 size={12}/>
             </button>
         </div>
      ) : (
        <span className="text-[10px] text-gray-600 font-mono select-none">+ Drop</span>
      )}
    </div>
  );
};

const Timetable = () => {
  const [loading, setLoading] = useState(false);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  
  // Available "Source" Items (Allocated Subjects for this class)
  const [allocations, setAllocations] = useState([]);

  // The Grid State: { "MON::09:00": { subject: {...}, teacher: {...} } }
  const [schedule, setSchedule] = useState({});
  const [activeDragItem, setActiveDragItem] = useState(null);

  const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
  const TIMES = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];

  useEffect(() => {
    // Load Classrooms
    api.get('core/classrooms/').then(res => setClassrooms(res.data));
  }, []);

  useEffect(() => {
    if(!selectedClass) return;
    fetchTimetableData();
  }, [selectedClass]);

  const fetchTimetableData = async () => {
      setLoading(true);
      try {
          // 1. Get Allocations (What subjects CAN be taught to this class)
          const allocRes = await api.get(`academics/allocations/?classroom=${selectedClass}`);
          setAllocations(allocRes.data);

          // 2. Get Existing Slots
          const slotRes = await api.get(`timetable/slots/?classroom=${selectedClass}`);
          
          // Convert DB Array -> Grid Object
          const grid = {};
          slotRes.data.forEach(slot => {
              // Format: "MON::09:00:00" -> "MON::09:00" (Strip seconds if needed)
              const timeKey = slot.start_time.slice(0, 5);
              const key = `${slot.day_of_week}::${timeKey}`;
              grid[key] = {
                  subject: slot.subject_details,
                  teacher: slot.teacher_details
              };
          });
          setSchedule(grid);

      } catch(err) { console.error(err); } 
      finally { setLoading(false); }
  };

  // --- HANDLERS ---
  
  const handleDragStart = (event) => {
      const allocation = allocations.find(a => `alloc-${a.id}` === event.active.id);
      if(allocation) setActiveDragItem(allocation);
  };

  const handleDragEnd = (event) => {
      const { active, over } = event;
      setActiveDragItem(null);
      
      if (!over) return; // Dropped outside

      // active.id = "subject-allocation-id"
      // over.id = "MON::09:00"

      const allocation = allocations.find(a => `alloc-${a.id}` === active.id);
      if (allocation) {
          setSchedule(prev => ({
              ...prev,
              [over.id]: {
                  subject: allocation.subject,
                  teacher: allocation.teacher
              }
          }));
      }
  };

  const handleRemoveSlot = (key) => {
      const newSchedule = { ...schedule };
      delete newSchedule[key];
      setSchedule(newSchedule);
  };

  const handleSave = async () => {
      if (!selectedClass) return;
      if (!window.confirm("Save this timetable? This will overwrite previous slots for this class.")) return;
      
      setLoading(true);
      
      // Convert Grid Object -> DB Array
      const slotsPayload = Object.entries(schedule).map(([key, data]) => {
          const [day, time] = key.split('::');
          return {
              classroom: selectedClass,
              day_of_week: day,
              start_time: time,
              end_time: calculateEndTime(time),
              subject: data.subject.id,
              teacher: data.teacher ? data.teacher.id : null
          };
      });

      try {
          await api.post('timetable/slots/bulk_update_slots/', {
              classroom_id: selectedClass,
              slots: slotsPayload
          });
          alert("Timetable Saved Successfully!");
      } catch (err) {
          console.error(err);
          // Backend validation error (e.g., Conflict)
          const msg = err.response?.data?.[0] || "Failed to save. Check for conflicts.";
          alert(JSON.stringify(msg));
      } finally {
          setLoading(false);
      }
  };

  const handleAutoGenerate = async () => {
    if (!selectedClass) return alert("Select a classroom first!");
    
    if (!window.confirm("⚠️ AI GENERATION WARNING\n\nThis will ERASE the current schedule for this class and attempt to build a new one automatically based on teacher availability.\n\nContinue?")) return;

    setLoading(true);
    try {
        const res = await api.post('timetable/slots/auto_generate/', {
            classroom_id: selectedClass
        });
        alert(`✨ AI Success! ${res.data.message}`);
        fetchTimetableData(); // Refresh grid to show new slots
    } catch (err) {
        console.error(err);
        alert(err.response?.data?.error || "AI Generation Failed");
    } finally {
        setLoading(false);
    }
  };

  const calculateEndTime = (startTime) => {
      // Simple logic: assume 1 hour slots
      const [h, m] = startTime.split(':').map(Number);
      return `${h + 1}:${m === 0 ? '00' : m}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden selection:bg-indigo-500/30">
      
      {/* Background Ambience */}
      <div className="fixed top-[-20%] left-[-10%] w-[900px] h-[900px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
               <Calendar className="text-indigo-400" size={28} />
            </div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-200 tracking-tighter">
              Timetable
            </h1>
          </div>
          <p className="text-gray-400 font-medium pl-2">Smart Scheduler & Conflict Manager</p>
        </motion.div>
        
        <div className="flex items-end gap-4">
             <div className="w-64">
                <label className="text-xs font-bold text-gray-500 mb-1 block ml-2">Select Classroom</label>
                <GlassSelect value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                    <option value="">-- Choose Class --</option>
                    {classrooms.map(c => <option key={c.id} value={c.id}>Grade {c.grade_level}-{c.section}</option>)}
                </GlassSelect>
             </div>
             
             {/* AI BUTTON */}
             <GlassButton 
                onClick={handleAutoGenerate} 
                disabled={!selectedClass || loading} 
                variant="primary" 
                className="mb-0.5 bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20 border-indigo-500/50"
             >
                 {loading ? 'Thinking...' : <><Sparkles size={18} className="text-yellow-200"/> AI Auto-Schedule</>}
             </GlassButton>

             <GlassButton onClick={handleSave} disabled={!selectedClass || loading} variant="success" className="mb-0.5">
                 {loading ? 'Saving...' : <><Save size={18}/> Save Changes</>}
             </GlassButton>
        </div>
      </div>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
            
            {/* --- SIDEBAR: SUBJECTS --- */}
            <div className="lg:col-span-3 space-y-4">
                <div className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-white/5 h-[700px] flex flex-col">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <BookOpen size={16}/> Available Subjects
                    </h3>
                    
                    {!selectedClass ? (
                         <div className="flex-1 flex items-center justify-center text-gray-500 text-center px-4">
                             Select a classroom to see allocated subjects.
                         </div>
                    ) : allocations.length === 0 ? (
                         <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-center px-4 border border-dashed border-white/10 rounded-xl">
                             <AlertTriangle size={32} className="mb-2 opacity-50"/>
                             <p>No subjects allocated.</p>
                             <p className="text-xs mt-2">Go to "Classroom Cockpit" to assign subjects first.</p>
                         </div>
                    ) : (
                        <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
                            {allocations.map(alloc => (
                                <DraggableSubject 
                                    key={alloc.id} 
                                    id={`alloc-${alloc.id}`} 
                                    subject={alloc.subject}
                                    teacher={alloc.teacher}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* --- MAIN GRID: CALENDAR --- */}
            <div className="lg:col-span-9">
                <div className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-white/5 overflow-x-auto">
                    <div className="min-w-[800px]">
                        {/* Time Header */}
                        <div className="grid grid-cols-6 gap-2 mb-4">
                            <div className="text-center font-bold text-gray-500 uppercase text-xs py-2">Day / Time</div>
                            {TIMES.map(time => (
                                <div key={time} className="text-center font-bold text-gray-400 bg-white/5 rounded-lg py-2 text-xs flex items-center justify-center gap-1">
                                    <Clock size={12}/> {time}
                                </div>
                            ))}
                        </div>

                        {/* Days Rows */}
                        {DAYS.map(day => (
                            <div key={day} className="grid grid-cols-6 gap-2 mb-2">
                                {/* Day Label */}
                                <div className="flex items-center justify-center font-bold text-white bg-indigo-600/20 border border-indigo-500/30 rounded-xl">
                                    {day}
                                </div>
                                {/* Time Slots */}
                                {TIMES.map(time => {
                                    const key = `${day}::${time}`;
                                    const slotData = schedule[key];
                                    return (
                                        <DroppableSlot 
                                            key={key} 
                                            id={key} 
                                            day={day} 
                                            time={time}
                                            onRemove={() => handleRemoveSlot(key)}
                                        >
                                            {slotData}
                                        </DroppableSlot>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        
        {/* --- DRAG OVERLAY --- */}
        <DragOverlay>
            {activeDragItem ? (
                 <div className="p-3 rounded-xl border border-white/20 bg-indigo-600 text-white shadow-2xl w-40 opacity-90 cursor-grabbing">
                    <div className="font-bold text-sm">{activeDragItem.subject?.name}</div>
                    <div className="text-[10px] text-indigo-200 mt-1">
                        {activeDragItem.teacher?.user?.first_name || 'No Teacher'}
                    </div>
                </div>
            ) : null}
        </DragOverlay>

      </DndContext>

      <Dock />
    </div>
  );
};

export default Timetable;