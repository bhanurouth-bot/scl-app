import React, { useState, useEffect } from 'react';
import Dock from '../components/Dock';
import GlassCard from '../components/GlassCard';
import GlassModal from '../components/GlassModal';
import CreateEmployeeModal from '../modules/HR/CreateEmployeeModal'; // <--- Imported
import { Briefcase, User, Calendar, DollarSign, CheckCircle, XCircle, Plus, Loader } from 'lucide-react';

const HR = () => {
  const [activeTab, setActiveTab] = useState('staff'); // staff | leaves | payroll
  const [loading, setLoading] = useState(false);
  
  // Data State
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [slips, setSlips] = useState([]);

  // Modal State
  const [isLeaveModalOpen, setLeaveModalOpen] = useState(false);
  const [isEmpModalOpen, setEmpModalOpen] = useState(false); // <--- New Employee Modal State
  
  // Form State
  const [newLeave, setNewLeave] = useState({ start_date: '', end_date: '', reason: '', leave_type: 'CASUAL' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    const token = localStorage.getItem('accessToken');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
        if (activeTab === 'staff') {
            const res = await fetch('http://127.0.0.1:8000/api/hr/employees/', { headers });
            if (res.ok) setEmployees(await res.json());
        }
        if (activeTab === 'leaves') {
            const res = await fetch('http://127.0.0.1:8000/api/hr/leaves/', { headers });
            if (res.ok) setLeaves(await res.json());
        }
        if (activeTab === 'payroll') {
            const res = await fetch('http://127.0.0.1:8000/api/hr/payroll/slips/', { headers });
            if (res.ok) setSlips(await res.json());
        }
    } catch (err) {
        console.error("Failed to fetch HR data", err);
    }
  };

  const applyLeave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    await fetch('http://127.0.0.1:8000/api/hr/leaves/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newLeave)
    });
    setLeaveModalOpen(false); fetchData();
  };

  const updateLeaveStatus = async (id, status) => {
    const token = localStorage.getItem('accessToken');
    await fetch(`http://127.0.0.1:8000/api/hr/leaves/${id}/status/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
    });
    fetchData();
  };

  const runPayroll = async () => {
    setLoading(true);
    const token = localStorage.getItem('accessToken');
    const res = await fetch('http://127.0.0.1:8000/api/hr/payroll/generate/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if(res.ok) {
        alert("Payroll Generated Successfully!");
        fetchData();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-nexus-dark text-white relative selection:bg-blue-500/30">
       <div className="fixed inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2032&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
       <div className="absolute inset-0 bg-nexus-dark/90 backdrop-blur-sm"></div>

       <main className="relative z-10 max-w-6xl mx-auto px-6 py-8 pb-32">
         
         <div className="flex justify-between items-end mb-8">
            <h1 className="text-4xl font-bold text-white">HR & Payroll</h1>
            
            <div className="flex items-center gap-4">
                {/* NEW EMPLOYEE BUTTON (Visible only on Staff Tab) */}
                {activeTab === 'staff' && (
                    <button 
                        onClick={() => setEmpModalOpen(true)} 
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold shadow-lg transition-all"
                    >
                        <Plus size={18} /> Add Employee
                    </button>
                )}

                {/* TABS */}
                <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
                    {['staff', 'leaves', 'payroll'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>
         </div>

         {/* TAB 1: STAFF DIRECTORY */}
         {activeTab === 'staff' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {employees.length === 0 && <div className="col-span-3 text-center text-slate-500 py-10">No employees found. Add one to get started.</div>}
                 
                 {employees.map(emp => (
                     <GlassCard key={emp.id} className="flex items-center gap-4 hover:border-blue-500/50 transition-colors">
                         <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-xl text-white">
                             {emp.name[0]}
                         </div>
                         <div>
                             <h3 className="font-bold text-lg text-white">{emp.name}</h3>
                             <p className="text-xs text-blue-300">{emp.designation}</p>
                             <p className="text-xs text-slate-400">{emp.department} Dept.</p>
                         </div>
                     </GlassCard>
                 ))}
             </div>
         )}

         {/* TAB 2: LEAVE MANAGEMENT */}
         {activeTab === 'leaves' && (
             <div>
                 <div className="flex justify-end mb-6">
                    <button onClick={() => setLeaveModalOpen(true)} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg">
                        <Plus size={18}/> Apply Leave
                    </button>
                 </div>
                 <div className="space-y-4">
                     {leaves.length === 0 && <div className="text-center text-slate-500 py-10">No leave requests found.</div>}
                     
                     {leaves.map(leave => (
                         <GlassCard key={leave.id} className="flex justify-between items-center">
                             <div className="flex gap-4 items-center">
                                 <div className={`p-3 rounded-lg ${leave.leave_type === 'SICK' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                     <Calendar size={20}/>
                                 </div>
                                 <div>
                                     <h3 className="font-bold text-white">{leave.employee_name} <span className="text-xs text-slate-500 font-normal">({leave.leave_type})</span></h3>
                                     <p className="text-sm text-slate-300">{leave.reason}</p>
                                     <p className="text-xs text-slate-500">{leave.start_date} to {leave.end_date}</p>
                                 </div>
                             </div>
                             
                             <div className="flex items-center gap-2">
                                 {leave.status === 'PENDING' ? (
                                     <>
                                        <button onClick={() => updateLeaveStatus(leave.id, 'APPROVED')} className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white rounded-lg transition-colors"><CheckCircle size={18}/></button>
                                        <button onClick={() => updateLeaveStatus(leave.id, 'REJECTED')} className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"><XCircle size={18}/></button>
                                     </>
                                 ) : (
                                     <span className={`px-3 py-1 rounded-full text-xs font-bold border ${leave.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                         {leave.status}
                                     </span>
                                 )}
                             </div>
                         </GlassCard>
                     ))}
                 </div>
             </div>
         )}

         {/* TAB 3: PAYROLL */}
         {activeTab === 'payroll' && (
             <div>
                 <GlassCard className="mb-8 bg-gradient-to-r from-green-900/40 to-emerald-900/40 border-green-500/30 flex justify-between items-center">
                     <div>
                         <h2 className="text-2xl font-bold text-green-100">Payroll Engine</h2>
                         <p className="text-green-300/60 text-sm">Generate salary slips for the current month.</p>
                     </div>
                     <button onClick={runPayroll} disabled={loading} className="px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl shadow-lg flex items-center gap-2">
                        {loading ? <Loader className="animate-spin"/> : <DollarSign size={20}/>} Run Payroll
                     </button>
                 </GlassCard>

                 <div className="space-y-4">
                     {slips.length === 0 && <div className="text-center text-slate-500 py-10">No salary slips generated yet.</div>}

                     {slips.map(slip => (
                         <div key={slip.id} className="p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center">
                             <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white">
                                     $
                                 </div>
                                 <div>
                                     <h3 className="font-bold text-white">{slip.employee_name}</h3>
                                     <p className="text-xs text-slate-400">{slip.designation} • {slip.month}</p>
                                 </div>
                             </div>
                             <div className="text-right">
                                 <div className="font-mono text-xl font-bold text-green-400">${slip.net_salary}</div>
                                 <div className="text-xs text-slate-500">Net Payable</div>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
         )}

         {/* APPLY LEAVE MODAL */}
         <GlassModal isOpen={isLeaveModalOpen} onClose={() => setLeaveModalOpen(false)} title="Request Leave">
            <form onSubmit={applyLeave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-slate-400">Start Date</label>
                        <input type="date" required value={newLeave.start_date} onChange={e=>setNewLeave({...newLeave, start_date: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white mt-1"/>
                    </div>
                    <div>
                        <label className="text-xs text-slate-400">End Date</label>
                        <input type="date" required value={newLeave.end_date} onChange={e=>setNewLeave({...newLeave, end_date: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white mt-1"/>
                    </div>
                </div>
                <select value={newLeave.leave_type} onChange={e=>setNewLeave({...newLeave, leave_type: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white">
                    <option value="CASUAL">Casual Leave</option>
                    <option value="SICK">Sick Leave</option>
                    <option value="UNPAID">Unpaid Leave</option>
                </select>
                <textarea placeholder="Reason for leave..." required value={newLeave.reason} onChange={e=>setNewLeave({...newLeave, reason: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white h-24"/>
                <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold">Submit Request</button>
            </form>
         </GlassModal>

         {/* CREATE EMPLOYEE MODAL */}
         <CreateEmployeeModal 
            isOpen={isEmpModalOpen} 
            onClose={() => setEmpModalOpen(false)} 
            onEmployeeAdded={fetchData} 
         />

       </main>
       <Dock />
    </div>
  );
};

export default HR;