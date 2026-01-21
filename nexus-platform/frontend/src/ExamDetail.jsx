import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Clock, Plus, Save, Users, Award, X } from 'lucide-react';
import api from './api';
import Dock from './Dock';

const ExamDetail = () => {
  const { id } = useParams(); // Batch ID
  const navigate = useNavigate();
  
  const [batch, setBatch] = useState(null);
  const [papers, setPapers] = useState([]); // Exams in this batch
  const [loading, setLoading] = useState(true);
  
  // Create Paper State
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [newPaper, setNewPaper] = useState({ classroom: '', subject: '', date: '', start_time: '09:00', duration_minutes: 60, total_marks: 100 });
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Grading State (The Active Paper being graded)
  const [activePaper, setActivePaper] = useState(null);
  const [marksData, setMarksData] = useState([]); // [{student_id, score, is_absent}]
  const [savingMarks, setSavingMarks] = useState(false);

  // --- Initial Fetch ---
  useEffect(() => {
    const load = async () => {
      try {
        const [batchRes, examRes, clsRes, subRes] = await Promise.all([
            api.get(`exams/batches/${id}/`),
            api.get(`exams/exams/?batch=${id}`),
            api.get('core/classrooms/'),
            api.get('academics/subjects/')
        ]);
        setBatch(batchRes.data);
        setPapers(examRes.data);
        setClasses(clsRes.data);
        setSubjects(subRes.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    load();
  }, [id]);

  // --- Handlers ---
  const handleCreatePaper = async (e) => {
    e.preventDefault();
    try {
        await api.post('exams/exams/', { ...newPaper, batch: id });
        const res = await api.get(`exams/exams/?batch=${id}`);
        setPapers(res.data);
        setIsPaperModalOpen(false);
    } catch(err) { alert("Error creating paper"); }
  };

  const openGrading = async (paper) => {
    setActivePaper(paper);
    setMarksData([]); 
    
    try {
        // 1. Get Students
        const stuRes = await api.get(`students/students/?classroom=${paper.classroom}`);
        // 2. Get Existing Marks (if any)
        const resRes = await api.get(`exams/results/?exam=${paper.id}`);
        
        // Merge Logic
        const merged = stuRes.data.map(stu => {
            const existing = resRes.data.find(r => r.student === stu.id);
            return {
                student_id: stu.id,
                name: stu.user.first_name + ' ' + stu.user.last_name,
                roll: stu.roll_number,
                score: existing ? existing.marks_obtained : '',
                is_absent: existing ? existing.is_absent : false,
                grade: existing ? existing.grade : '-'
            };
        });
        setMarksData(merged);
    } catch(err) { console.error(err); }
  };

  const handleMarkChange = (idx, field, value) => {
    const updated = [...marksData];
    updated[idx][field] = value;
    setMarksData(updated);
  };

  const saveMarks = async () => {
    setSavingMarks(true);
    try {
        const payload = {
            exam_id: activePaper.id,
            marks: marksData.map(m => ({
                student_id: m.student_id,
                score: m.score || 0,
                is_absent: m.is_absent
            }))
        };
        await api.post('exams/exams/bulk_entry/', payload);
        alert("Marks Saved & Grades Calculated!");
        setActivePaper(null); // Close grading view
    } catch(err) { 
        alert("Failed to save marks."); 
    } finally { setSavingMarks(false); }
  };

  if (loading) return <div className="text-white p-10">Loading Exam Data...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden selection:bg-pink-500/30">
       <div className="fixed top-[-10%] right-[-10%] w-[900px] h-[900px] bg-pink-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <button onClick={() => navigate('/exams')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors">
             <ArrowLeft size={18} /> Back to Batches
          </button>
          <h1 className="text-5xl font-bold text-white tracking-tight">{batch?.name}</h1>
          <p className="text-gray-400 mt-2 flex items-center gap-2"><Clock size={16}/> {batch?.start_date} to {batch?.end_date}</p>
        </motion.div>

        <button 
          onClick={() => setIsPaperModalOpen(true)}
          className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 border border-white/10 transition-all"
        >
          <Plus size={20} /> Add Paper
        </button>
      </div>

      {/* --- View 1: List of Papers --- */}
      {!activePaper && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
             {papers.length === 0 && <div className="col-span-full text-gray-500 text-center py-10">No papers scheduled. Add one above.</div>}
             {papers.map((paper, idx) => (
                 <motion.div 
                   key={paper.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   className="glass-panel p-6 rounded-[2rem] border border-white/5 bg-white/5 hover:border-pink-500/50 transition-all group"
                 >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-pink-500/20 text-pink-300 rounded-xl"><BookOpen size={20} /></div>
                        <span className="text-xs font-mono text-gray-500">{paper.date}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{paper.subject_name}</h3>
                    <p className="text-gray-400 text-sm mb-6">{paper.classroom_name}</p>
                    
                    <button 
                        onClick={() => openGrading(paper)}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold flex items-center justify-center gap-2 transition-all"
                    >
                        <Award size={18} /> Enter Marks
                    </button>
                 </motion.div>
             ))}
          </div>
      )}

      {/* --- View 2: Grading Interface --- */}
      <AnimatePresence>
      {activePaper && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#050505] p-8 overflow-y-auto">
              <div className="max-w-5xl mx-auto">
                  <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                      <div>
                          <h2 className="text-3xl font-bold text-white mb-1">Grading: {activePaper.subject_name}</h2>
                          <p className="text-pink-400 font-mono">{activePaper.classroom_name} • Max Marks: {activePaper.total_marks}</p>
                      </div>
                      <div className="flex gap-4">
                          <button onClick={() => setActivePaper(null)} className="px-6 py-3 text-gray-400 hover:text-white">Cancel</button>
                          <button 
                            onClick={saveMarks}
                            disabled={savingMarks}
                            className="bg-green-600 hover:bg-green-500 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-green-900/20"
                          >
                             <Save size={20} /> {savingMarks ? 'Saving...' : 'Save All Marks'}
                          </button>
                      </div>
                  </div>

                  {/* Mark Sheet Grid */}
                  <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                      <div className="grid grid-cols-[50px_2fr_1fr_1fr_1fr] gap-4 p-4 border-b border-white/10 bg-white/5 font-bold text-gray-400 uppercase text-xs tracking-wider">
                          <div className="text-center">#</div>
                          <div>Student Name</div>
                          <div>Marks Obtained</div>
                          <div className="text-center">Absent?</div>
                          <div className="text-center">Grade</div>
                      </div>
                      
                      {marksData.map((row, idx) => (
                          <div key={row.student_id} className="grid grid-cols-[50px_2fr_1fr_1fr_1fr] gap-4 p-4 border-b border-white/5 items-center hover:bg-white/5 transition-colors">
                              <div className="text-center text-gray-500 font-mono">{idx + 1}</div>
                              
                              <div>
                                  <div className="font-bold text-white">{row.name}</div>
                                  <div className="text-xs text-gray-500 font-mono">Roll: {row.roll}</div>
                              </div>
                              
                              <div>
                                  <input 
                                    type="number" 
                                    disabled={row.is_absent}
                                    value={row.score} 
                                    max={activePaper.total_marks}
                                    onChange={(e) => handleMarkChange(idx, 'score', e.target.value)}
                                    className={`w-full bg-black/40 border ${row.score > activePaper.total_marks ? 'border-red-500 text-red-500' : 'border-white/10 text-white'} rounded-lg p-2 text-center font-mono outline-none focus:border-pink-500 disabled:opacity-30`}
                                  />
                              </div>
                              
                              <div className="flex justify-center">
                                  <button 
                                    onClick={() => handleMarkChange(idx, 'is_absent', !row.is_absent)}
                                    className={`p-2 rounded-lg border transition-all ${row.is_absent ? 'bg-red-500/20 border-red-500 text-red-500' : 'border-white/10 text-gray-600 hover:text-white'}`}
                                  >
                                      {row.is_absent ? 'ABSENT' : 'Present'}
                                  </button>
                              </div>
                              
                              <div className="text-center font-bold text-xl text-yellow-500">{row.grade}</div>
                          </div>
                      ))}
                  </div>
              </div>
          </motion.div>
      )}
      </AnimatePresence>

      <Dock />

      {/* Modal: New Paper */}
      <AnimatePresence>
        {isPaperModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full max-w-lg bg-[#111] border border-white/10 rounded-[2rem] p-8 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-6">Schedule Exam Paper</h2>
                    <form onSubmit={handleCreatePaper} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold ml-2">Class</label>
                                <select required onChange={e => setNewPaper({...newPaper, classroom: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none [&>option]:bg-gray-900">
                                    <option value="">Select Class</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>Grade {c.grade_level}-{c.section}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold ml-2">Subject</label>
                                <select required onChange={e => setNewPaper({...newPaper, subject: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none [&>option]:bg-gray-900">
                                    <option value="">Select Subject</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold ml-2">Date</label>
                                <input required type="date" onChange={e => setNewPaper({...newPaper, date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold ml-2">Max Marks</label>
                                <input required type="number" defaultValue={100} onChange={e => setNewPaper({...newPaper, total_marks: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none" />
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button type="button" onClick={() => setIsPaperModalOpen(false)} className="flex-1 py-3 text-gray-500 hover:text-white">Cancel</button>
                            <button type="submit" className="flex-1 bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 rounded-xl">Schedule</button>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ExamDetail;