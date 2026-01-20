import React, { useState, useEffect } from 'react';
import Dock from '../components/Dock';
import GlassCard from '../components/GlassCard';
import GlassModal from '../components/GlassModal';

import { Activity, Heart, Thermometer, Plus, AlertCircle, Search, User } from 'lucide-react';

const Infirmary = () => {
  const [visits, setVisits] = useState([]);
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]); // For dropdown
  const [activeTab, setActiveTab] = useState('visits'); // visits | records

  const [isVisitModalOpen, setVisitModalOpen] = useState(false);
  const [newVisit, setNewVisit] = useState({ student: '', symptom: '', diagnosis: '', treatment: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('accessToken');
    const headers = { 'Authorization': `Bearer ${token}` };
    
    const [vRes, rRes, sRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/health/visits/', { headers }),
        fetch('http://127.0.0.1:8000/api/health/records/', { headers }),
        fetch('http://127.0.0.1:8000/api/students/', { headers })
    ]);

    if(vRes.ok) setVisits(await vRes.json());
    if(rRes.ok) setRecords(await rRes.json());
    if(sRes.ok) setStudents(await sRes.json());
  };

  const logVisit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    await fetch('http://127.0.0.1:8000/api/health/visits/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newVisit)
    });
    setVisitModalOpen(false);
    fetchData();
  };

  // Logic to find allergies
  const allergyAlerts = records.filter(r => r.allergies && r.allergies.toLowerCase() !== 'none' && r.allergies.trim() !== '');

  return (
    <div className="min-h-screen bg-nexus-dark text-white relative selection:bg-red-500/30">
       <div className="fixed inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=2128&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
       <div className="absolute inset-0 bg-nexus-dark/90 backdrop-blur-sm"></div>

       <main className="relative z-10 max-w-6xl mx-auto px-6 py-8 pb-32">
         
         <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white">Infirmary</h1>
              <p className="text-slate-400 mt-2">School Health Center</p>
            </div>
            
            <div className="flex gap-4">
                 <div className="bg-white/5 p-1 rounded-xl flex">
                     <button onClick={() => setActiveTab('visits')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'visits' ? 'bg-red-600 text-white' : 'text-slate-400'}`}>Daily Log</button>
                     <button onClick={() => setActiveTab('records')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'records' ? 'bg-red-600 text-white' : 'text-slate-400'}`}>Medical Profiles</button>
                 </div>
                 <button onClick={() => setVisitModalOpen(true)} className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg font-bold">
                    <Plus size={18}/> Log Visit
                 </button>
            </div>
         </div>

         {/* ALERTS ROW */}
         {allergyAlerts.length > 0 && (
             <div className="mb-8 flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                 {allergyAlerts.map(rec => (
                     <div key={rec.id} className="min-w-[250px] bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center gap-3">
                         <div className="bg-red-500/20 p-2 rounded-full text-red-400">
                             <AlertCircle size={20}/>
                         </div>
                         <div>
                             <h4 className="font-bold text-white text-sm">{rec.student_name}</h4>
                             <p className="text-xs text-red-300 font-bold uppercase">{rec.allergies}</p>
                         </div>
                     </div>
                 ))}
             </div>
         )}

         {/* MAIN CONTENT */}
         {activeTab === 'visits' ? (
             <div className="space-y-4">
                 <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                     <Activity className="text-red-400"/> Recent Clinic Visits
                 </h3>
                 {visits.length === 0 && <div className="text-center text-slate-500 py-10">No visits recorded today.</div>}
                 
                 {visits.map(visit => (
                     <GlassCard key={visit.id} className="flex justify-between items-center border-l-4 border-l-red-500">
                         <div className="flex gap-4 items-center">
                             <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm">
                                 {visit.student_name[0]}
                             </div>
                             <div>
                                 <h4 className="font-bold text-white">{visit.student_name} <span className="text-xs text-slate-500 font-normal">({visit.grade})</span></h4>
                                 <p className="text-sm text-red-300 font-medium">{visit.symptom}</p>
                                 <p className="text-xs text-slate-400 mt-1">Rx: {visit.treatment}</p>
                             </div>
                         </div>
                         <div className="text-right text-xs text-slate-500">
                             {new Date(visit.visit_date).toLocaleString()}
                         </div>
                     </GlassCard>
                 ))}
             </div>
         ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {records.map(rec => (
                     <GlassCard key={rec.id} className="relative overflow-hidden">
                         <div className="flex justify-between items-start mb-4">
                             <div>
                                 <h3 className="font-bold text-lg">{rec.student_name}</h3>
                                 <p className="text-xs text-slate-400">Class {rec.grade}</p>
                             </div>
                             <div className="bg-red-900/40 text-red-300 px-2 py-1 rounded text-xs font-bold border border-red-500/30">
                                 {rec.blood_group}
                             </div>
                         </div>
                         <div className="grid grid-cols-2 gap-2 text-sm text-slate-300 mb-4">
                             <div className="bg-white/5 p-2 rounded">Height: {rec.height}cm</div>
                             <div className="bg-white/5 p-2 rounded">Weight: {rec.weight}kg</div>
                         </div>
                         <div className="text-xs text-slate-400 border-t border-white/5 pt-3">
                             Emergency: <span className="text-white">{rec.emergency_contact}</span>
                         </div>
                     </GlassCard>
                 ))}
             </div>
         )}

         {/* LOG VISIT MODAL */}
         <GlassModal isOpen={isVisitModalOpen} onClose={() => setVisitModalOpen(false)} title="Log Clinic Visit">
            <form onSubmit={logVisit} className="space-y-4">
                <select 
                    required 
                    value={newVisit.student} 
                    onChange={e => setNewVisit({...newVisit, student: e.target.value})}
                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white"
                >
                    <option value="">Select Student</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                </select>
                
                <input 
                    type="text" 
                    placeholder="Symptoms (e.g. Headache, Fever)" 
                    required 
                    value={newVisit.symptom} 
                    onChange={e => setNewVisit({...newVisit, symptom: e.target.value})} 
                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white"
                />
                
                <textarea 
                    placeholder="Diagnosis & Treatment Given..." 
                    value={newVisit.treatment} 
                    onChange={e => setNewVisit({...newVisit, treatment: e.target.value})} 
                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white h-24"
                />

                <button className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold shadow-lg">Save Record</button>
            </form>
         </GlassModal>

       </main>
       <Dock />
    </div>
  );
};
export default Infirmary;