import React, { useState, useEffect } from 'react';
import GlassModal from '../../components/GlassModal';
import { Check, X, Save, Loader, User, Calendar } from 'lucide-react';

const AttendanceModal = ({ isOpen, onClose, scheduleItem }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD

  // Fetch Class List when Modal Opens
  useEffect(() => {
    if (isOpen && scheduleItem) {
      fetchAttendance();
    }
  }, [isOpen, scheduleItem, date]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://127.0.0.1:8000/api/attendance/class/${scheduleItem.id}/?date=${date}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      console.error("Failed to load attendance", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = (id) => {
    setStudents(prev => prev.map(s => {
      if (s.student_id === id) {
        return { ...s, status: s.status === 'PRESENT' ? 'ABSENT' : 'PRESENT' };
      }
      return s;
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const payload = {
        date: date,
        records: students.map(s => ({
          student_id: s.student_id,
          status: s.status
        }))
      };

      const response = await fetch(`http://127.0.0.1:8000/api/attendance/class/${scheduleItem.id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Save failed');
      onClose(); // Close on success

    } catch (err) {
      alert("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  if (!scheduleItem) return null;

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title={`Attendance: ${scheduleItem.subject_name}`}>
      <div className="space-y-6">
        
        {/* Header Control */}
        <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
           <div className="flex items-center gap-2 text-slate-300">
             <Calendar size={18} />
             <span className="text-sm">Date:</span>
           </div>
           <input 
             type="date" 
             value={date} 
             onChange={(e) => setDate(e.target.value)}
             className="bg-black/30 border border-white/10 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
           />
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar p-1">
          {loading ? (
             <div className="col-span-full text-center py-8 text-slate-500">Loading class list...</div>
          ) : students.length === 0 ? (
             <div className="col-span-full text-center py-8 text-slate-500">No students found in Class {scheduleItem.grade}-{scheduleItem.section}.</div>
          ) : (
             students.map(student => (
               <div 
                 key={student.student_id}
                 onClick={() => toggleStatus(student.student_id)}
                 className={`
                   cursor-pointer p-3 rounded-xl border transition-all duration-200 flex items-center gap-3 select-none
                   ${student.status === 'PRESENT' 
                     ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20' 
                     : 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'}
                 `}
               >
                 <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
                    ${student.status === 'PRESENT' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}
                 `}>
                    {student.status === 'PRESENT' ? <Check size={14} /> : <X size={14} />}
                 </div>
                 <div className="overflow-hidden">
                   <div className="font-medium text-white text-sm truncate">{student.name}</div>
                   <div className="text-xs text-slate-400">Roll: {student.roll_number}</div>
                 </div>
               </div>
             ))
          )}
        </div>

        {/* Summary Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
           <div className="text-xs text-slate-400">
             Present: <span className="text-green-400 font-bold">{students.filter(s => s.status === 'PRESENT').length}</span>
             <span className="mx-2">|</span>
             Absent: <span className="text-red-400 font-bold">{students.filter(s => s.status === 'ABSENT').length}</span>
           </div>
           
           <button 
             onClick={handleSave}
             disabled={saving || loading}
             className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg shadow-lg flex items-center gap-2 disabled:opacity-50"
           >
             {saving ? <Loader className="animate-spin" size={16} /> : <><Save size={16} /> Save Register</>}
           </button>
        </div>

      </div>
    </GlassModal>
  );
};

export default AttendanceModal;