import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, Save, Search, BookOpen, UserX
} from 'lucide-react';
import api from './api';
import Dock from './Dock';
import { GlassSelect, GlassButton, Skeleton } from './components/GlassUI';

const Gradebook = () => {
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(true);
  
  // Metadata State
  const [exams, setExams] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
  // Selection State
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  
  // Data State
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});

  // Load Metadata on Mount
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [exRes, clRes, sbRes] = await Promise.all([
          api.get('results/exams/'),
          api.get('core/classrooms/'),
          api.get('academics/subjects/')
        ]);
        setExams(exRes.data);
        setClassrooms(clRes.data);
        setSubjects(sbRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setMetaLoading(false);
      }
    };
    loadMeta();
  }, []);

  // Fetch Students & Marks
  useEffect(() => {
    if (selectedClass && selectedSubject && selectedExam) {
      fetchGradeSheet();
    }
  }, [selectedClass, selectedSubject, selectedExam]);

  const fetchGradeSheet = async () => {
    setLoading(true);
    try {
      const stdRes = await api.get(`students/profiles/?classroom=${selectedClass}`);
      const studentList = stdRes.data;
      setStudents(studentList);

      const resRes = await api.get(`results/marks/?exam=${selectedExam}`);
      const currentSubjectResults = resRes.data.filter(r => String(r.subject) === String(selectedSubject));

      const initialMarks = {};
      studentList.forEach(student => {
        const found = currentSubjectResults.find(r => r.student === student.id);
        initialMarks[student.id] = found ? found.marks_obtained : '';
      });
      setMarks(initialMarks);

    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const handleMarkChange = (studentId, value) => {
    if (value > 100) return; 
    setMarks(prev => ({ ...prev, [studentId]: value }));
  };

  const calculateGrade = (score) => {
    if (!score && score !== 0) return '-';
    const s = parseFloat(score);
    if (s >= 90) return 'A+';
    if (s >= 80) return 'A';
    if (s >= 70) return 'B';
    if (s >= 60) return 'C';
    if (s >= 50) return 'D';
    return 'F';
  };

  const getGradeColor = (grade) => {
    switch(grade) {
        case 'A+': case 'A': return 'text-emerald-400';
        case 'B': return 'text-blue-400';
        case 'C': return 'text-yellow-400';
        case 'D': return 'text-orange-400';
        case 'F': return 'text-red-500 font-bold';
        default: return 'text-gray-500';
    }
  };

  const handleSave = async () => {
    if (!selectedExam || !selectedSubject || !selectedClass) return;
    setLoading(true);
    const payload = students.map(student => ({
      student: student.id,
      exam: selectedExam,
      subject: selectedSubject,
      marks_obtained: marks[student.id] || 0,
      total_marks: 100
    }));

    try {
      await api.post('results/marks/bulk_entry/', payload);
      alert("Grades Published Successfully!");
      fetchGradeSheet(); 
    } catch (err) { alert("Failed to save."); } 
    finally { setLoading(false); }
  };

  // Stats
  const enteredMarks = Object.values(marks).filter(m => m !== '').map(Number);
  const avgScore = enteredMarks.length ? (enteredMarks.reduce((a, b) => a + b, 0) / enteredMarks.length).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden selection:bg-emerald-500/30">
      
      <div className="fixed top-[-20%] right-[-10%] w-[900px] h-[900px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
               <Calculator className="text-emerald-400" size={28} />
            </div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-emerald-200 tracking-tighter">
              Gradebook
            </h1>
          </div>
          <p className="text-gray-400 font-medium pl-2">Exam Results & Performance</p>
        </motion.div>

        {enteredMarks.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                <div className="glass-panel px-6 py-3 rounded-2xl flex flex-col items-center border border-white/10">
                    <span className="text-xs text-gray-500 uppercase font-bold">Avg Score</span>
                    <span className="text-2xl font-bold text-white">{avgScore}%</span>
                </div>
            </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
          
          {/* Filters Panel */}
          <div className="lg:col-span-1 space-y-6">
              <div className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-white/5">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                      <BookOpen size={16}/> Configuration
                  </h3>

                  <div className="space-y-4">
                      {metaLoading ? (
                         <>
                           <Skeleton className="h-12 w-full bg-white/5" />
                           <Skeleton className="h-12 w-full bg-white/5" />
                           <Skeleton className="h-12 w-full bg-white/5" />
                         </>
                      ) : (
                        <>
                          <div>
                              <label className="text-xs font-bold text-gray-500 ml-2 mb-1 block">Exam Term</label>
                              <GlassSelect value={selectedExam} onChange={e => setSelectedExam(e.target.value)}>
                                  <option value="">-- Select Exam --</option>
                                  {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                              </GlassSelect>
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-500 ml-2 mb-1 block">Class</label>
                              <GlassSelect value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                                  <option value="">-- Select Class --</option>
                                  {classrooms.map(c => <option key={c.id} value={c.id}>Grade {c.grade_level}-{c.section}</option>)}
                              </GlassSelect>
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-500 ml-2 mb-1 block">Subject</label>
                              <GlassSelect value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                                  <option value="">-- Select Subject --</option>
                                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                              </GlassSelect>
                          </div>
                        </>
                      )}
                  </div>

                  <GlassButton 
                    onClick={handleSave}
                    disabled={!selectedExam || !selectedClass || !selectedSubject || loading}
                    variant="success"
                    className="w-full mt-8 py-4"
                  >
                      {loading ? 'Saving...' : <><Save size={20}/> Publish Results</>}
                  </GlassButton>
              </div>
          </div>

          {/* Data Grid */}
          <div className="lg:col-span-3">
              <div className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-white/5 min-h-[600px] flex flex-col">
                  
                  {loading && students.length === 0 ? (
                      // LOADING SKELETON
                      <div className="space-y-4">
                          {[...Array(6)].map((_, i) => (
                              <div key={i} className="flex gap-4 p-4 border-b border-white/5">
                                  <Skeleton className="w-10 h-10 rounded-full bg-white/5" />
                                  <div className="flex-1 space-y-2">
                                      <Skeleton className="w-1/3 h-4 bg-white/5" />
                                      <Skeleton className="w-1/4 h-3 bg-white/5" />
                                  </div>
                                  <Skeleton className="w-16 h-8 rounded-lg bg-white/5" />
                              </div>
                          ))}
                      </div>
                  ) : students.length > 0 ? (
                      <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                              <thead>
                                  <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider">
                                      <th className="p-4 font-bold">Student</th>
                                      <th className="p-4 font-bold text-center">Marks (100)</th>
                                      <th className="p-4 font-bold text-center">Grade</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  <AnimatePresence>
                                      {students.map((student, idx) => {
                                          const score = marks[student.id];
                                          const grade = calculateGrade(score);
                                          const isFail = grade === 'F';

                                          return (
                                              <motion.tr 
                                                key={student.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                                              >
                                                  <td className="p-4">
                                                      <div className="flex items-center gap-3">
                                                          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-white overflow-hidden border border-white/10">
                                                              {student.profile_picture ? (
                                                                  <img src={student.profile_picture} className="w-full h-full object-cover"/>
                                                              ) : student.user.first_name[0]}
                                                          </div>
                                                          <div>
                                                              <div className="font-bold text-white">{student.user.first_name} {student.user.last_name}</div>
                                                              <div className="text-xs text-gray-500">{student.student_id}</div>
                                                          </div>
                                                      </div>
                                                  </td>
                                                  <td className="p-4 text-center">
                                                      <input 
                                                        type="number" min="0" max="100"
                                                        value={score}
                                                        onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                                        className={`w-20 bg-black/30 border border-white/10 rounded-xl py-2 text-center text-white outline-none focus:border-emerald-500 font-mono font-bold transition-all ${isFail && score !== '' ? 'border-red-500/50 text-red-400' : ''}`}
                                                        placeholder="-"
                                                      />
                                                  </td>
                                                  <td className={`p-4 text-center font-bold text-lg ${getGradeColor(grade)}`}>
                                                      {grade}
                                                  </td>
                                              </motion.tr>
                                          );
                                      })}
                                  </AnimatePresence>
                              </tbody>
                          </table>
                      </div>
                  ) : (
                      // EMPTY STATE
                      <div className="flex flex-col items-center justify-center h-full text-gray-500 flex-1 opacity-50">
                          <Search size={48} className="mb-4 text-gray-600"/>
                          <p className="text-lg">Select Configuration to load grade sheet</p>
                      </div>
                  )}

              </div>
          </div>
      </div>

      <Dock />
    </div>
  );
};

export default Gradebook;