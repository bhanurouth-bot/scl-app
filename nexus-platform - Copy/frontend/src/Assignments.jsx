import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, Plus, Calendar, BookOpen, Clock, 
  CheckCircle, FileText, User, UserCheck 
} from 'lucide-react';
import api from './api';
import Dock from './Dock';

const Assignments = () => {
  const navigate = useNavigate();
  
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Dropdown Data
  const [classrooms, setClassrooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]); // <--- NEW: List of potential graders

  const [formData, setFormData] = useState({
      title: '', 
      description: '', 
      classroom: '', 
      subject: '', 
      due_date: '', 
      total_marks: 100,
      grader: '' // <--- NEW: Grader Field
  });

  const fetchData = async () => {
    try {
      const [assRes, clsRes, subRes, teachRes] = await Promise.all([
          api.get('assignments/tasks/'),
          api.get('core/classrooms/'),
          api.get('academics/subjects/'),
          api.get('hr/employees/?role=TEACHER') // <--- NEW: Fetch Teachers
      ]);
      setAssignments(assRes.data);
      setClassrooms(clsRes.data);
      setSubjects(subRes.data);
      setTeachers(teachRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        await api.post('assignments/tasks/', formData);
        setIsModalOpen(false);
        fetchData();
        // Reset form
        setFormData({ 
            title: '', description: '', classroom: '', subject: '', 
            due_date: '', total_marks: 100, grader: '' 
        });
    } catch(err) {
        alert("Failed to post assignment.");
    }
  };

  // Calculate days remaining
  const getDaysLeft = (date) => {
      const diff = new Date(date) - new Date();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      if (days < 0) return "Overdue";
      if (days === 0) return "Due Today";
      return `${days} Days Left`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden selection:bg-cyan-500/30">
      
      <div className="fixed top-[-20%] left-[-10%] w-[900px] h-[900px] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
               <ClipboardList className="text-cyan-400" size={28} />
            </div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-200 tracking-tighter">
              Assignments
            </h1>
          </div>
          <p className="text-gray-400 font-medium pl-2">Homework & Projects</p>
        </motion.div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-6 py-3 rounded-[2rem] flex items-center gap-2 shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all"
        >
          <Plus size={20} /> Create Task
        </button>
      </div>

      {/* --- Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
         {loading ? <div className="text-gray-500 col-span-full text-center py-20">Loading Tasks...</div> : assignments.length === 0 ? (
             <div className="col-span-full text-center py-20 border border-dashed border-white/10 rounded-[2rem] text-gray-500">
                 No active assignments.
             </div>
         ) : assignments.map((task, idx) => {
             const daysLeft = getDaysLeft(task.due_date);
             const isUrgent = daysLeft === "Overdue" || daysLeft === "Due Today";

             return (
               <motion.div 
                 key={task.id}
                 onClick={() => navigate(`/assignments/${task.id}`)}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: idx * 0.05 }}
                 className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-white/5 hover:border-cyan-500/30 transition-all group relative overflow-hidden cursor-pointer"
               >
                   <div className="flex justify-between items-start mb-4">
                       <div className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-wider border border-cyan-500/20">
                           {task.subject_name}
                       </div>
                       <div className={`text-xs font-mono font-bold flex items-center gap-1 ${isUrgent ? 'text-red-400' : 'text-green-400'}`}>
                           <Clock size={12}/> {daysLeft}
                       </div>
                   </div>

                   <h3 className="text-2xl font-bold text-white mb-2 leading-tight">{task.title}</h3>
                   <div className="text-sm text-gray-400 mb-6 flex items-center gap-2">
                        <BookOpen size={14} /> {task.classroom_name}
                   </div>

                   {/* Footer with Teacher & Grader info */}
                   <div className="flex items-center justify-between pt-4 border-t border-white/5">
                       <div className="flex flex-col gap-1">
                           <div className="flex items-center gap-2 text-xs text-gray-500">
                               <User size={12} /> Posted by {task.teacher_name || 'Teacher'}
                           </div>
                           {/* Only show if Grader is different from Creator */}
                           {task.grader_name && task.grader_name !== task.teacher_name && (
                               <div className="flex items-center gap-2 text-xs text-cyan-400">
                                   <UserCheck size={12} /> Grader: {task.grader_name}
                               </div>
                           )}
                       </div>
                       <span className="text-xs font-bold text-white bg-white/10 px-2 py-1 rounded-lg">
                           {task.total_marks} Marks
                       </span>
                   </div>
               </motion.div>
             );
         })}
      </div>

      <Dock />

      {/* --- CREATE MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full max-w-lg bg-[#111] border border-white/10 rounded-[2rem] p-8 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-6">Assign Homework</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input required placeholder="Task Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-500" />
                        
                        <div className="grid grid-cols-2 gap-4">
                             <select required value={formData.classroom} onChange={e => setFormData({...formData, classroom: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none [&>option]:bg-gray-900">
                                <option value="">Select Class</option>
                                {classrooms.map(c => <option key={c.id} value={c.id}>Grade {c.grade_level}-{c.section}</option>)}
                            </select>
                            <select required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none [&>option]:bg-gray-900">
                                <option value="">Select Subject</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        {/* --- NEW GRADER SELECTOR --- */}
                        <div>
                             <label className="text-xs text-gray-500 ml-2 uppercase font-bold">Assigned Grader (Optional)</label>
                             <select value={formData.grader} onChange={e => setFormData({...formData, grader: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-500 [&>option]:bg-gray-900">
                                <option value="">Same as Creator (Me)</option>
                                {teachers.map(t => (
                                    <option key={t.id} value={t.user.id}>
                                        {t.user.first_name} {t.user.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 ml-2 uppercase font-bold">Due Date</label>
                                <input required type="date" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-500" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 ml-2 uppercase font-bold">Total Marks</label>
                                <input required type="number" value={formData.total_marks} onChange={e => setFormData({...formData, total_marks: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-500" />
                            </div>
                        </div>

                        <textarea rows={3} placeholder="Description or Instructions..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-500 resize-none" />

                        <div className="flex gap-2 mt-4">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-500 hover:text-white">Cancel</button>
                            <button type="submit" className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl">Assign</button>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Assignments;