import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Dock from '../components/Dock';
import GlassCard from '../components/GlassCard';
import PerformanceChart from '../modules/Exams/PerformanceChart';
import { User, ArrowLeft, CreditCard, Hash, GraduationCap, BarChart2 } from 'lucide-react';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [marks, setMarks] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('financial'); 

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { 'Authorization': `Bearer ${token}` };

        const studentRes = await fetch(`http://127.0.0.1:8000/api/students/${id}/`, { headers });
        if (!studentRes.ok) throw new Error('Student not found');
        const studentData = await studentRes.json();
        setStudent(studentData);

        const marksRes = await fetch(`http://127.0.0.1:8000/api/exams/student/${id}/`, { headers });
        if (marksRes.ok) {
           setMarks(await marksRes.json());
        }

      } catch (err) {
        console.error(err);
        navigate('/students');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, navigate]);

  // --- HELPER: Grading Logic ---
  const getGradeInfo = (score) => {
    const s = parseFloat(score);
    if (s >= 90) return { grade: 'O', color: 'text-purple-400', label: 'Outstanding' };
    if (s >= 80) return { grade: 'A', color: 'text-green-400', label: 'Excellent' };
    if (s >= 70) return { grade: 'B', color: 'text-blue-400', label: 'Good' };
    if (s >= 60) return { grade: 'C', color: 'text-yellow-400', label: 'Average' };
    if (s >= 50) return { grade: 'D', color: 'text-orange-400', label: 'Pass' };
    return { grade: 'F', color: 'text-red-400', label: 'Fail' };
  };

  if (loading) return <div className="min-h-screen bg-nexus-dark text-white flex items-center justify-center">Loading Profile...</div>;
  if (!student) return null;

  const att = student.attendance_stats || { percentage: 100, present: 0, absent: 0 };
  const attColor = att.percentage >= 75 ? 'text-green-400' : att.percentage >= 60 ? 'text-yellow-400' : 'text-red-400';
  const attStroke = att.percentage >= 75 ? '#4ade80' : att.percentage >= 60 ? '#facc15' : '#f87171';

  return (
    <div className="min-h-screen bg-nexus-dark text-white selection:bg-blue-500/30 pb-32">
       <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
         <div className="absolute inset-0 bg-nexus-dark/90 backdrop-blur-sm"></div>
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        
        <button onClick={() => navigate('/students')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={18} /> Back to Directory
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* LEFT COL: IDENTITY */}
          <div className="md:col-span-1 space-y-6">
            <GlassCard className="p-0 overflow-hidden border-t-4 border-t-blue-500 relative">
              <div className="h-24 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
              <div className="px-8 pb-8 -mt-12 flex flex-col items-center text-center">
                
                <div className="w-24 h-24 rounded-full bg-nexus-dark border-4 border-nexus-dark flex items-center justify-center shadow-2xl relative">
                   <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-3xl font-bold text-white">
                     {student.first_name[0]}
                   </div>
                   <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-nexus-dark rounded-full" title="On Campus"></div>
                </div>

                <h1 className="text-2xl font-bold mt-3">{student.first_name} {student.last_name}</h1>
                <p className="text-slate-400 text-sm">{student.student_id}</p>

                <div className="flex gap-2 mt-4">
                   <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-300 text-xs border border-blue-500/20 flex items-center gap-1">
                      <GraduationCap size={12}/> {student.grade}-{student.section}
                   </span>
                   <span className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-300 text-xs border border-purple-500/20 flex items-center gap-1">
                      <Hash size={12}/> Roll {student.roll_number}
                   </span>
                </div>
                
                {/* Attendance Circle */}
                <div className="mt-8 flex items-center gap-4 w-full p-4 bg-white/5 rounded-xl border border-white/5">
                   <div className="relative w-16 h-16 flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-700" />
                        <circle cx="32" cy="32" r="28" stroke={attStroke} strokeWidth="4" fill="transparent" 
                                strokeDasharray={175} 
                                strokeDashoffset={175 - (175 * att.percentage) / 100} 
                                className="transition-all duration-1000 ease-out" />
                      </svg>
                      <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${attColor}`}>
                        {att.percentage}%
                      </span>
                   </div>
                   <div className="text-left">
                      <div className="text-sm text-slate-300 font-medium">Attendance Score</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {att.present} Present &bull; {att.absent} Absent
                      </div>
                   </div>
                </div>

              </div>
            </GlassCard>
          </div>

          {/* RIGHT COL: DATA TABS */}
          <div className="md:col-span-2 space-y-6">
            
            <div className="flex gap-4 border-b border-white/10 pb-1">
                <button onClick={() => setActiveTab('financial')} className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'financial' ? 'border-blue-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}>
                    Financial Ledger
                </button>
                <button onClick={() => setActiveTab('academic')} className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'academic' ? 'border-purple-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}>
                    Academic Performance
                </button>
            </div>

            {/* TAB 1: FINANCIAL */}
            {activeTab === 'financial' && (
                <GlassCard className="h-full min-h-[400px]">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <CreditCard className="text-blue-400" /> Payment History
                </h2>
                {student.transactions.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-white/5 rounded-xl border border-dashed border-white/10">
                    No transactions found.
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-white/10">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-xs uppercase text-slate-400">
                        <tr>
                            <th className="p-4">Receipt ID</th>
                            <th className="p-4">Date</th>
                            <th className="p-4 text-right">Amount</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                        {student.transactions.map((txn) => (
                            <tr key={txn.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-mono text-xs text-slate-300">{txn.receipt_number}</td>
                            <td className="p-4 text-sm text-slate-400">{new Date(txn.date).toLocaleDateString()}</td>
                            <td className="p-4 text-right font-bold text-green-400">+${txn.amount}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                )}
                </GlassCard>
            )}

            {/* TAB 2: ACADEMIC (UPDATED WITH GRADES) */}
            {activeTab === 'academic' && (
                <GlassCard className="h-full min-h-[400px]">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            <BarChart2 className="text-purple-400" /> Performance Report
                        </h2>
                        {marks.length > 0 && (
                            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs border border-purple-500/30">
                                {marks.length} Graded Subjects
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center justify-center">
                            <PerformanceChart marks={marks} />
                        </div>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {marks.length === 0 ? (
                                <div className="text-center text-slate-500 py-10">
                                    No grades recorded yet.
                                </div>
                            ) : (
                                marks.map(mark => {
                                    const gradeInfo = getGradeInfo(mark.score);
                                    return (
                                        <div key={mark.id} className="p-3 bg-white/5 rounded-lg border border-white/5 flex justify-between items-center hover:bg-white/10 transition-colors">
                                            <div>
                                                <div className="font-bold text-white text-sm">{mark.subject_name}</div>
                                                <div className="text-xs text-slate-400">{mark.exam_name}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-mono text-slate-300">
                                                    <span className="font-bold text-white">{parseFloat(mark.score).toFixed(0)}</span> / 100
                                                </div>
                                                <div className={`text-xs font-bold ${gradeInfo.color}`}>
                                                    Grade {gradeInfo.grade}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </GlassCard>
            )}

          </div>
        </div>
      </main>
      <Dock />
    </div>
  );
};

export default StudentProfile;