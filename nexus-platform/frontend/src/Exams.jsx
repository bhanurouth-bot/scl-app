import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Plus, Clock, Trash2, 
  MapPin, AlertCircle, Layers 
} from 'lucide-react';
import api from './api';
import Dock from './Dock';
// Import New UI Components
import { GlassInput, GlassButton, GlassSelect, Skeleton } from './components/GlassUI';

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [classrooms, setClassrooms] = useState([]); 
  const [subjects, setSubjects] = useState([]);
  
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);

  // Forms
  const [examForm, setExamForm] = useState({
    name: '', description: '', start_date: '', end_date: '', classrooms: []
  });

  const [paperForm, setPaperForm] = useState({
    subject: '', date: '', start_time: '', end_time: '', room_number: '', total_marks: 100
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [exRes, clRes, sbRes] = await Promise.all([
        api.get('results/exams/'),
        api.get('core/classrooms/'),
        api.get('academics/subjects/')
      ]);
      setExams(exRes.data);
      setClassrooms(clRes.data);
      setSubjects(sbRes.data);
      
      if (selectedExam) {
          const updated = exRes.data.find(e => e.id === selectedExam.id);
          setSelectedExam(updated || null);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      await api.post('results/exams/', examForm);
      setIsExamModalOpen(false);
      setExamForm({ name: '', description: '', start_date: '', end_date: '', classrooms: [] });
      fetchData();
    } catch (err) { alert("Failed to schedule exam."); }
  };

  const handleDeleteExam = async (id, e) => {
    e.stopPropagation();
    if(!window.confirm("Delete this exam and all its papers?")) return;
    try { await api.delete(`results/exams/${id}/`); fetchData(); setSelectedExam(null); } catch (err) { console.error(err); }
  };

  const handleCreatePaper = async (e) => {
    e.preventDefault();
    if (!selectedExam) return;
    try {
        await api.post('results/papers/', { ...paperForm, exam: selectedExam.id });
        setIsPaperModalOpen(false);
        setPaperForm({ subject: '', date: '', start_time: '', end_time: '', room_number: '', total_marks: 100 });
        fetchData();
    } catch (err) { alert("Failed to add paper."); }
  };

  const handleDeletePaper = async (id) => {
      try { await api.delete(`results/papers/${id}/`); fetchData(); } catch(err) { console.error(err); }
  };

  const toggleClassroom = (id) => {
      const current = examForm.classrooms;
      setExamForm({ ...examForm, classrooms: current.includes(id) ? current.filter(c => c !== id) : [...current, id] });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden selection:bg-orange-500/30">
      
      <div className="fixed top-[-20%] left-[-10%] w-[900px] h-[900px] bg-orange-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
               <Calendar className="text-orange-400" size={28} />
            </div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-orange-200 tracking-tighter">
              Exam Schedule
            </h1>
          </div>
          <p className="text-gray-400 font-medium pl-2">Manage Terms & Papers</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          
          {/* LEFT: EXAM LIST */}
          <div className="lg:col-span-1 space-y-4">
               <div className="flex justify-between items-center mb-2">
                   <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Exam Terms</h3>
                   <button onClick={() => setIsExamModalOpen(true)} className="text-xs bg-orange-600 hover:bg-orange-500 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all">
                       <Plus size={14}/> New Term
                   </button>
               </div>
               
               <div className="space-y-3 h-[600px] overflow-y-auto custom-scrollbar pr-2">
                   {loading ? (
                       // EXAM LIST SKELETON
                       [...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl bg-white/5" />)
                   ) : exams.map((exam) => (
                       <motion.div 
                          key={exam.id}
                          onClick={() => setSelectedExam(exam)}
                          whileHover={{ scale: 1.02 }}
                          className={`p-5 rounded-2xl cursor-pointer border transition-all ${
                              selectedExam?.id === exam.id 
                              ? 'bg-orange-500/10 border-orange-500/50 shadow-lg shadow-orange-900/20' 
                              : 'bg-white/5 border-white/5 hover:bg-white/10'
                          }`}
                       >
                           <div className="flex justify-between items-start">
                               <h4 className="font-bold text-white text-lg">{exam.name}</h4>
                               <button onClick={(e) => handleDeleteExam(exam.id, e)} className="text-gray-600 hover:text-red-500"><Trash2 size={16}/></button>
                           </div>
                           <div className="text-xs text-gray-400 mt-2 flex items-center gap-2">
                               <Clock size={12} className="text-orange-400"/> {exam.start_date} — {exam.end_date}
                           </div>
                       </motion.div>
                   ))}
               </div>
          </div>

          {/* RIGHT: DETAILS PANEL */}
          <div className="lg:col-span-2">
              <div className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-white/5 h-[660px] flex flex-col">
                  {selectedExam ? (
                      <>
                          <div className="flex justify-between items-start border-b border-white/10 pb-6 mb-6">
                              <div>
                                  <h2 className="text-3xl font-bold text-white">{selectedExam.name}</h2>
                                  <p className="text-gray-400 text-sm mt-1">{selectedExam.description || "No description."}</p>
                              </div>
                              <GlassButton onClick={() => setIsPaperModalOpen(true)} variant="ghost" className="bg-white text-black hover:bg-gray-200">
                                  <Plus size={18}/> Add Paper
                              </GlassButton>
                          </div>

                          {/* Paper List */}
                          <div className="overflow-y-auto custom-scrollbar flex-1 space-y-3">
                              {selectedExam.papers && selectedExam.papers.length > 0 ? (
                                  selectedExam.papers.map((paper) => (
                                      <div key={paper.id} className="p-4 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                                          <div className="flex items-center gap-4">
                                              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex flex-col items-center justify-center text-orange-400 border border-orange-500/20">
                                                  <span className="text-lg font-bold leading-none">{new Date(paper.date).getDate()}</span>
                                                  <span className="text-[10px] uppercase font-bold">{new Date(paper.date).toLocaleString('default', { month: 'short' })}</span>
                                              </div>
                                              <div>
                                                  <h4 className="font-bold text-white text-lg">{paper.subject_name}</h4>
                                                  <div className="text-xs text-gray-400 flex items-center gap-3 mt-1">
                                                      <span><MapPin size={12}/> Room {paper.room_number || 'TBA'}</span>
                                                      <span><Clock size={12}/> {paper.start_time.slice(0,5)} - {paper.end_time.slice(0,5)}</span>
                                                  </div>
                                              </div>
                                          </div>
                                          <div className="flex items-center gap-6">
                                              <span className="text-sm font-bold text-gray-500 bg-white/5 px-3 py-1 rounded-lg">{paper.total_marks} Marks</span>
                                              <button onClick={() => handleDeletePaper(paper.id)} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18}/></button>
                                          </div>
                                      </div>
                                  ))
                              ) : (
                                  <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                                      <AlertCircle size={48} className="mb-4"/>
                                      <p>No papers scheduled yet.</p>
                                  </div>
                              )}
                          </div>
                      </>
                  ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                          <Layers size={64} className="mb-4"/>
                          <p className="text-xl font-medium">Select an exam to manage</p>
                      </div>
                  )}
              </div>
          </div>
      </div>

      <Dock />

      {/* --- EXAM MODAL --- */}
      <AnimatePresence>
        {isExamModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full max-w-lg bg-[#111] border border-white/10 rounded-[2rem] p-8 shadow-2xl">
                    <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">New Exam Term</h2>
                    <form onSubmit={handleCreateExam} className="space-y-4">
                        <GlassInput placeholder="Term Name" value={examForm.name} onChange={e => setExamForm({...examForm, name: e.target.value})} />
                        <textarea placeholder="Description" value={examForm.description} onChange={e => setExamForm({...examForm, description: e.target.value})} className="w-full bg-black/20 border border-white/10 p-3 rounded-xl text-white outline-none h-24 focus:bg-black/40" />
                        <div className="grid grid-cols-2 gap-4">
                            <GlassInput type="date" value={examForm.start_date} onChange={e => setExamForm({...examForm, start_date: e.target.value})} />
                            <GlassInput type="date" value={examForm.end_date} onChange={e => setExamForm({...examForm, end_date: e.target.value})} />
                        </div>
                         <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border border-white/10 rounded-xl custom-scrollbar">
                            {classrooms.map(c => (
                                <div key={c.id} onClick={() => toggleClassroom(c.id)} className={`p-2 rounded cursor-pointer text-xs ${examForm.classrooms.includes(c.id) ? 'bg-orange-500/20 text-orange-400 border border-orange-500' : 'bg-white/5 text-gray-400'}`}>
                                    Grade {c.grade_level}-{c.section}
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3 mt-4">
                            <GlassButton type="button" onClick={() => setIsExamModalOpen(false)} variant="ghost" className="flex-1">Cancel</GlassButton>
                            <GlassButton type="submit" variant="primary" className="flex-1 bg-orange-600 hover:bg-orange-500">Create Term</GlassButton>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* --- PAPER MODAL --- */}
      <AnimatePresence>
        {isPaperModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full max-w-lg bg-[#111] border border-white/10 rounded-[2rem] p-8 shadow-2xl">
                    <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Add Paper</h2>
                    <form onSubmit={handleCreatePaper} className="space-y-4">
                        <GlassSelect required value={paperForm.subject} onChange={e => setPaperForm({...paperForm, subject: e.target.value})}>
                             <option value="">Select Subject</option>
                             {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </GlassSelect>
                        <div className="grid grid-cols-2 gap-4">
                            <GlassInput required type="date" value={paperForm.date} onChange={e => setPaperForm({...paperForm, date: e.target.value})} />
                            <GlassInput required type="number" placeholder="Marks" value={paperForm.total_marks} onChange={e => setPaperForm({...paperForm, total_marks: e.target.value})} />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <GlassInput required type="time" value={paperForm.start_time} onChange={e => setPaperForm({...paperForm, start_time: e.target.value})} />
                            <GlassInput required type="time" value={paperForm.end_time} onChange={e => setPaperForm({...paperForm, end_time: e.target.value})} />
                        </div>
                         <GlassInput placeholder="Room (Optional)" value={paperForm.room_number} onChange={e => setPaperForm({...paperForm, room_number: e.target.value})} />
                        
                        <div className="flex gap-3 mt-4">
                            <GlassButton type="button" onClick={() => setIsPaperModalOpen(false)} variant="ghost" className="flex-1">Cancel</GlassButton>
                            <GlassButton type="submit" variant="primary" className="flex-1 bg-orange-600 hover:bg-orange-500">Add Paper</GlassButton>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Exams;