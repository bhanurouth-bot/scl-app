import React, { useState, useEffect } from 'react';
import Dock from '../components/Dock';
import GlassCard from '../components/GlassCard';
import GlassModal from '../components/GlassModal';
import { BookOpen, Calendar, Clock, Plus, Link as LinkIcon, FileText, Filter, UserCheck, CheckCircle } from 'lucide-react';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Toggle Roles (Simulation)
  const [isTeacherMode, setTeacherMode] = useState(false);

  // Create Modal State
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [newAssignment, setNewAssignment] = useState({ 
      title: '', description: '', subject: '', due_date: '', 
      grade: '', section: '' 
  });

  // Filter State
  const [viewGrade, setViewGrade] = useState('');
  const [viewSection, setViewSection] = useState('');

  // Selected Task State
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Student: Submission State
  const [submissionLink, setSubmissionLink] = useState('');
  const [studentId, setStudentId] = useState('');

  // Teacher: Grading State
  const [submissionsList, setSubmissionsList] = useState([]);
  const [gradingData, setGradingData] = useState({}); 

  useEffect(() => {
    fetchData();
  }, [viewGrade, viewSection]);

  useEffect(() => {
    if (isTeacherMode && selectedTask) {
        fetchSubmissions(selectedTask.id);
    }
  }, [selectedTask, isTeacherMode]);

  const fetchData = async () => {
    const token = localStorage.getItem('accessToken');
    const headers = { 'Authorization': `Bearer ${token}` };
    
    const params = new URLSearchParams();
    if (viewGrade) params.append('grade', viewGrade);
    if (viewSection) params.append('section', viewSection);

    const [assignRes, subRes] = await Promise.all([
        fetch(`http://127.0.0.1:8000/api/assignments/?${params.toString()}`, { headers }),
        fetch('http://127.0.0.1:8000/api/academics/subjects/', { headers })
    ]);

    if (assignRes.ok) setAssignments(await assignRes.json());
    if (subRes.ok) setSubjects(await subRes.json());
    setLoading(false);
  };

  const fetchSubmissions = async (assignmentId) => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`http://127.0.0.1:8000/api/assignments/${assignmentId}/submissions/`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
    });
    if (res.ok) {
        const data = await res.json();
        setSubmissionsList(data);
        const initial = {};
        data.forEach(sub => {
            initial[sub.id] = { grade: sub.grade || '', feedback: sub.feedback || '' };
        });
        setGradingData(initial);
    }
  };

  const createAssignment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    await fetch('http://127.0.0.1:8000/api/assignments/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newAssignment)
    });
    setCreateOpen(false); fetchData();
  };

  const submitWork = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    const res = await fetch('http://127.0.0.1:8000/api/assignments/submit/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
            assignment_id: selectedTask.id, 
            student_id: studentId, 
            content: submissionLink 
        })
    });
    
    if (res.ok) { alert("Work Submitted!"); setSelectedTask(null); fetchData(); }
    else alert("Submission Failed (Check Student ID)");
  };

  const saveGrade = async (submissionId) => {
      const data = gradingData[submissionId];
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://127.0.0.1:8000/api/assignments/submission/${submissionId}/grade/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(data)
      });
      if(res.ok) alert("Grade Saved!");
  };

  const handleGradeChange = (subId, field, value) => {
      setGradingData(prev => ({
          ...prev,
          [subId]: { ...prev[subId], [field]: value }
      }));
  };

  return (
    <div className="min-h-screen bg-nexus-dark text-white relative selection:bg-blue-500/30">
       <div className="fixed inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
       <div className="absolute inset-0 bg-nexus-dark/90 backdrop-blur-sm"></div>

       <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 pb-32">
         
         <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white">LMS</h1>
              <p className="text-slate-400 mt-2">Homework & Assignments</p>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg border border-white/10">
                    <button onClick={() => setTeacherMode(false)} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${!isTeacherMode ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>Student View</button>
                    <button onClick={() => setTeacherMode(true)} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${isTeacherMode ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>Teacher View</button>
                </div>

                {isTeacherMode && (
                    <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg transition-all font-medium">
                        <Plus size={20} /> New Assignment
                    </button>
                )}
            </div>
         </div>

         <GlassCard className="mb-8 p-4 flex items-center gap-4">
             <Filter size={18} className="text-slate-400" />
             <span className="text-sm font-bold text-slate-300">View As:</span>
             <input type="text" placeholder="Grade (10)" value={viewGrade} onChange={e => setViewGrade(e.target.value)} className="w-24 bg-black/30 border border-white/10 rounded-lg px-3 py-1 text-white text-sm" />
             <input type="text" placeholder="Sec (A)" value={viewSection} onChange={e => setViewSection(e.target.value)} className="w-24 bg-black/30 border border-white/10 rounded-lg px-3 py-1 text-white text-sm" />
             <span className="text-xs text-slate-500 italic ml-auto">
                 {isTeacherMode ? "Filtering Assignments to Grade" : "Finding my Homework"}
             </span>
         </GlassCard>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {assignments.length === 0 && <div className="text-center text-slate-500 py-10">No assignments found.</div>}
                
                {assignments.map(task => (
                    <GlassCard 
                        key={task.id} 
                        onClick={() => setSelectedTask(task)}
                        className={`cursor-pointer transition-all hover:border-blue-500/50 group ${selectedTask?.id === task.id ? 'border-blue-500 bg-blue-900/10' : ''}`}
                    >
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-white group-hover:text-blue-200 line-clamp-1">{task.title}</h3>
                                <div className="text-xs text-orange-400 font-bold whitespace-nowrap">{task.due_date}</div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-400">
                                <span className="px-2 py-0.5 rounded bg-white/10">{task.subject_name}</span>
                                <span className="flex items-center gap-1"><UserCheck size={12}/> {task.submission_count} Done</span>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            <div className="lg:col-span-2">
                {selectedTask ? (
                    <GlassCard className="h-full border-t-4 border-t-blue-500 flex flex-col">
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold mb-2">{selectedTask.title}</h2>
                            <div className="flex gap-4 text-sm text-slate-400">
                                <span className="flex items-center gap-1"><Calendar size={14}/> Posted {new Date(selectedTask.created_at).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1 text-purple-400"><UserCheck size={14}/> For Class {selectedTask.grade}-{selectedTask.section}</span>
                            </div>
                        </div>

                        <div className="bg-white/5 p-5 rounded-xl border border-white/10 mb-8 flex-shrink-0">
                            <h4 className="text-xs uppercase text-slate-500 tracking-widest mb-3">Instructions</h4>
                            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                {selectedTask.description}
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            
                            {isTeacherMode ? (
                                <div className="space-y-4">
                                    <h3 className="font-bold text-lg flex items-center gap-2 border-b border-white/10 pb-2">
                                        <CheckCircle className="text-purple-400"/> Submissions ({submissionsList.length})
                                    </h3>
                                    
                                    {submissionsList.length === 0 ? (
                                        <div className="text-center text-slate-500 py-8">No students have submitted yet.</div>
                                    ) : (
                                        <div className="grid gap-4">
                                            {submissionsList.map(sub => (
                                                <div key={sub.id} className="p-4 bg-white/5 rounded-lg border border-white/10 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                                    <div className="md:col-span-3">
                                                        <div className="font-bold text-white">{sub.student_name}</div>
                                                        <div className="text-xs text-slate-400">{new Date(sub.submitted_at).toLocaleString()}</div>
                                                    </div>
                                                    <div className="md:col-span-4">
                                                        <a href={sub.content} target="_blank" rel="noreferrer" className="text-blue-400 text-sm hover:underline flex items-center gap-1">
                                                            <LinkIcon size={12}/> Open Submission
                                                        </a>
                                                        <div className="text-xs text-slate-500 truncate mt-1">{sub.content}</div>
                                                    </div>
                                                    <div className="md:col-span-3 flex gap-2">
                                                        <input 
                                                            type="text" 
                                                            placeholder="Grade (A)" 
                                                            value={gradingData[sub.id]?.grade || ''}
                                                            onChange={e => handleGradeChange(sub.id, 'grade', e.target.value)}
                                                            className="w-full bg-black/40 border border-white/20 rounded px-2 py-1 text-center text-green-400 font-bold focus:outline-none focus:border-green-500"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2 text-right">
                                                        <button 
                                                            onClick={() => saveGrade(sub.id)}
                                                            className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded shadow transition-all"
                                                        >
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-blue-900/10 border border-blue-500/20 p-6 rounded-xl">
                                    <h3 className="font-bold flex items-center gap-2 mb-4 text-blue-300">
                                        <FileText size={18}/> Submit Your Work
                                    </h3>
                                    
                                    <form onSubmit={submitWork} className="space-y-4">
                                        <div>
                                            <label className="text-xs text-slate-400 ml-1">Student ID</label>
                                            {/* CHANGED TO TYPE="TEXT" HERE */}
                                            <input 
                                                type="text" 
                                                required 
                                                value={studentId} 
                                                onChange={e => setStudentId(e.target.value)} 
                                                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white text-sm mt-1"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 ml-1">Link to Work (Google Doc / Drive)</label>
                                            <div className="relative mt-1">
                                                <LinkIcon className="absolute left-3 top-3 text-slate-500" size={16} />
                                                <input type="text" required value={submissionLink} onChange={e => setSubmissionLink(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm"/>
                                            </div>
                                        </div>
                                        <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                                            <CheckCircle size={18}/> Mark as Done
                                        </button>
                                    </form>
                                </div>
                            )}

                        </div>
                    </GlassCard>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                        <BookOpen size={48} className="opacity-20 mb-4"/>
                        <p>Select an assignment to view details</p>
                    </div>
                )}
            </div>

         </div>

         <GlassModal isOpen={isCreateOpen} onClose={() => setCreateOpen(false)} title="Post New Assignment">
            <form onSubmit={createAssignment} className="space-y-4">
                <input type="text" placeholder="Title" required value={newAssignment.title} onChange={e=>setNewAssignment({...newAssignment, title: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white"/>
                
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Target Grade (e.g. 10, 11)" required value={newAssignment.grade} onChange={e=>setNewAssignment({...newAssignment, grade: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white"/>
                    <input type="text" placeholder="Target Section (e.g. A, B)" required value={newAssignment.section} onChange={e=>setNewAssignment({...newAssignment, section: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white"/>
                </div>

                <textarea placeholder="Description / Instructions" required value={newAssignment.description} onChange={e=>setNewAssignment({...newAssignment, description: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white h-32"/>
                <div className="grid grid-cols-2 gap-4">
                    <select required value={newAssignment.subject} onChange={e=>setNewAssignment({...newAssignment, subject: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white">
                        <option value="">Select Subject</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <input type="date" required value={newAssignment.due_date} onChange={e=>setNewAssignment({...newAssignment, due_date: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white"/>
                </div>
                <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold">Publish Assignment</button>
            </form>
         </GlassModal>

       </main>
       <Dock />
    </div>
  );
};
export default Assignments;