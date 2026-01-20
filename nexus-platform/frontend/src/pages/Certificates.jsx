import React, { useState, useEffect } from 'react';
import Dock from '../components/Dock';
import GlassCard from '../components/GlassCard';
import { FileText, Printer, User, Search, QrCode, CreditCard } from 'lucide-react';

const Certificates = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search State
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('accessToken');
    const headers = { 'Authorization': `Bearer ${token}` };
    
    // Fetch Students (re-using the students API)
    const stuRes = await fetch('http://127.0.0.1:8000/api/students/', { headers });
    if(stuRes.ok) setStudents(await stuRes.json());

    // Fetch History
    const histRes = await fetch('http://127.0.0.1:8000/api/certificates/history/', { headers });
    if(histRes.ok) setHistory(await histRes.json());
  };

  const logPrint = async () => {
     if(!selectedStudent) return;
     const token = localStorage.getItem('accessToken');
     await fetch('http://127.0.0.1:8000/api/certificates/issue/', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         body: JSON.stringify({ 
             student: selectedStudent.id, 
             cert_type: 'ID_CARD',
             remarks: 'Generated via Admin Console'
         })
     });
     alert("Sent to Printer! (Logged in System)");
     fetchData();
     // In a real app, here we would trigger window.print()
  };

  const filteredStudents = students.filter(s => 
      s.first_name.toLowerCase().includes(query.toLowerCase()) || 
      s.student_id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-nexus-dark text-white relative selection:bg-cyan-500/30">
       <div className="fixed inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1589330694653-4a8b243e3ad0?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
       <div className="absolute inset-0 bg-nexus-dark/90 backdrop-blur-sm"></div>

       <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 pb-32">
         
         <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white">Print Press</h1>
              <p className="text-slate-400 mt-2">ID Cards & Official Documents</p>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT: STUDENT PICKER */}
            <div className="lg:col-span-4 space-y-4">
                <GlassCard className="p-4 flex items-center gap-2 sticky top-4">
                    <Search className="text-slate-400" size={20}/>
                    <input 
                        type="text" 
                        placeholder="Search Student..." 
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-white w-full placeholder:text-slate-500"
                    />
                </GlassCard>

                <div className="space-y-2 h-[600px] overflow-y-auto custom-scrollbar">
                    {filteredStudents.map(student => (
                        <div 
                            key={student.id} 
                            onClick={() => setSelectedStudent(student)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${selectedStudent?.id === student.id ? 'bg-cyan-900/40 border-cyan-500' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm">
                                    {student.first_name[0]}
                                </div>
                                <div>
                                    <div className="font-bold text-sm">{student.first_name} {student.last_name}</div>
                                    <div className="text-xs text-slate-400">ID: {student.student_id}</div>
                                </div>
                            </div>
                            <div className="text-xs font-mono bg-black/20 px-2 py-1 rounded text-cyan-400">
                                {student.grade}-{student.section}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MIDDLE: LIVE PREVIEW (THE ID CARD) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
                {selectedStudent ? (
                    <div className="space-y-6 animate-fade-in-up">
                        
                        {/* THE ID CARD HTML LAYOUT */}
                        <div className="w-[350px] h-[550px] bg-white rounded-2xl overflow-hidden relative shadow-2xl transform hover:scale-[1.02] transition-transform duration-500 text-slate-900">
                            {/* Card Header */}
                            <div className="h-32 bg-gradient-to-br from-blue-600 to-cyan-500 relative">
                                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-24 h-24 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-lg">
                                    {/* Placeholder Avatar */}
                                    <div className="w-full h-full flex items-center justify-center bg-slate-300 text-slate-500 text-4xl font-bold">
                                        {selectedStudent.first_name[0]}
                                    </div>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="pt-16 pb-8 px-6 text-center">
                                <h2 className="text-2xl font-bold text-slate-800">{selectedStudent.first_name} {selectedStudent.last_name}</h2>
                                <p className="text-blue-600 font-bold uppercase tracking-widest text-xs mt-1">Student</p>
                                
                                <div className="mt-6 space-y-3 text-sm">
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-slate-400">ID No</span>
                                        <span className="font-bold text-slate-700">{selectedStudent.student_id}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-slate-400">Class</span>
                                        <span className="font-bold text-slate-700">{selectedStudent.grade} - {selectedStudent.section}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-slate-400">Roll No</span>
                                        <span className="font-bold text-slate-700">{selectedStudent.roll_number}</span>
                                    </div>
                                </div>

                                {/* Fake QR Code */}
                                <div className="mt-8 flex justify-center">
                                    <div className="p-2 bg-white border border-slate-200 rounded-lg">
                                        <QrCode size={64} className="text-slate-900"/>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2">Scan to verify identity</p>
                            </div>
                            
                            {/* Card Footer */}
                            <div className="bg-slate-50 p-3 text-center text-[10px] text-slate-400 border-t border-slate-100">
                                Nexus High School • Valid until 2026
                            </div>
                        </div>

                        <button onClick={logPrint} className="flex items-center gap-2 px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-full shadow-lg transition-all mx-auto">
                            <Printer size={20}/> Print ID Card
                        </button>
                    </div>
                ) : (
                    <div className="text-center text-slate-500">
                        <CreditCard size={64} className="mx-auto mb-4 opacity-20"/>
                        <p>Select a student to generate ID Card</p>
                    </div>
                )}
            </div>

            {/* RIGHT: HISTORY LOG */}
            <div className="lg:col-span-3">
                <GlassCard className="h-[700px] flex flex-col">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <FileText size={18} className="text-cyan-400"/> Print Logs
                    </h3>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                        {history.map(log => (
                            <div key={log.id} className="p-3 bg-white/5 rounded-lg border border-white/5 text-sm">
                                <div className="font-bold text-white">{log.cert_type.replace('_', ' ')}</div>
                                <div className="text-xs text-slate-300 mt-1">For: {log.student_name}</div>
                                <div className="text-[10px] text-slate-500 mt-2 flex justify-between">
                                    <span>By {log.issuer_name}</span>
                                    <span>{new Date(log.issued_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                        {history.length === 0 && <div className="text-xs text-slate-500 text-center py-4">No documents issued yet.</div>}
                    </div>
                </GlassCard>
            </div>

         </div>

       </main>
       <Dock />
    </div>
  );
};
export default Certificates;