import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // <--- IMPORT THIS
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarCheck, Save, CheckCircle, XCircle, 
  Clock, AlertCircle, Users, Sun, Moon 
} from 'lucide-react';
import api from './api';
import Dock from './Dock';

const STATUS_OPTS = [
  { id: 'PRESENT', label: 'P', color: 'bg-green-500', icon: CheckCircle },
  { id: 'ABSENT', label: 'A', color: 'bg-red-500', icon: XCircle },
  { id: 'LATE', label: 'L', color: 'bg-yellow-500', icon: Clock },
  { id: 'EXCUSED', label: 'E', color: 'bg-blue-500', icon: AlertCircle },
];

const Attendance = () => {
  const [searchParams] = useSearchParams(); // <--- READ URL PARAMS
  
  const [classrooms, setClassrooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedClass, setSelectedClass] = useState(searchParams.get('classId') || ''); // <--- AUTO SELECT
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionType, setSessionType] = useState('MORNING');
  
  const [attendanceMap, setAttendanceMap] = useState({});
  const [remarksMap, setRemarksMap] = useState({});

  useEffect(() => {
    fetchClassrooms();
  }, []);

  useEffect(() => {
    if (selectedClass && date && sessionType) {
      loadRegister();
    }
  }, [selectedClass, date, sessionType]);

  const fetchClassrooms = async () => {
    try {
      const res = await api.get('core/classrooms/');
      setClassrooms(res.data);
    } catch (err) { console.error(err); }
  };

  const loadRegister = async () => {
    setLoading(true);
    try {
      // 1. Get Students
      const stdRes = await api.get(`students/profiles/?classroom=${selectedClass}`);
      const studentList = stdRes.data;
      setStudents(studentList);

      // 2. Check for existing session
      const sessRes = await api.get(`attendance/sessions/?classroom=${selectedClass}&date=${date}&session_type=${sessionType}`);
      
      const newMap = {};
      const newRemarks = {};

      if (sessRes.data.length > 0) {
        const session = sessRes.data[0];
        session.records.forEach(r => {
          newMap[r.student] = r.status;
          newRemarks[r.student] = r.remarks || '';
        });
        studentList.forEach(s => {
          if (!newMap[s.id]) newMap[s.id] = 'PRESENT';
        });
      } else {
        studentList.forEach(s => {
          newMap[s.id] = 'PRESENT';
          newRemarks[s.id] = '';
        });
      }
      setAttendanceMap(newMap);
      setRemarksMap(newRemarks);

    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const toggleStatus = (studentId) => {
    const current = attendanceMap[studentId];
    const currentIndex = STATUS_OPTS.findIndex(o => o.id === current);
    const nextIndex = (currentIndex + 1) % STATUS_OPTS.length;
    setAttendanceMap(prev => ({ ...prev, [studentId]: STATUS_OPTS[nextIndex].id }));
  };

  const markAll = (status) => {
    const newMap = {};
    students.forEach(s => newMap[s.id] = status);
    setAttendanceMap(newMap);
  };

  const handleSave = async () => {
    if (!selectedClass) return;
    
    const records = students.map(s => ({
      student_id: s.id,
      status: attendanceMap[s.id],
      remarks: remarksMap[s.id]
    }));

    const payload = {
      classroom: selectedClass,
      date: date,
      session_type: sessionType,
      records: records
    };

    try {
      await api.post('attendance/sessions/mark_bulk/', payload);
      alert("Attendance Saved Successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save.");
    }
  };

  const presentCount = Object.values(attendanceMap).filter(s => s === 'PRESENT').length;
  const absentCount = Object.values(attendanceMap).filter(s => s === 'ABSENT').length;

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden selection:bg-teal-500/30">
      
      <div className="fixed top-[-20%] right-[-10%] w-[900px] h-[900px] bg-teal-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
               <CalendarCheck className="text-teal-400" size={28} />
            </div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-teal-100 to-teal-200 tracking-tighter">
              Attendance
            </h1>
          </div>
          <p className="text-gray-400 font-medium pl-2">Daily Roll Call Register</p>
        </motion.div>

        {students.length > 0 && (
            <div className="flex gap-4">
                 <div className="bg-white/5 border border-white/10 px-6 py-2 rounded-xl text-center">
                     <div className="text-2xl font-bold text-green-400">{presentCount}</div>
                     <div className="text-[10px] text-gray-500 uppercase font-bold">Present</div>
                 </div>
                 <div className="bg-white/5 border border-white/10 px-6 py-2 rounded-xl text-center">
                     <div className="text-2xl font-bold text-red-400">{absentCount}</div>
                     <div className="text-[10px] text-gray-500 uppercase font-bold">Absent</div>
                 </div>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
          
          <div className="lg:col-span-1 space-y-6">
              <div className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-white/5">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                      <Users size={16}/> Session Details
                  </h3>

                  <div className="space-y-4">
                      <div>
                          <label className="text-xs font-bold text-gray-500 ml-2 mb-1 block">Classroom</label>
                          <select 
                             value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
                             className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-teal-500 [&>option]:bg-gray-900"
                          >
                              <option value="">-- Select Class --</option>
                              {classrooms.map(c => <option key={c.id} value={c.id}>Grade {c.grade_level}-{c.section}</option>)}
                          </select>
                      </div>

                      <div>
                          <label className="text-xs font-bold text-gray-500 ml-2 mb-1 block">Date</label>
                          <input 
                            type="date" value={date} onChange={e => setDate(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-teal-500"
                          />
                      </div>

                      <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                          <button 
                             onClick={() => setSessionType('MORNING')}
                             className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${sessionType === 'MORNING' ? 'bg-teal-600 text-white' : 'text-gray-500 hover:text-white'}`}
                          >
                              <Sun size={14}/> AM
                          </button>
                          <button 
                             onClick={() => setSessionType('AFTERNOON')}
                             className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${sessionType === 'AFTERNOON' ? 'bg-teal-600 text-white' : 'text-gray-500 hover:text-white'}`}
                          >
                              <Moon size={14}/> PM
                          </button>
                      </div>
                  </div>

                  <div className="mt-8 space-y-3">
                      <button onClick={() => markAll('PRESENT')} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-all">
                          Mark All Present
                      </button>
                      <button 
                        onClick={handleSave}
                        disabled={loading || students.length === 0}
                        className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)]"
                      >
                          {loading ? 'Saving...' : <><Save size={20}/> Save Register</>}
                      </button>
                  </div>
              </div>
          </div>

          <div className="lg:col-span-3">
              <div className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-white/5 min-h-[600px] flex flex-col">
                  
                  {students.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {students.map((student) => {
                              const statusId = attendanceMap[student.id] || 'PRESENT';
                              const statusObj = STATUS_OPTS.find(o => o.id === statusId);

                              return (
                                  <motion.div 
                                    key={student.id}
                                    layout
                                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                                        statusId === 'ABSENT' ? 'bg-red-500/10 border-red-500/30' : 
                                        statusId === 'LATE' ? 'bg-yellow-500/10 border-yellow-500/30' :
                                        statusId === 'EXCUSED' ? 'bg-blue-500/10 border-blue-500/30' :
                                        'bg-white/5 border-white/5'
                                    }`}
                                  >
                                      <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border border-white/10">
                                              <img src={student.profile_picture || `https://ui-avatars.com/api/?name=${student.user.first_name}`} className="w-full h-full object-cover"/>
                                          </div>
                                          <div>
                                              <div className="font-bold text-white text-sm">{student.user.first_name} {student.user.last_name}</div>
                                              <div className="text-xs text-gray-500">{student.student_id}</div>
                                          </div>
                                      </div>

                                      <div className="flex items-center gap-2">
                                          <button 
                                            onClick={() => toggleStatus(student.id)}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white transition-all shadow-lg ${statusObj.color}`}
                                          >
                                              {statusObj.label}
                                          </button>
                                      </div>
                                  </motion.div>
                              );
                          })}
                      </div>
                  ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500 flex-1 opacity-50">
                          <Users size={48} className="mb-4"/>
                          <p className="text-lg">Select a Class to load the register</p>
                      </div>
                  )}

              </div>
          </div>
      </div>

      <Dock />
    </div>
  );
};

export default Attendance;