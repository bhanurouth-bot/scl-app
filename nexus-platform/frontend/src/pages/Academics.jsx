import React, { useState, useEffect } from 'react';
import Dock from '../components/Dock';
import GlassCard from '../components/GlassCard';
// Import all 5 Modals
import ScheduleClassModal from '../modules/Academics/ScheduleClassModal';
import AddTeacherModal from '../modules/Academics/AddTeacherModal';
import AddRoomModal from '../modules/Academics/AddRoomModal';
import AddSubjectModal from '../modules/Academics/AddSubjectModal';
import AttendanceModal from '../modules/Academics/AttendanceModal'; 
import { Calendar, Users, MapPin, Plus, BookOpen, Clock, Hash } from 'lucide-react';

const Academics = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  
  // --- MODAL STATES ---
  const [isScheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [isTeacherModalOpen, setTeacherModalOpen] = useState(false);
  const [isRoomModalOpen, setRoomModalOpen] = useState(false);
  const [isSubjectModalOpen, setSubjectModalOpen] = useState(false);
  
  // Attendance Specific State
  const [isAttendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null); 
  
  // --- DATA STATES ---
  const [schedule, setSchedule] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH ALL DATA ---
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [sRes, tRes, rRes, subRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/academics/schedule/', { headers }),
        fetch('http://127.0.0.1:8000/api/academics/teachers/', { headers }),
        fetch('http://127.0.0.1:8000/api/academics/rooms/', { headers }),
        fetch('http://127.0.0.1:8000/api/academics/subjects/', { headers })
      ]);

      setSchedule(await sRes.json());
      setTeachers(await tRes.json());
      setRooms(await rRes.json());
      setSubjects(await subRes.json());
    } catch (err) {
      console.error("Failed to load academics data");
    } finally {
      setLoading(false);
    }
  };

  // Helper: Group Schedule by Day
  const scheduleByDay = {
    MON: schedule.filter(s => s.day_of_week === 'MON'),
    TUE: schedule.filter(s => s.day_of_week === 'TUE'),
    WED: schedule.filter(s => s.day_of_week === 'WED'),
    THU: schedule.filter(s => s.day_of_week === 'THU'),
    FRI: schedule.filter(s => s.day_of_week === 'FRI'),
  };

  return (
    <div className="min-h-screen bg-nexus-dark text-white relative selection:bg-blue-500/30">
      
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
         <div className="absolute inset-0 bg-nexus-dark/90 backdrop-blur-sm"></div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 pb-32">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Academics</h1>
            <p className="text-slate-400 mt-2">Master Schedule & Resource Management</p>
          </div>
          <button 
            onClick={() => setScheduleModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg transition-all font-medium"
          >
            <Plus size={20} /> Schedule Class
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/10 pb-1 overflow-x-auto">
          {['schedule', 'teachers', 'subjects', 'rooms'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 text-sm font-medium capitalize transition-colors relative whitespace-nowrap ${
                activeTab === tab ? 'text-blue-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
              )}
            </button>
          ))}
        </div>

        {/* --- TAB 1: SCHEDULE VIEW --- */}
        {activeTab === 'schedule' && (
          <div className="space-y-8">
            {['MON', 'TUE', 'WED', 'THU', 'FRI'].map(day => (
              <div key={day}>
                <h3 className="text-lg font-bold text-slate-500 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-600"></span> {day}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scheduleByDay[day].length === 0 ? (
                    <div className="text-slate-600 text-sm italic py-4">No classes scheduled.</div>
                  ) : (
                    scheduleByDay[day].map(cls => (
                      <GlassCard key={cls.id} className="p-5 flex flex-col gap-3 hover:border-blue-500/30 transition-colors">
                        <div className="flex justify-between items-start">
                          <span className="text-blue-300 font-bold">{cls.subject_name}</span>
                          <span className="px-2 py-0.5 rounded bg-white/10 text-xs font-mono">{cls.room_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Clock size={14} /> {cls.start_time.slice(0,5)} - {cls.end_time.slice(0,5)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                           <Users size={12} /> Class {cls.grade}-{cls.section} • {cls.teacher_name}
                        </div>
                        
                        {/* Attendance Button */}
                        <button 
                          onClick={() => {
                            setSelectedClass(cls);
                            setAttendanceModalOpen(true);
                          }}
                          className="mt-2 w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-2"
                        >
                          <Users size={12} /> Take Attendance
                        </button>
                      </GlassCard>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- TAB 2: TEACHERS VIEW --- */}
        {activeTab === 'teachers' && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {teachers.map(teacher => (
              <GlassCard key={teacher.id} className="p-6 text-center group hover:-translate-y-1 transition-transform">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-xl">
                  {teacher.first_name[0]}
                </div>
                <h3 className="font-bold text-lg text-white">{teacher.first_name} {teacher.last_name}</h3>
                <p className="text-blue-400 text-sm mb-4">{teacher.specialization}</p>
                <div className="pt-4 border-t border-white/10 text-xs text-slate-400 font-mono">
                  ID: {teacher.employee_id}
                </div>
              </GlassCard>
            ))}
            <button 
              onClick={() => setTeacherModalOpen(true)}
              className="border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:border-blue-500/50 hover:text-blue-400 hover:bg-white/5 transition-all h-64"
            >
              <Plus size={32} className="mb-2"/>
              <span>Add Faculty</span>
            </button>
          </div>
        )}

        {/* --- TAB 3: SUBJECTS VIEW --- */}
        {activeTab === 'subjects' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             {subjects.map(subject => (
               <GlassCard key={subject.id} className="p-5 flex items-center justify-between group hover:border-blue-500/30">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center">
                        <BookOpen size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-white">{subject.name}</h4>
                        <p className="text-xs text-slate-400 font-mono">{subject.code}</p>
                    </div>
                 </div>
               </GlassCard>
             ))}
             <button 
                onClick={() => setSubjectModalOpen(true)}
                className="border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center gap-2 text-slate-500 hover:border-blue-500/50 hover:text-blue-400 hover:bg-white/5 transition-all p-4 h-full min-h-[80px]"
              >
                <Plus size={20} />
                <span>Add Subject</span>
              </button>
          </div>
        )}

        {/* --- TAB 4: ROOMS VIEW --- */}
        {activeTab === 'rooms' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {rooms.map(room => (
              <GlassCard key={room.id} className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">{room.name}</h3>
                  <div className="flex gap-2 mt-1">
                    {room.has_projector && <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 rounded">PROJ</span>}
                    {room.has_ac && <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 rounded">AC</span>}
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              </GlassCard>
            ))}
            <button 
              onClick={() => setRoomModalOpen(true)}
              className="border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:border-blue-500/50 hover:text-blue-400 hover:bg-white/5 transition-all p-4 h-full min-h-[100px]"
            >
              <Plus size={24} className="mb-1"/>
              <span className="text-xs">Add Room</span>
            </button>
          </div>
        )}

        {/* --- MODAL INJECTIONS --- */}
        
        <ScheduleClassModal 
          isOpen={isScheduleModalOpen}
          onClose={() => setScheduleModalOpen(false)}
          onScheduleAdded={fetchAllData}
        />
        
        <AddTeacherModal 
          isOpen={isTeacherModalOpen}
          onClose={() => setTeacherModalOpen(false)}
          onTeacherAdded={fetchAllData}
        />
        
        <AddRoomModal 
          isOpen={isRoomModalOpen}
          onClose={() => setRoomModalOpen(false)}
          onRoomAdded={fetchAllData}
        />
        
        <AddSubjectModal 
          isOpen={isSubjectModalOpen}
          onClose={() => setSubjectModalOpen(false)}
          onSubjectAdded={fetchAllData}
        />

        {/* The Attendance Modal */}
        <AttendanceModal 
          isOpen={isAttendanceModalOpen}
          onClose={() => setAttendanceModalOpen(false)}
          scheduleItem={selectedClass}
        />

      </main>
      <Dock />
    </div>
  );
};

export default Academics;