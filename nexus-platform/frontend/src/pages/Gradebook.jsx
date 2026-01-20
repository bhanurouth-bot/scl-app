import React, { useState, useEffect } from 'react';
import Dock from '../components/Dock';
import GlassCard from '../components/GlassCard';
import CreateExamModal from '../modules/Exams/CreateExamModal';
import { Save, Search, CheckCircle, Loader, Filter, Plus, Settings } from 'lucide-react';

const Gradebook = () => {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [gradeRules, setGradeRules] = useState([]); // <--- New State

  const [isExamModalOpen, setExamModalOpen] = useState(false);

  // Selection
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterSection, setFilterSection] = useState('');

  // Grades State: { studentId: { theory: '', practical: '' } }
  const [grades, setGrades] = useState({});
  
  // Current Subject Config
  const [subjectConfig, setSubjectConfig] = useState(null);

  useEffect(() => {
    fetchResources();
  }, []);

  // When subject changes, capture its config (Theory/Practical Max)
  useEffect(() => {
    if (selectedSubject) {
      const sub = subjects.find(s => s.id == selectedSubject);
      setSubjectConfig(sub);
    }
  }, [selectedSubject, subjects]);

  const fetchResources = async () => {
    const token = localStorage.getItem('accessToken');
    const headers = { 'Authorization': `Bearer ${token}` };

    const [exRes, subRes, ruleRes] = await Promise.all([
      fetch('http://127.0.0.1:8000/api/exams/', { headers }),
      fetch('http://127.0.0.1:8000/api/academics/subjects/', { headers }),
      fetch('http://127.0.0.1:8000/api/exams/rules/', { headers }) // <--- Fetch Rules
    ]);

    setExams(await exRes.json());
    setSubjects(await subRes.json());
    setGradeRules(await ruleRes.json());
  };

  const loadClassList = async () => {
    if (!filterGrade || !filterSection) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://127.0.0.1:8000/api/students/', { headers: { 'Authorization': `Bearer ${token}` } });
      const allStudents = await res.json();
      const filtered = allStudents.filter(s => s.grade === filterGrade && s.section.toUpperCase() === filterSection.toUpperCase());
      setStudents(filtered);
      
      // Initialize split grades
      const initialGrades = {};
      filtered.forEach(s => {
        initialGrades[s.id] = { theory: '', practical: '' };
      });
      setGrades(initialGrades);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (studentId, type, value) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [type]: value }
    }));
  };

  const saveGrades = async () => {
    setLoading(true);
    const payload = {
        exam_id: selectedExam,
        subject_id: selectedSubject,
        grades: Object.entries(grades).map(([id, scores]) => ({
            student_id: id,
            theory: scores.theory || 0,
            practical: scores.practical || 0
        }))
    };

    try {
        const token = localStorage.getItem('accessToken');
        await fetch('http://127.0.0.1:8000/api/exams/bulk-entry/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
        });
        alert("Grades Saved!");
        setStudents([]); 
    } catch (err) {
        alert("Save Failed");
    } finally {
        setLoading(false);
    }
  };

  // DYNAMIC CALCULATOR
  const calculateResult = (theory, practical) => {
    const t = parseFloat(theory) || 0;
    const p = parseFloat(practical) || 0;
    const total = t + p;
    
    // Check Pass/Fail based on Subject Config
    if (subjectConfig) {
       const failTheory = t < subjectConfig.pass_theory_marks;
       const failPractical = subjectConfig.total_practical_marks > 0 && p < subjectConfig.pass_practical_marks;
       
       if (failTheory || failPractical) {
          return { grade: 'F', color: 'text-red-400 bg-red-500/10', label: 'Fail' };
       }
    }

    // Find Grade Rule
    const rule = gradeRules.find(r => total >= r.min_score && total <= r.max_score);
    if (rule) return { grade: rule.grade_letter, color: rule.color_code + ' bg-white/5', label: rule.label };
    
    return { grade: '-', color: 'text-slate-500', label: 'Pending' };
  };

  return (
    <div className="min-h-screen bg-nexus-dark text-white relative selection:bg-blue-500/30">
       <div className="fixed inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
       <div className="absolute inset-0 bg-nexus-dark/90 backdrop-blur-sm"></div>

       <main className="relative z-10 max-w-6xl mx-auto px-6 py-8 pb-32">
         
         <div className="flex justify-between items-end mb-8">
            <h1 className="text-4xl font-bold text-white">Smart Gradebook</h1>
            <button onClick={() => setExamModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg transition-all font-medium">
                <Plus size={20} /> New Exam
            </button>
         </div>

         {/* CONTROL PANEL */}
         <GlassCard className="p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-1">
                    <label className="text-xs text-slate-400 ml-1">Examination</label>
                    <select value={selectedExam} onChange={e => setSelectedExam(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg py-2 px-3 text-white">
                        <option value="">-- Select Exam --</option>
                        {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-400 ml-1">Subject</label>
                    <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg py-2 px-3 text-white">
                        <option value="">-- Select Subject --</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                    </select>
                </div>
                <div className="flex gap-2">
                    <input type="text" placeholder="Grade (10)" value={filterGrade} onChange={e => setFilterGrade(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg py-2 px-3 text-white text-center"/>
                    <input type="text" placeholder="Sec (A)" value={filterSection} onChange={e => setFilterSection(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg py-2 px-3 text-white text-center"/>
                </div>
                <button onClick={loadClassList} className="h-[42px] bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all">
                    <Search size={18} /> Load Class
                </button>
            </div>
         </GlassCard>

         {/* GRADING GRID */}
         {students.length > 0 && subjectConfig && (
            <GlassCard className="p-0 overflow-hidden">
                <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                    <div className="text-sm text-slate-300">
                        {subjectConfig.total_practical_marks > 0 ? "Theory + Practical Mode" : "Theory Only Mode"}
                    </div>
                    <button onClick={saveGrades} disabled={loading} className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-lg flex items-center gap-2">
                        {loading ? <Loader className="animate-spin" size={18} /> : <><Save size={18} /> Save All Grades</>}
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white/5 text-xs uppercase text-slate-400">
                            <tr>
                                <th className="p-4">Student</th>
                                <th className="p-4 w-32">Theory <span className="text-[10px] opacity-50">/ {subjectConfig.total_theory_marks}</span></th>
                                {subjectConfig.total_practical_marks > 0 && (
                                    <th className="p-4 w-32">Practical <span className="text-[10px] opacity-50">/ {subjectConfig.total_practical_marks}</span></th>
                                )}
                                <th className="p-4 text-center">Total</th>
                                <th className="p-4 text-center">Grade</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {students.map(student => {
                                const g = grades[student.id] || { theory: '', practical: '' };
                                const result = calculateResult(g.theory, g.practical);
                                const total = (parseFloat(g.theory)||0) + (parseFloat(g.practical)||0);

                                return (
                                    <tr key={student.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-medium text-white">{student.first_name} {student.last_name}</td>
                                        
                                        {/* THEORY INPUT */}
                                        <td className="p-4">
                                            <input 
                                                type="number" 
                                                value={g.theory}
                                                onChange={(e) => handleGradeChange(student.id, 'theory', e.target.value)}
                                                className="w-full bg-black/40 border border-white/20 rounded-lg py-2 px-2 text-white font-mono text-center focus:border-blue-500 focus:outline-none"
                                                placeholder="-"
                                            />
                                        </td>

                                        {/* PRACTICAL INPUT (Conditional) */}
                                        {subjectConfig.total_practical_marks > 0 && (
                                            <td className="p-4">
                                                <input 
                                                    type="number" 
                                                    value={g.practical}
                                                    onChange={(e) => handleGradeChange(student.id, 'practical', e.target.value)}
                                                    className="w-full bg-black/40 border border-white/20 rounded-lg py-2 px-2 text-white font-mono text-center focus:border-blue-500 focus:outline-none"
                                                    placeholder="-"
                                                />
                                            </td>
                                        )}

                                        {/* RESULTS */}
                                        <td className="p-4 text-center font-mono font-bold text-lg">{total > 0 ? total : '-'}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 rounded text-xs font-bold ${result.color} border border-current`}>
                                                {result.grade}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
         )}

         <CreateExamModal isOpen={isExamModalOpen} onClose={() => setExamModalOpen(false)} onExamCreated={fetchResources} />

       </main>
       <Dock />
    </div>
  );
};

export default Gradebook;