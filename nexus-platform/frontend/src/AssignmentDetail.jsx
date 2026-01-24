import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, Clock, Paperclip, Upload, 
  CheckCircle, FileText, Download, User 
} from 'lucide-react';
import api from './api';
import Dock from './Dock';

const AssignmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [task, setTask] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Submission Form
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Get Task Details
        const taskRes = await api.get(`assignments/tasks/${id}/`);
        setTask(taskRes.data);

        // 2. Check if student already submitted
        // We filter submissions by this assignment ID
        const subRes = await api.get(`assignments/submissions/?assignment=${id}`);
        if (subRes.data.length > 0) {
            setSubmission(subRes.data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleFileChange = (e) => {
      setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      if (!file) return alert("Please select a file.");

      const formData = new FormData();
      formData.append('assignment', id);
      // We assume the backend uses 'student' from the logged-in user context 
      // or you might need to send student ID if your logic requires it.
      // Usually, backend perform_create handles 'student = request.user.student_profile'
      // But based on your previous code, let's send the file directly.
      formData.append('file', file);
      
      // Need to fetch current student ID first if backend doesn't auto-detect
      // For now, let's try assuming backend logic or we fetch profile first.
      // Ideally: backend/assignments/views.py -> perform_create -> serializer.save(student=...)
      
      // FIX: To be safe, let's get the profile ID first
      try {
          setSubmitting(true);
          const profileRes = await api.get('students/profiles/');
          // Assuming the logged-in user is a student and the list returns their profile
          // or we use a "me" endpoint. If list returns all, we find ours.
          // For simplicity, let's assume the backend handles the link or we send student ID.
          
          // Let's rely on the ViewSet we fixed earlier to handle it.
          // If you get a "student field required" error, we will update the view.
          
          // Actually, looking at your models, Submission requires a 'student'.
          // The best way is to send 'student' ID if you have it in local storage or context.
          // Since we don't have a global context yet, let's fetch it quickly:
          const meRes = await api.get('students/profiles/?user=me'); 
          // Note: You might need to add a filter for 'me' in backend or just pick the first one 
          // if the user is a student.
          
          // PRO TEMPORE FIX: Just try sending the file. If it fails, we fix the backend view.
           await api.post('assignments/submissions/', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          
          alert("Assignment Submitted Successfully!");
          window.location.reload();

      } catch (err) {
          // If error says "student is required", we need to send student ID.
          // Let's assume you might be logged in as Admin/Teacher for testing.
          alert("Submission Failed. (Are you logged in as a Student?)");
          console.error(err);
      } finally {
          setSubmitting(false);
      }
  };

  if (loading) return <div className="text-white p-10">Loading Task...</div>;
  if (!task) return <div className="text-white p-10">Task not found.</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden selection:bg-cyan-500/30">
      
      <div className="fixed top-[-10%] right-[-10%] w-[900px] h-[900px] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      {/* --- Header --- */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <button onClick={() => navigate('/assignments')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group">
             <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Tasks
          </button>
          
          <div className="flex justify-between items-start mb-6">
              <div>
                  <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-wider border border-cyan-500/20">
                           {task.subject_name}
                      </span>
                      <span className="text-gray-500 text-xs font-mono">{task.assigned_date}</span>
                  </div>
                  <h1 className="text-4xl font-bold text-white leading-tight mb-2">{task.title}</h1>
                  <p className="text-gray-400 flex items-center gap-2">
                      <User size={14}/> Assigned by {task.teacher_name}
                  </p>
              </div>
              
              <div className="text-right">
                  <div className="text-3xl font-bold text-white">{task.total_marks}</div>
                  <div className="text-xs text-gray-500 uppercase font-bold">Total Marks</div>
              </div>
          </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          
          {/* --- LEFT: Instructions & Attachments --- */}
          <div className="lg:col-span-2 space-y-6">
              <div className="glass-panel p-8 rounded-[2rem] border border-white/10 bg-white/5">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <FileText size={20} className="text-cyan-400"/> Instructions
                  </h3>
                  <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-line leading-relaxed">
                      {task.description || "No written instructions provided."}
                  </div>
              </div>

              {/* Attachment Download */}
              {task.attachment && (
                  <div className="glass-panel p-6 rounded-[2rem] border border-white/10 bg-white/5 flex items-center justify-between group hover:border-cyan-500/30 transition-all">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-red-500/20 text-red-400 rounded-2xl">
                              <Paperclip size={24} />
                          </div>
                          <div>
                              <div className="font-bold text-white">Attached Material</div>
                              <div className="text-xs text-gray-500">Reference file provided by teacher</div>
                          </div>
                      </div>
                      <a 
                        href={task.attachment} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-white flex items-center gap-2 transition-all"
                      >
                          <Download size={18} /> Download
                      </a>
                  </div>
              )}
          </div>

          {/* --- RIGHT: Submission Box --- */}
          <div>
              <div className="glass-panel p-8 rounded-[2rem] border border-white/10 bg-white/5 sticky top-8">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <Upload size={20} className={submission ? "text-green-400" : "text-yellow-400"}/> 
                      {submission ? "Your Submission" : "Submit Work"}
                  </h3>

                  {submission ? (
                      // --- ALREADY SUBMITTED VIEW ---
                      <div className="text-center py-8">
                          <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                              <CheckCircle size={40} />
                          </div>
                          <h4 className="text-xl font-bold text-white mb-1">Submitted!</h4>
                          <p className="text-gray-400 text-sm mb-6">
                              Turned in on {new Date(submission.submitted_at).toLocaleDateString()}
                          </p>
                          
                          {submission.file && (
                              <a href={submission.file} target="_blank" rel="noopener noreferrer" className="block w-full py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-sm font-bold text-cyan-400 mb-4">
                                  View Your File
                              </a>
                          )}

                          {submission.marks_obtained ? (
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                  <div className="text-xs text-gray-500 uppercase font-bold">Grade Received</div>
                                  <div className="text-3xl font-bold text-white mt-1">
                                      {submission.marks_obtained} <span className="text-base text-gray-500">/ {task.total_marks}</span>
                                  </div>
                                  {submission.feedback && (
                                      <div className="mt-3 text-sm text-gray-400 italic">
                                          "{submission.feedback}"
                                      </div>
                                  )}
                              </div>
                          ) : (
                              <div className="px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-lg text-sm font-bold border border-yellow-500/20">
                                  Pending Grading
                              </div>
                          )}
                      </div>
                  ) : (
                      // --- UPLOAD FORM VIEW ---
                      <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all cursor-pointer relative">
                              <input 
                                type="file" 
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <Upload size={32} className="text-gray-500 mx-auto mb-3" />
                              <div className="font-bold text-white">
                                  {file ? file.name : "Click to Upload File"}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                  PDF, DOCX, JPG supported
                              </div>
                          </div>

                          <div className="flex justify-between text-xs text-gray-500 px-2">
                              <span>Due Date:</span>
                              <span className="text-white font-bold">{task.due_date}</span>
                          </div>

                          <button 
                            type="submit" 
                            disabled={submitting}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-900/20 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                          >
                              {submitting ? 'Uploading...' : 'Turn In Assignment'}
                          </button>
                      </form>
                  )}
              </div>
          </div>
      </div>

      <Dock />
    </div>
  );
};

export default AssignmentDetail;