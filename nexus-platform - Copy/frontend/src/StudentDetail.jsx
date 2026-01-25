import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, User, Phone, Mail, MapPin, Calendar, 
  Shield, FileSignature, CheckCircle, 
  Activity, Heart, FileText, Download, Plus,
  PieChart, BarChart
} from 'lucide-react';
import api from './api';
import Dock from './Dock';
import SignaturePad from './SignaturePad';
import { Skeleton } from './components/GlassUI';

// --- NEW: HEATMAP COMPONENT ---
const HeatmapCalendar = ({ data }) => {
    // Generate last 30 days
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }

    const getStatusColor = (status) => {
        switch(status) {
            case 'PRESENT': return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]';
            case 'ABSENT': return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]';
            case 'LATE': return 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]';
            case 'EXCUSED': return 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]';
            default: return 'bg-white/5 border border-white/5'; 
        }
    };

    return (
        <div className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-white/5 w-full h-full flex flex-col justify-center">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Calendar size={20} className="text-purple-400"/> 30-Day Activity
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
                {days.map(dateStr => {
                    const status = data[dateStr];
                    return (
                        <div key={dateStr} className="group relative">
                            <div 
                                className={`w-3 h-10 md:w-8 md:h-8 rounded-lg transition-all ${getStatusColor(status)}`}
                            ></div>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                                <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap border border-white/20">
                                    {dateStr}: {status || 'No School'}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex gap-4 justify-center mt-6 text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Present</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Absent</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Late</span>
            </div>
        </div>
    );
};

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // --- Data States ---
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // --- Module Data ---
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [examResults, setExamResults] = useState([]);
  
  // --- Action States ---
  const [isUploading, setIsUploading] = useState(false);
  const [showSigPad, setShowSigPad] = useState(false);
  const [sigType, setSigType] = useState(null); 
  const [refreshKey, setRefreshKey] = useState(Date.now());

  // --- Initial Fetch ---
  useEffect(() => {
    const fetchAll = async () => {
        try {
            const [stuRes, attRes, resRes] = await Promise.all([
                api.get(`students/profiles/${id}/`),
                api.get(`attendance/stats/${id}/`).catch(() => ({ data: {} })), 
                api.get(`results/report-cards/?student=${id}`).catch(() => ({ data: [] }))
            ]);
            setStudent(stuRes.data);
            setAttendanceStats(attRes.data);
            setExamResults(resRes.data);
        } catch(err) { 
            console.error("Failed to load profile", err); 
        } finally { 
            setLoading(false); 
        }
    };
    fetchAll();
  }, [id]);

  // --- Handlers ---
  const handleOpenSigPad = (type) => {
    setSigType(type);
    setShowSigPad(true);
  };

  const handleSaveSignature = async (file) => {
    const formData = new FormData();
    const fieldName = sigType === 'student' ? 'student_signature' : 'guardian_signature';
    formData.append(fieldName, file);

    try {
      await api.patch(`students/profiles/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const res = await api.get(`students/profiles/${id}/`);
      setStudent(res.data);
      setRefreshKey(Date.now());
      setShowSigPad(false);
    } catch (err) {
      alert("Failed to save signature.");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const title = prompt("Enter Document Title (e.g., Birth Certificate):");
    if (!title) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('student', id);
    formData.append('title', title);
    formData.append('file', file);

    try {
        await api.post('students/documents/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        const res = await api.get(`students/profiles/${id}/`);
        setStudent(res.data);
    } catch (err) {
        alert("Upload Failed.");
        console.error(err);
    } finally {
        setIsUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden selection:bg-blue-500/30">
      
      {/* Background Ambience */}
      <div className="fixed top-[-10%] left-[-10%] w-[900px] h-[900px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      {/* --- HEADER --- */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <button 
          onClick={() => navigate('/students')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group"
        >
           <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Students
        </button>

        <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
            <div className="w-32 h-32 rounded-full border-4 border-white/10 overflow-hidden bg-gray-800 shadow-2xl relative">
                <img 
                    src={student.profile_picture || `https://ui-avatars.com/api/?name=${student.user.first_name}+${student.user.last_name}&background=random`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="space-y-2">
                <h1 className="text-5xl font-bold text-white mb-2">{student.user.first_name} {student.user.last_name}</h1>
                <div className="flex items-center gap-4 text-gray-400">
                    <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-600/30">
                        {student.student_id}
                    </span>
                    <span className="flex items-center gap-1 text-sm">
                        <User size={14} /> Grade {student.classroom_details?.grade_level || 'N/A'} - {student.classroom_details?.section || 'A'}
                    </span>
                </div>
            </div>
        </div>

        {/* --- NAVIGATION TABS --- */}
        <div className="flex gap-4 border-b border-white/10 pb-1 mb-8 overflow-x-auto custom-scrollbar">
            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={User} label="Overview" />
            <TabButton active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} icon={PieChart} label="Attendance" />
            <TabButton active={activeTab === 'results'} onClick={() => setActiveTab('results')} icon={BarChart} label="Results" />
            <TabButton active={activeTab === 'health'} onClick={() => setActiveTab('health')} icon={Heart} label="Health" />
            <TabButton active={activeTab === 'docs'} onClick={() => setActiveTab('docs')} icon={FileText} label="Documents" />
        </div>
      </motion.div>

      {/* --- TAB CONTENT AREA --- */}
      <div className="relative z-10 min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <motion.div 
                    key="overview" 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }} 
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                    <div className="space-y-6">
                        <SectionCard title="Personal Details" icon={User}>
                            <InfoRow label="Date of Birth" value={student.date_of_birth} icon={Calendar} />
                            <InfoRow label="Gender" value={student.gender} icon={User} />
                            <InfoRow label="Blood Group" value={student.blood_group || 'N/A'} icon={Activity} />
                        </SectionCard>
                        <SectionCard title="Address" icon={MapPin}>
                            <div className="text-sm text-gray-300 leading-relaxed mb-2">
                               {student.address || "No primary address set."}
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <InfoRow label="City" value={student.city} icon={MapPin} />
                                <InfoRow label="Zip" value={student.zip_code} icon={MapPin} />
                            </div>
                        </SectionCard>
                    </div>

                    <div className="space-y-6">
                        <SectionCard title="Guardian Details" icon={Shield}>
                            <InfoRow label="Guardian Name" value={student.guardian_name} icon={User} />
                            <InfoRow label="Relationship" value={student.guardian_relation} icon={Shield} />
                            <InfoRow label="Contact" value={student.guardian_phone} icon={Phone} />
                            <InfoRow label="Email" value={student.guardian_email} icon={Mail} />
                        </SectionCard>
                    </div>

                    <div className="space-y-6">
                        <div className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-white/5">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <FileSignature size={20} className="text-blue-400"/> Digital Signatures
                            </h3>
                            <div className="space-y-6">
                                <SignatureBlock label="Student Signature" url={student.student_signature ? `${student.student_signature}?t=${refreshKey}` : null} onClick={() => handleOpenSigPad('student')} />
                                <SignatureBlock label="Guardian Signature" url={student.guardian_signature ? `${student.guardian_signature}?t=${refreshKey}` : null} onClick={() => handleOpenSigPad('guardian')} />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* 2. ATTENDANCE TAB (ENHANCED WITH HEATMAP) */}
            {activeTab === 'attendance' && (
                <motion.div 
                    key="attendance" 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }} 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                   {/* Donut Chart */}
                   <div className="glass-panel p-8 rounded-[2rem] border border-white/10 bg-white/5 flex flex-col items-center justify-center">
                      <h3 className="text-xl font-bold text-white mb-6">Attendance Overview</h3>
                      {attendanceStats ? (
                          <div className="w-64 h-64 relative">
                               <div className="absolute inset-0 rounded-full border-8 border-green-500/20 flex items-center justify-center">
                                  <div className="text-center">
                                      <div className="text-4xl font-bold text-white">{attendanceStats.percentage}%</div>
                                      <div className="text-sm text-gray-400">Present</div>
                                  </div>
                               </div>
                               <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                                  <circle cx="50" cy="50" r="46" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray={`${attendanceStats.percentage * 2.89} 289`} strokeLinecap="round" />
                               </svg>
                          </div>
                      ) : (
                          <div className="text-gray-500 text-center py-10">No Data</div>
                      )}
                   </div>
                   
                   {/* NEW: Heatmap Calendar */}
                   <div className="lg:col-span-2">
                        <HeatmapCalendar data={attendanceStats?.calendar || {}} />
                   </div>
                   
                   {/* Recent History */}
                   <div className="lg:col-span-3">
                      <div className="glass-panel p-8 rounded-[2rem] border border-white/10 bg-white/5">
                          <h3 className="text-xl font-bold text-white mb-6">Recent Records</h3>
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                              {attendanceStats?.history?.slice(0, 5).map((rec, i) => (
                                   <div key={i} className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                       <span className="text-gray-400 font-mono text-xs mb-2">{rec.date}</span>
                                       <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${rec.status === 'PRESENT' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                           {rec.status}
                                       </span>
                                   </div>
                              )) || <div className="text-gray-500 italic col-span-5 text-center py-10">No recent records.</div>}
                          </div>
                      </div>
                   </div>
                </motion.div>
            )}

            {/* 3. RESULTS TAB */}
            {activeTab === 'results' && (
                <motion.div 
                    key="results" 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }} 
                    className="space-y-6"
                >
                    {examResults.length > 0 ? (
                        examResults.map((result, idx) => (
                            <div key={idx} className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-white/5">
                                <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">{result.exam_name}</h3>
                                        <p className="text-gray-400 text-sm">Published: {new Date(result.published_date).toLocaleDateString()}</p>
                                    </div>
                                    <div className={`text-3xl font-bold ${result.grade === 'F' ? 'text-red-500' : 'text-green-400'}`}>
                                        {result.percentage}% <span className="text-lg text-gray-500">({result.grade})</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {result.subjects.map((sub, sIdx) => (
                                        <div key={sIdx} className="p-4 bg-black/20 rounded-xl border border-white/5 flex justify-between items-center">
                                            <span className="font-bold text-gray-300">{sub.subject_name}</span>
                                            <div className="text-right">
                                                <div className="font-mono text-white font-bold">{sub.marks_obtained}/{sub.total_marks}</div>
                                                <div className={`text-[10px] font-bold ${sub.grade === 'F' ? 'text-red-400' : 'text-green-400'}`}>{sub.grade}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-[2rem] bg-white/5">
                            <BarChart size={40} className="mx-auto mb-4 opacity-50"/>
                            <p>No exam results published yet.</p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* 4. HEALTH TAB */}
            {activeTab === 'health' && (
                <motion.div 
                    key="health" 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }} 
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                    <SectionCard title="Medical Profile" icon={Activity}>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <InfoRow label="Height (cm)" value={student.medical_profile?.height_cm} icon={Activity} />
                            <InfoRow label="Weight (kg)" value={student.medical_profile?.weight_kg} icon={Activity} />
                        </div>
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div>
                                <label className="text-xs text-red-400 uppercase font-bold">Allergies</label>
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-200 mt-1">
                                    {student.medical_profile?.allergies || "No known allergies."}
                                </div>
                            </div>
                        </div>
                    </SectionCard>
                    <SectionCard title="Emergency Contacts" icon={Phone}>
                         <InfoRow label="Doctor Name" value={student.medical_profile?.doctor_name} icon={User} />
                         <InfoRow label="Doctor Phone" value={student.medical_profile?.doctor_phone} icon={Phone} />
                         <div className="mt-4 pt-4 border-t border-white/5">
                            <InfoRow label="Emergency Contact" value={student.medical_profile?.emergency_contact_name} icon={Shield} />
                            <InfoRow label="Emergency Phone" value={student.medical_profile?.emergency_contact_phone} icon={Phone} />
                         </div>
                    </SectionCard>
                </motion.div>
            )}

            {/* 5. DOCUMENTS TAB */}
            {activeTab === 'docs' && (
                <motion.div 
                    key="docs" 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }} 
                    className="space-y-6"
                >
                    <div className="flex justify-end">
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            onChange={handleFileUpload}
                        />
                        <button 
                            onClick={() => fileInputRef.current.click()}
                            disabled={isUploading}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg disabled:opacity-50 border border-white/10"
                        >
                            {isUploading ? <span className="animate-spin">⏳</span> : <Plus size={18}/>}
                            Upload Document
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {student.documents?.length > 0 ? (
                            student.documents.map((doc, idx) => (
                                <div key={idx} className="glass-panel p-6 rounded-[1.5rem] border border-white/10 bg-white/5 hover:border-blue-500/30 transition-all group relative">
                                    <div className="absolute top-4 right-4 bg-white/10 p-2 rounded-full text-blue-400">
                                        <FileText size={20} />
                                    </div>
                                    <h4 className="font-bold text-white mb-1 truncate pr-10">{doc.title}</h4>
                                    <p className="text-xs text-gray-500 mb-6 font-mono">
                                        {new Date(doc.uploaded_at).toLocaleDateString()}
                                    </p>
                                    
                                    <a 
                                        href={doc.file} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-gray-300 hover:text-white transition-all"
                                    >
                                        <Download size={16}/> Download
                                    </a>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-[2rem] bg-white/5">
                                <FileText size={48} className="mx-auto mb-4 text-gray-600 opacity-50"/>
                                <p className="text-gray-500">No documents uploaded yet.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

          </AnimatePresence>
      </div>

      <Dock />
      
      <AnimatePresence>
        {showSigPad && (
            <SignaturePad 
                title={sigType === 'student' ? "Student Signature" : "Guardian Signature"}
                onSave={handleSaveSignature}
                onClose={() => setShowSigPad(false)}
            />
        )}
      </AnimatePresence>

    </div>
  );
};

// --- HELPER COMPONENTS ---

const TabButton = ({ active, onClick, icon: Icon, label }) => (
    <button 
        onClick={onClick} 
        className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
    >
        <Icon size={18} /> {label}
    </button>
);

const SectionCard = ({ title, icon: Icon, children }) => (
    <div className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-white/5 h-full">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Icon size={20} className="text-blue-400"/> {title}
        </h3>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const InfoRow = ({ label, value, icon: Icon }) => (
    <div className="flex items-center gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0">
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
            <Icon size={14} />
        </div>
        <div>
            <div className="text-[10px] text-gray-500 uppercase font-bold">{label}</div>
            <div className="text-sm font-medium text-white">{value || 'N/A'}</div>
        </div>
    </div>
);

const SignatureBlock = ({ label, url, onClick }) => (
    <div>
        <div className="flex justify-between items-center mb-2 px-1">
            <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">{label}</label>
            {url && <CheckCircle size={12} className="text-green-500"/>}
        </div>
        <div 
            onClick={onClick}
            className={`h-28 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all relative overflow-hidden group ${url ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}`}
        >
            {url ? (
                <img src={url} alt="Signature" className="h-20 object-contain opacity-80" />
            ) : (
                <div className="flex flex-col items-center text-gray-600 group-hover:text-gray-400">
                    <FileSignature size={24} className="mb-2"/>
                    <span className="text-xs font-bold">Tap to Sign</span>
                </div>
            )}
        </div>
    </div>
);

export default StudentDetail;