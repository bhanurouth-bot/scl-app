import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom'; // Hook for reading URL params
import { CheckCircle, XCircle, Clock, Save, UserCheck, ArrowLeft } from 'lucide-react';
import api from './api';
import Dock from './Dock';

const STATUS_CONFIG = {
  'PRESENT': { color: 'bg-green-500', icon: CheckCircle, label: 'Present' },
  'ABSENT': { color: 'bg-red-500', icon: XCircle, label: 'Absent' },
  'LATE': { color: 'bg-yellow-500', icon: Clock, label: 'Late' }
};

const Attendance = () => {
  const [searchParams] = useSearchParams(); // Read URL parameters
  const [classrooms, setClassrooms] = useState([]);
  
  // Initialize selectedClass from URL (?classroom=5) or default to empty
  const [selectedClass, setSelectedClass] = useState(searchParams.get('classroom') || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // Stores { studentId: 'PRESENT' }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 1. Fetch Classrooms for the Dropdown
  useEffect(() => {
    api.get('core/classrooms/').then(res => {
      setClassrooms(res.data);
      // If no class is selected via URL, default to the first one in the list
      if (!selectedClass && res.data.length > 0) {
        setSelectedClass(res.data[0].id);
      }
    });
  }, []);

  // 2. Fetch Session Data whenever Class or Date changes
  useEffect(() => {
    if (!selectedClass) return;
    setLoading(true);

    const loadData = async () => {
      try {
        // A. Get Student Roster
        const stuRes = await api.get(`students/students/?classroom=${selectedClass}`);
        const studentList = stuRes.data;
        setStudents(studentList);

        // B. Check for existing attendance session
        const attRes = await api.get(`attendance/sessions/?classroom=${selectedClass}&date=${date}`);
        
        const initialMap = {};
        
        if (attRes.data.length > 0) {
           // Session exists: Populate map with saved records
           const session = attRes.data[0];
           session.records.forEach(r => {
             initialMap[r.student] = r.status;
           });
        } else {
           // No session: Default everyone to PRESENT
           studentList.forEach(s => {
             initialMap[s.id] = 'PRESENT';
           });
        }
        setAttendanceMap(initialMap);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [selectedClass, date]);

  // Toggle Logic: Present -> Absent -> Late -> Present
  const toggleStatus = (studentId) => {
    setAttendanceMap(prev => {
      const current = prev[studentId] || 'PRESENT';
      let next = 'PRESENT';
      if (current === 'PRESENT') next = 'ABSENT';
      else if (current === 'ABSENT') next = 'LATE';
      else if (current === 'LATE') next = 'PRESENT';
      return { ...prev, [studentId]: next };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
        // Convert Map back to Array for API
        const records = Object.entries(attendanceMap).map(([sid, status]) => ({
            student_id: sid,
            status: status
        }));

        await api.post('attendance/sessions/mark_bulk/', {
            classroom: selectedClass,
            date: date,
            session_type: 'MORNING', // Default session type
            records: records
        });
        alert("Attendance Saved Successfully!");
    } catch (err) {
        alert("Failed to save.");
        console.error(err);
    } finally {
        setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden selection:bg-green-500/30">
      
      {/* Background Ambience */}
      <div className="fixed top-[-10%] left-[-10%] w-[900px] h-[900px] bg-green-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
               <UserCheck className="text-green-400" size={28} />
            </div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-green-100 to-green-200 tracking-tighter">
              Attendance
            </h1>
          </div>
          <p className="text-gray-400 font-medium pl-2">Daily Roll Call</p>
        </motion.div>

        {/* --- Controls --- */}
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            {/* Date Picker */}
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              className="bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-green-500 transition-all font-bold"
            />
            
            {/* Class Dropdown */}
            <div className="relative">
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full md:w-64 appearance-none bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-green-500 transition-all font-bold [&>option]:bg-gray-900"
              >
                {classrooms.map(c => (
                  <option key={c.id} value={c.id}>Grade {c.grade_level} - {c.section}</option>
                ))}
              </select>
            </div>

            {/* Save Button */}
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-500 text-white font-bold px-8 py-4 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-green-900/20 disabled:opacity-50"
            >
              {saving ? 'Saving...' : <><Save size={20} /> Save Roll</>}
            </button>
        </div>
      </div>

      {/* --- Student Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
         {loading ? (
             <div className="col-span-full text-center py-20 text-gray-500 animate-pulse">Fetching Class List...</div>
         ) : students.length === 0 ? (
             <div className="col-span-full text-center py-20 border border-dashed border-white/10 rounded-[2rem] text-gray-500">
                 No students found in this class.
             </div>
         ) : students.map((stu, idx) => {
             const status = attendanceMap[stu.id] || 'PRESENT';
             const config = STATUS_CONFIG[status];
             const Icon = config.icon;

             return (
               <motion.div 
                 key={stu.id}
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: idx * 0.05 }}
                 onClick={() => toggleStatus(stu.id)}
                 whileHover={{ scale: 1.02 }}
                 className={`
                    cursor-pointer p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden group select-none
                    ${status === 'ABSENT' ? 'bg-red-500/10 border-red-500/30' : 
                      status === 'LATE' ? 'bg-yellow-500/10 border-yellow-500/30' : 
                      'bg-white/5 border-white/10 hover:bg-white/10'}
                 `}
               >
                  <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-4">
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold shadow-inner border border-white/10">
                              {stu.user.first_name[0]}
                          </div>
                          <div>
                              <h3 className="text-lg font-bold text-white leading-tight">{stu.user.first_name} {stu.user.last_name}</h3>
                              <p className="text-xs text-gray-500 font-mono mt-1">Roll: {stu.roll_number}</p>
                          </div>
                      </div>
                      
                      {/* Status Icon */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${config.color} text-white shadow-lg`}>
                          <Icon size={18} strokeWidth={3} />
                      </div>
                  </div>

                  {/* Hover Label */}
                  <div className="absolute bottom-2 right-6 text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity text-white/50">
                      {config.label}
                  </div>
               </motion.div>
             );
         })}
      </div>

      <Dock />
    </div>
  );
};

export default Attendance;