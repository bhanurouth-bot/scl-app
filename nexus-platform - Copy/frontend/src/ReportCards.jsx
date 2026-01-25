import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { motion } from 'framer-motion';
import { 
  FileBarChart, Search, Printer, User, 
  BookOpen, Calculator, PenTool, Crown 
} from 'lucide-react';
import api from './api';
import Dock from './Dock';

const ReportCards = () => {
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selection
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Data
  const [results, setResults] = useState([]);
  const [reportMeta, setReportMeta] = useState({ remarks: '', conduct: 'Good', attendance_percentage: 90 });
  const [metaId, setMetaId] = useState(null); // ID of existing report card meta to update

  // Print
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: selectedStudent ? `Report_${selectedStudent.student_id}` : 'ReportCard',
  });

  useEffect(() => {
    fetchInitData();
  }, []);

  // Fetch Report Data when Student + Exam Selected
  useEffect(() => {
    if (selectedStudent && selectedExam) {
      fetchReportData();
    }
  }, [selectedStudent, selectedExam]);

  const fetchInitData = async () => {
    try {
      const [stdRes, exRes] = await Promise.all([
        api.get('students/profiles/'),
        api.get('results/exams/')
      ]);
      setStudents(stdRes.data);
      setExams(exRes.data);
      if(exRes.data.length > 0) setSelectedExam(exRes.data[0]); // Default to latest exam
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchReportData = async () => {
    try {
      // 1. Get Marks
      const resRes = await api.get(`results/marks/?student=${selectedStudent.id}&exam=${selectedExam.id}`);
      setResults(resRes.data);

      // 2. Get Meta (Remarks/Conduct)
      const metaRes = await api.get(`results/reports/?student=${selectedStudent.id}&exam=${selectedExam.id}`);
      if (metaRes.data.length > 0) {
        setReportMeta(metaRes.data[0]);
        setMetaId(metaRes.data[0].id);
      } else {
        // Reset defaults if no previous report saved
        setReportMeta({ remarks: 'Satisfactory progress.', conduct: 'Good', attendance_percentage: 90 });
        setMetaId(null);
      }
    } catch (err) { console.error(err); }
  };

  const handleSaveMeta = async () => {
    if (!selectedStudent || !selectedExam) return;
    
    const payload = {
      student: selectedStudent.id,
      exam: selectedExam.id,
      ...reportMeta
    };

    try {
      if (metaId) {
        await api.patch(`results/reports/${metaId}/`, payload);
      } else {
        const res = await api.post('results/reports/', payload);
        setMetaId(res.data.id);
      }
      alert("Remarks Saved!");
    } catch (err) { alert("Failed to save remarks."); }
  };

  const filteredStudents = students.filter(s => 
    s.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats Calculation
  const totalMarks = results.reduce((sum, r) => sum + Number(r.marks_obtained), 0);
  const maxMarks = results.reduce((sum, r) => sum + Number(r.total_marks), 0);
  const percentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100).toFixed(2) : 0;
  
  const getOverallGrade = (pct) => {
      if(pct >= 90) return 'A+';
      if(pct >= 80) return 'A';
      if(pct >= 70) return 'B';
      if(pct >= 60) return 'C';
      if(pct >= 50) return 'D';
      return 'F';
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden selection:bg-indigo-500/30">
      
      <div className="fixed top-[-20%] right-[-10%] w-[900px] h-[900px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
               <FileBarChart className="text-indigo-400" size={28} />
            </div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-200 tracking-tighter">
              Report Cards
            </h1>
          </div>
          <p className="text-gray-400 font-medium pl-2">Academic Performance Review</p>
        </motion.div>

        {/* Search */}
        <div className="relative group w-full md:w-96">
            <Search className="absolute left-4 top-3.5 text-gray-500 w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search Student..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-3 pl-12 pr-6 text-white outline-none focus:border-indigo-500/50 transition-all"
            />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
          
          {/* --- LEFT: Controls --- */}
          <div className="xl:col-span-4 space-y-6">
              
              {/* Exam Selector */}
              <div className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-white/5">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">1. Select Exam Term</h3>
                  <select 
                    value={selectedExam?.id || ''} 
                    onChange={e => setSelectedExam(exams.find(ex => String(ex.id) === e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500 [&>option]:bg-gray-900"
                  >
                      {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
              </div>

              {/* Remarks Editor */}
              {selectedStudent && (
                  <div className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-white/5">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <PenTool size={14}/> Teacher Remarks
                      </h3>
                      <textarea 
                          rows={3}
                          value={reportMeta.remarks}
                          onChange={e => setReportMeta({...reportMeta, remarks: e.target.value})}
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-indigo-500 resize-none mb-4"
                          placeholder="Enter comments..."
                      />
                      <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                              <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Conduct</label>
                              <select 
                                value={reportMeta.conduct}
                                onChange={e => setReportMeta({...reportMeta, conduct: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-white text-sm outline-none"
                              >
                                  <option>Excellent</option>
                                  <option>Good</option>
                                  <option>Average</option>
                                  <option>Needs Improvement</option>
                              </select>
                          </div>
                          <div>
                              <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Attendance %</label>
                              <input 
                                type="number"
                                value={reportMeta.attendance_percentage}
                                onChange={e => setReportMeta({...reportMeta, attendance_percentage: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-white text-sm outline-none"
                              />
                          </div>
                      </div>
                      <button onClick={handleSaveMeta} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-sm transition-all">
                          Save Remarks
                      </button>
                  </div>
              )}

              {/* Student List */}
              <div className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-white/5 h-[400px] overflow-y-auto custom-scrollbar">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">2. Select Student</h3>
                  <div className="space-y-2">
                      {filteredStudents.map(student => (
                          <div 
                            key={student.id}
                            onClick={() => setSelectedStudent(student)}
                            className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 ${
                                selectedStudent?.id === student.id 
                                ? 'bg-indigo-500/20 border border-indigo-500/50' 
                                : 'bg-transparent border border-transparent hover:bg-white/5'
                            }`}
                          >
                               <div className="w-8 h-8 rounded-full bg-gray-800 flex-shrink-0 overflow-hidden border border-white/10">
                                  <img src={student.profile_picture || `https://ui-avatars.com/api/?name=${student.user.first_name}`} className="w-full h-full object-cover" />
                               </div>
                               <div className="min-w-0">
                                   <div className="font-bold text-sm text-white truncate">{student.user.first_name} {student.user.last_name}</div>
                                   <div className="text-xs text-indigo-400 font-mono">{student.student_id}</div>
                               </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          {/* --- RIGHT: Preview --- */}
          <div className="xl:col-span-8 flex flex-col gap-6">
              
              <div className="flex justify-end gap-4">
                  <button 
                    onClick={handlePrint}
                    disabled={!selectedStudent || results.length === 0}
                    className="bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  >
                      <Printer size={18} /> Print Report Card
                  </button>
              </div>

              {/* REPORT CARD CANVAS */}
              <div className="bg-[#1a1a1a] p-8 rounded-[2rem] flex justify-center overflow-auto min-h-[850px] border border-white/5">
                  {selectedStudent && selectedExam ? (
                      <div className="scale-[0.8] md:scale-100 origin-top transition-transform">
                          
                          {/* --- PRINT AREA --- */}
                          <div ref={componentRef} className="w-[800px] h-[1120px] bg-white text-[#111] relative shadow-2xl print:shadow-none print:m-0 flex flex-col font-sans">
                                
                                {/* Header */}
                                <div className="bg-[#1e293b] text-white p-8 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#1e293b]">
                                            <Crown size={32} />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-bold uppercase tracking-widest">Nexus Institute</h1>
                                            <p className="text-xs text-gray-300 uppercase tracking-wider">Progress Report • {selectedExam.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-yellow-400">{getOverallGrade(percentage)}</div>
                                        <div className="text-xs text-gray-300 uppercase">Overall Grade</div>
                                    </div>
                                </div>

                                {/* Student Info */}
                                <div className="p-8 border-b border-gray-200 bg-gray-50 flex justify-between">
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-bold">Student Name</div>
                                        <div className="text-xl font-bold">{selectedStudent.user.first_name} {selectedStudent.user.last_name}</div>
                                        <div className="text-sm text-gray-600">{selectedStudent.student_id}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500 uppercase font-bold">Class / Section</div>
                                        <div className="text-xl font-bold">Grade {selectedStudent.classroom_details?.grade_level || 'N/A'} - {selectedStudent.classroom_details?.section || 'A'}</div>
                                        <div className="text-sm text-gray-600">Roll No: {selectedStudent.roll_number || '-'}</div>
                                    </div>
                                </div>

                                {/* Marks Table */}
                                <div className="p-8">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="border-b-2 border-gray-800 text-left text-sm uppercase">
                                                <th className="py-3 font-bold text-gray-600">Subject</th>
                                                <th className="py-3 font-bold text-gray-600 text-center">Marks Obtained</th>
                                                <th className="py-3 font-bold text-gray-600 text-center">Total Marks</th>
                                                <th className="py-3 font-bold text-gray-600 text-center">Grade</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.length > 0 ? results.map((res, i) => (
                                                <tr key={i} className="border-b border-gray-200 text-sm">
                                                    <td className="py-4 font-bold">{res.subject_name}</td>
                                                    <td className="py-4 text-center">{Number(res.marks_obtained)}</td>
                                                    <td className="py-4 text-center">{Number(res.total_marks)}</td>
                                                    <td className={`py-4 text-center font-bold ${res.grade === 'F' ? 'text-red-600' : 'text-green-600'}`}>{res.grade}</td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="4" className="py-8 text-center text-gray-500 italic">No results found for this exam.</td></tr>
                                            )}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-gray-100">
                                                <td className="py-4 font-bold pl-2">GRAND TOTAL</td>
                                                <td className="py-4 text-center font-bold">{totalMarks}</td>
                                                <td className="py-4 text-center font-bold">{maxMarks}</td>
                                                <td className="py-4 text-center font-bold text-indigo-600">{percentage}%</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                {/* Performance Summary */}
                                <div className="px-8 pb-8 flex gap-8">
                                    <div className="flex-1 bg-blue-50 p-4 rounded-lg border border-blue-100">
                                        <div className="text-xs text-blue-500 uppercase font-bold mb-2">Teacher's Remarks</div>
                                        <p className="text-sm italic text-gray-700">"{reportMeta.remarks || 'No remarks added.'}"</p>
                                    </div>
                                    <div className="w-1/3 space-y-2">
                                        <div className="flex justify-between border-b border-gray-200 pb-1">
                                            <span className="text-xs font-bold text-gray-500 uppercase">Attendance</span>
                                            <span className="text-sm font-bold">{reportMeta.attendance_percentage}%</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-200 pb-1">
                                            <span className="text-xs font-bold text-gray-500 uppercase">Conduct</span>
                                            <span className="text-sm font-bold">{reportMeta.conduct}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-200 pb-1">
                                            <span className="text-xs font-bold text-gray-500 uppercase">Result Status</span>
                                            <span className={`text-sm font-bold ${percentage >= 40 ? 'text-green-600' : 'text-red-600'}`}>
                                                {percentage >= 40 ? 'PASSED' : 'FAILED'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Signatures */}
                                <div className="mt-auto px-8 pb-12 flex justify-between items-end">
                                    <div className="text-center">
                                         <div className="w-40 border-b border-gray-400 mb-2"></div>
                                         <p className="text-xs font-bold uppercase text-gray-500">Class Teacher</p>
                                    </div>
                                    <div className="text-center">
                                         <div className="h-16 mb-[-5px] flex items-end justify-center">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/John_Hancock_Signature.svg/1200px-John_Hancock_Signature.svg.png" className="h-full opacity-80" alt="Principal" />
                                         </div>
                                         <p className="text-xs font-bold uppercase text-gray-500">Principal</p>
                                         <div className="w-40 border-b border-gray-400 mt-2"></div>
                                    </div>
                                </div>

                                {/* Bottom Bar */}
                                <div className="bg-[#1e293b] text-white text-[10px] p-2 text-center uppercase tracking-widest">
                                    Generated by Nexus Platform • {new Date().toLocaleDateString()}
                                </div>
                          </div>
                      </div>
                  ) : (
                      <div className="flex flex-col items-center justify-center text-white/50 h-full w-full">
                          <BookOpen size={48} className="mb-4 opacity-50"/>
                          <p>Select a student to view report</p>
                      </div>
                  )}
              </div>

          </div>
      </div>

      <Dock />
    </div>
  );
};

export default ReportCards;