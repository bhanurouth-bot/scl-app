import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, User, Calendar, Droplet, Phone, Shield, 
  MapPin, CheckCircle, XCircle, Clock, BookOpen, CreditCard,
  FileText, Award
} from 'lucide-react';
import api from './api';
import Dock from './Dock';

const StudentDetail = () => {
  const { id } = useParams(); // Retrieves ID from URL (e.g. /students/1)
  const navigate = useNavigate();
  
  // --- State ---
  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview | academics | attendance | finance
  const [loading, setLoading] = useState(true);

  // Sub-Data State
  const [attendance, setAttendance] = useState([]);
  const [results, setResults] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // --- Fetch All Data ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Basic Profile
        const stuRes = await api.get(`students/profiles/${id}/`);
        setStudent(stuRes.data);

        // 2. Parallel Fetch for Tabs
        // Note: These endpoints must be supported by your backend views
        const [attRes, resRes, invRes] = await Promise.all([
            api.get(`attendance/records/?student=${id}`),
            api.get(`exams/results/?student=${id}`),
            api.get(`finance/invoices/?student=${id}`)
        ]);

        setAttendance(attRes.data);
        setResults(resRes.data);
        setInvoices(invRes.data);

      } catch (err) {
        console.error("Profile Load Error", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) loadData();
  }, [id]);

  // --- Helpers ---
  const calculateAttendance = () => {
    if (attendance.length === 0) return 0;
    const present = attendance.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
    return Math.round((present / attendance.length) * 100);
  };
  
  const getGradeColor = (grade) => {
    if(['A+', 'A', 'A-'].includes(grade)) return 'text-green-400';
    if(['B+', 'B', 'B-', 'C+', 'C'].includes(grade)) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 animate-pulse">Loading Student Profile...</p>
        </div>
    </div>
  );

  if (!student) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-400">Student Not Found</h2>
            <button onClick={() => navigate('/students')} className="mt-4 text-blue-400 hover:underline">Return to Directory</button>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden selection:bg-blue-500/30">
       
       {/* Ambient Background */}
       <div className="fixed top-[-10%] right-[-10%] w-[900px] h-[900px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

       {/* --- Header Section --- */}
       <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <button onClick={() => navigate('/students')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group">
             <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Directory
          </button>
          
          <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-gray-700 to-black flex items-center justify-center text-4xl font-bold text-white border border-white/10 shadow-2xl">
                  {student.user.first_name[0]}
              </div>
              
              {/* Identity Info */}
              <div>
                  <h1 className="text-4xl font-bold text-white tracking-tight">{student.user.first_name} {student.user.last_name}</h1>
                  <p className="text-blue-400 font-mono mt-1 text-sm md:text-base">
                    ID: {student.student_id} <span className="mx-2 text-gray-600">|</span> Roll: {student.roll_number}
                  </p>
                  
                  {student.classroom_details && (
                    <div className="flex items-center gap-2 mt-3 text-xs font-bold text-gray-300 bg-white/10 px-3 py-1.5 rounded-lg w-fit border border-white/5">
                        <BookOpen size={14} /> 
                        Grade {student.classroom_details.grade_level} - {student.classroom_details.section}
                    </div>
                  )}
              </div>
          </div>
        </motion.div>

        {/* Quick Stats Cards */}
        <div className="flex gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center min-w-[110px]">
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Attendance</div>
                <div className={`text-2xl font-bold mt-1 ${calculateAttendance() < 75 ? 'text-red-400' : 'text-green-400'}`}>
                    {calculateAttendance()}%
                </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center min-w-[110px]">
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Invoices</div>
                <div className="text-2xl font-bold text-white mt-1">{invoices.length}</div>
            </div>
        </div>
      </div>

      {/* --- Navigation Tabs --- */}
      <div className="flex gap-2 mb-8 border-b border-white/10 pb-0 overflow-x-auto no-scrollbar">
          {['overview', 'academics', 'attendance', 'finance'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 rounded-t-2xl font-bold text-sm transition-all capitalize relative ${
                    activeTab === tab 
                    ? 'text-white bg-white/5 border-t border-x border-white/10' 
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-[-1px] left-0 w-full h-1 bg-[#050505]"></div>}
              </button>
          ))}
      </div>

      {/* --- Tab Content Area --- */}
      <div className="relative z-10 min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <motion.div 
                    key="overview"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    <div className="glass-panel p-8 rounded-[2rem] border border-white/10 bg-white/5">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><User size={20}/></div>
                            Personal Details
                        </h3>
                        <div className="space-y-6">
                            <InfoRow label="Gender" value={student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : 'Other'} />
                            <InfoRow label="Date of Birth" value={student.date_of_birth} icon={<Calendar size={14}/>} />
                            <InfoRow label="Blood Group" value={student.blood_group || "N/A"} icon={<Droplet size={14}/>} />
                        </div>
                    </div>

                    <div className="glass-panel p-8 rounded-[2rem] border border-white/10 bg-white/5">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400"><Shield size={20}/></div>
                            Guardian Info
                        </h3>
                        <div className="space-y-6">
                            <InfoRow label="Guardian Name" value={student.guardian_name} />
                            <InfoRow label="Phone Contact" value={student.guardian_phone} icon={<Phone size={14}/>} />
                            <InfoRow label="Address" value={student.address || "No address on file"} icon={<MapPin size={14}/>} />
                        </div>
                    </div>
                </motion.div>
            )}

            {/* 2. ACADEMICS TAB (Exams) */}
            {activeTab === 'academics' && (
                <motion.div key="academics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <div className="grid grid-cols-1 gap-4">
                        {results.length === 0 && (
                            <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl text-gray-500">
                                No exam records found for this student.
                            </div>
                        )}
                        {results.map(res => (
                            <div key={res.id} className="glass-panel p-6 rounded-3xl border border-white/10 bg-white/5 flex justify-between items-center group hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
                                        <Award size={24} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-bold mb-1">Exam Result</div>
                                        <div className="text-xl font-bold text-white">
                                            {/* We assume the backend expands 'exam' or we display ID. Ideally expand in serializer */}
                                            Exam #{res.exam} 
                                        </div>
                                        <div className="text-sm text-gray-400">Score: {res.marks_obtained}</div>
                                    </div>
                                </div>
                                <div className={`text-4xl font-bold ${getGradeColor(res.grade)} bg-black/20 px-6 py-3 rounded-2xl border border-white/5`}>
                                    {res.grade || '-'}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* 3. ATTENDANCE TAB */}
            {activeTab === 'attendance' && (
                <motion.div key="attendance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {attendance.length === 0 && (
                             <div className="col-span-full text-center py-20 text-gray-500">No attendance records found.</div>
                        )}
                        {attendance.map(att => (
                             <div key={att.id} className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 ${
                                att.status === 'PRESENT' ? 'bg-green-500/10 border-green-500/20' :
                                att.status === 'ABSENT' ? 'bg-red-500/10 border-red-500/20' :
                                'bg-yellow-500/10 border-yellow-500/20'
                             }`}>
                                 <span className="text-xs font-mono text-gray-400">{att.session_date || 'Date'}</span>
                                 <span className={`font-bold flex items-center gap-1 ${
                                     att.status === 'PRESENT' ? 'text-green-400' :
                                     att.status === 'ABSENT' ? 'text-red-400' : 'text-yellow-400'
                                 }`}>
                                     {att.status === 'PRESENT' && <CheckCircle size={14}/>}
                                     {att.status === 'ABSENT' && <XCircle size={14}/>}
                                     {att.status === 'LATE' && <Clock size={14}/>}
                                     {att.status}
                                 </span>
                             </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* 4. FINANCE TAB */}
            {activeTab === 'finance' && (
                <motion.div key="finance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <div className="grid grid-cols-1 gap-4">
                        {invoices.length === 0 && (
                            <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl text-gray-500">
                                No financial records found.
                            </div>
                        )}
                        {invoices.map(inv => (
                            <div 
                                key={inv.id} 
                                onClick={() => navigate('/finance')}
                                className="glass-panel p-6 rounded-3xl border border-white/10 bg-white/5 flex flex-col md:flex-row justify-between items-center hover:bg-white/10 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-5 w-full md:w-auto">
                                    <div className={`p-4 rounded-2xl ${inv.status === 'PAID' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        <CreditCard size={24}/>
                                    </div>
                                    <div>
                                        <div className="font-mono text-sm text-gray-500 mb-1">{inv.invoice_number}</div>
                                        <div className="font-bold text-xl text-white">Tuition / General Fee</div>
                                        <div className="text-xs text-gray-400 mt-1">Due Date: {inv.due_date}</div>
                                    </div>
                                </div>
                                
                                <div className="text-right mt-4 md:mt-0 w-full md:w-auto pl-20 md:pl-0">
                                    <div className="font-bold text-3xl text-white">${inv.total_amount}</div>
                                    <div className={`text-xs font-bold uppercase tracking-wider mt-1 px-2 py-1 rounded-lg w-fit ml-auto ${
                                        inv.status === 'PAID' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                    }`}>
                                        {inv.status}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

          </AnimatePresence>
      </div>

      <Dock />
    </div>
  );
};

// Simple Row Component for Details
const InfoRow = ({ label, value, icon }) => (
    <div className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0 group">
        <span className="text-sm text-gray-500 flex items-center gap-2 group-hover:text-blue-400 transition-colors">
            {icon} {label}
        </span>
        <span className="text-white font-medium text-right">{value}</span>
    </div>
);

export default StudentDetail;