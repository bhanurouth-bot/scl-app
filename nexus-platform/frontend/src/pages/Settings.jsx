import React, { useState, useEffect } from 'react';
import Dock from '../components/Dock';
import GlassCard from '../components/GlassCard';
import { Save, Building, Shield, Award, Trash2, Plus, CheckCircle, Loader } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general'); // general | grading | users
  const [loading, setLoading] = useState(false);
  
  // --- STATE: GENERAL ---
  const [schoolInfo, setSchoolInfo] = useState({
    school_name: '', address: '', contact_email: '', contact_phone: ''
  });

  // --- STATE: GRADING ---
  const [rules, setRules] = useState([]);
  
  // --- STATE: USERS ---
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', first_name: '', is_staff: false });

  // --- FETCH DATA ---
  useEffect(() => {
    fetchSettings();
    if (activeTab === 'grading') fetchRules();
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  const fetchSettings = async () => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch('http://127.0.0.1:8000/api/core/settings/', { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setSchoolInfo(await res.json());
  };

  const fetchRules = async () => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch('http://127.0.0.1:8000/api/exams/rules/', { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setRules(await res.json());
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch('http://127.0.0.1:8000/api/core/users/', { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setUsers(await res.json());
  };

  // --- ACTIONS ---

  const saveGeneral = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('accessToken');
    await fetch('http://127.0.0.1:8000/api/core/settings/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(schoolInfo)
    });
    setLoading(false);
    alert("School Settings Updated!");
  };

  const createUser = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    await fetch('http://127.0.0.1:8000/api/core/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newUser)
    });
    setNewUser({ username: '', password: '', first_name: '', is_staff: false });
    fetchUsers();
  };

  const deleteUser = async (id) => {
    if(!confirm("Remove this user?")) return;
    const token = localStorage.getItem('accessToken');
    await fetch(`http://127.0.0.1:8000/api/core/users/${id}/`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    fetchUsers();
  };

  return (
    <div className="min-h-screen bg-nexus-dark text-white relative selection:bg-blue-500/30">
       <div className="fixed inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2068&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
       <div className="absolute inset-0 bg-nexus-dark/95 backdrop-blur-sm"></div>

       <main className="relative z-10 max-w-5xl mx-auto px-6 py-8 pb-32">
         <h1 className="text-4xl font-bold text-white mb-8">System Configuration</h1>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* SIDEBAR NAVIGATION */}
            <div className="space-y-2">
                <button onClick={() => setActiveTab('general')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'general' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:bg-white/5'}`}>
                    <Building size={18} /> General
                </button>
                <button onClick={() => setActiveTab('grading')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'grading' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:bg-white/5'}`}>
                    <Award size={18} /> Grading Rules
                </button>
                <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'users' ? 'bg-green-600/20 text-green-400 border border-green-500/30' : 'text-slate-400 hover:bg-white/5'}`}>
                    <Shield size={18} /> Access Control
                </button>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="md:col-span-3">
                
                {/* 1. GENERAL TAB */}
                {activeTab === 'general' && (
                    <GlassCard className="p-8">
                        <h2 className="text-xl font-bold mb-6">School Identity</h2>
                        <form onSubmit={saveGeneral} className="space-y-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">School Name</label>
                                <input type="text" value={schoolInfo.school_name} onChange={e => setSchoolInfo({...schoolInfo, school_name: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white"/>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Address</label>
                                <textarea value={schoolInfo.address} onChange={e => setSchoolInfo({...schoolInfo, address: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white h-24"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Email</label>
                                    <input type="text" value={schoolInfo.contact_email} onChange={e => setSchoolInfo({...schoolInfo, contact_email: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white"/>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Phone</label>
                                    <input type="text" value={schoolInfo.contact_phone} onChange={e => setSchoolInfo({...schoolInfo, contact_phone: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white"/>
                                </div>
                            </div>
                            <div className="pt-4">
                                <button disabled={loading} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 font-bold">
                                    {loading ? <Loader className="animate-spin" size={18}/> : <Save size={18}/>} Save Changes
                                </button>
                            </div>
                        </form>
                    </GlassCard>
                )}

                {/* 2. GRADING TAB */}
                {activeTab === 'grading' && (
                    <GlassCard className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Grading Logic</h2>
                            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded border border-purple-500/30">Read Only View</span>
                        </div>
                        <div className="space-y-3">
                            {rules.map(rule => (
                                <div key={rule.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${rule.color_code} bg-white/5`}>
                                            {rule.grade_letter}
                                        </div>
                                        <div>
                                            <div className="font-bold">{rule.label}</div>
                                            <div className="text-xs text-slate-400">{rule.min_score} - {rule.max_score}%</div>
                                        </div>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${rule.color_code.replace('text-', 'bg-')}`}></div>
                                </div>
                            ))}
                        </div>
                        <p className="mt-4 text-xs text-slate-500 text-center">To modify rules, please contact system developer (Admin API Protected).</p>
                    </GlassCard>
                )}

                {/* 3. USERS TAB */}
                {activeTab === 'users' && (
                    <GlassCard className="p-8">
                        <h2 className="text-xl font-bold mb-6">User Management</h2>
                        
                        {/* Create User Form */}
                        <form onSubmit={createUser} className="bg-white/5 p-4 rounded-xl border border-white/10 mb-8 grid grid-cols-2 gap-4">
                            <input type="text" placeholder="Username" required value={newUser.username} onChange={e=>setNewUser({...newUser, username: e.target.value})} className="bg-black/30 border border-white/10 rounded px-3 py-2 text-white"/>
                            <input type="text" placeholder="Full Name" required value={newUser.first_name} onChange={e=>setNewUser({...newUser, first_name: e.target.value})} className="bg-black/30 border border-white/10 rounded px-3 py-2 text-white"/>
                            <input type="password" placeholder="Password" required value={newUser.password} onChange={e=>setNewUser({...newUser, password: e.target.value})} className="bg-black/30 border border-white/10 rounded px-3 py-2 text-white"/>
                            
                            <div className="flex items-center gap-2">
                                <button type="submit" className="flex-1 bg-green-600 hover:bg-green-500 text-white rounded py-2 font-bold flex justify-center items-center gap-2">
                                    <Plus size={16}/> Add User
                                </button>
                            </div>
                        </form>

                        {/* User List */}
                        <div className="space-y-2">
                            {users.map(u => (
                                <div key={u.id} className="flex justify-between items-center p-3 hover:bg-white/5 rounded-lg transition-colors border-b border-white/5 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold">
                                            {u.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">{u.first_name || u.username}</div>
                                            <div className="text-xs text-slate-400">{u.is_staff ? 'Administrator' : 'Staff / Teacher'}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteUser(u.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                )}

            </div>
         </div>
       </main>
       <Dock />
    </div>
  );
};

export default Settings;