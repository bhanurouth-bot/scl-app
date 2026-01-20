import React, { useState, useEffect } from 'react';
import Dock from '../components/Dock';
import GlassCard from '../components/GlassCard';
import GlassModal from '../components/GlassModal';
import { UserPlus, LogOut, Clock, Shield, Search, User, Phone } from 'lucide-react';

const Visitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [filter, setFilter] = useState('ON_CAMPUS'); // ON_CAMPUS | ALL
  const [isModalOpen, setModalOpen] = useState(false);
  
  const [newVisitor, setNewVisitor] = useState({
      name: '', phone: '', purpose: '', person_to_meet: ''
  });

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch('http://127.0.0.1:8000/api/visitors/', { 
        headers: { 'Authorization': `Bearer ${token}` } 
    });
    if(res.ok) setVisitors(await res.json());
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    await fetch('http://127.0.0.1:8000/api/visitors/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newVisitor)
    });
    setModalOpen(false);
    setNewVisitor({ name: '', phone: '', purpose: '', person_to_meet: '' });
    fetchVisitors();
  };

  const handleCheckOut = async (id) => {
    if(!confirm("Mark this visitor as Checked Out?")) return;
    const token = localStorage.getItem('accessToken');
    await fetch(`http://127.0.0.1:8000/api/visitors/${id}/checkout/`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchVisitors();
  };

  // Filter Logic
  const filteredVisitors = visitors.filter(v => 
      filter === 'ALL' ? true : v.status === filter
  );

  return (
    <div className="min-h-screen bg-nexus-dark text-white relative selection:bg-pink-500/30">
       <div className="fixed inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
       <div className="absolute inset-0 bg-nexus-dark/90 backdrop-blur-sm"></div>

       <main className="relative z-10 max-w-6xl mx-auto px-6 py-8 pb-32">
         
         <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white">Front Desk</h1>
              <p className="text-slate-400 mt-2">Visitor Management & Security</p>
            </div>
            
            <div className="flex gap-4">
                 <div className="bg-white/5 p-1 rounded-xl flex">
                     <button onClick={() => setFilter('ON_CAMPUS')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'ON_CAMPUS' ? 'bg-pink-600 text-white' : 'text-slate-400'}`}>Active Now</button>
                     <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'ALL' ? 'bg-pink-600 text-white' : 'text-slate-400'}`}>History</button>
                 </div>
                 <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-6 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl shadow-lg font-bold">
                    <UserPlus size={18}/> Check In
                 </button>
            </div>
         </div>

         {/* STATS ROW */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <GlassCard className="p-6 flex items-center justify-between border-pink-500/30 bg-pink-900/10">
                 <div>
                     <p className="text-slate-400 text-xs uppercase">Currently on Campus</p>
                     <h3 className="text-3xl font-bold text-white">{visitors.filter(v=>v.status==='ON_CAMPUS').length}</h3>
                 </div>
                 <Shield className="text-pink-400" size={32}/>
             </GlassCard>
             <GlassCard className="p-6 flex items-center justify-between">
                 <div>
                     <p className="text-slate-400 text-xs uppercase">Total Visits Today</p>
                     <h3 className="text-3xl font-bold text-white">
                        {visitors.filter(v => new Date(v.check_in_time).toDateString() === new Date().toDateString()).length}
                     </h3>
                 </div>
                 <Clock className="text-slate-400" size={32}/>
             </GlassCard>
         </div>

         {/* VISITOR LIST */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {filteredVisitors.map(visitor => (
                 <GlassCard key={visitor.id} className={`flex flex-col justify-between ${visitor.status === 'ON_CAMPUS' ? 'border-l-4 border-l-pink-500' : 'opacity-60'}`}>
                     <div>
                         <div className="flex justify-between items-start mb-2">
                             <h3 className="font-bold text-lg text-white">{visitor.name}</h3>
                             {visitor.status === 'ON_CAMPUS' ? (
                                 <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded-full uppercase font-bold animate-pulse">Inside</span>
                             ) : (
                                 <span className="text-[10px] bg-slate-500/20 text-slate-400 px-2 py-1 rounded-full uppercase font-bold">Left</span>
                             )}
                         </div>
                         
                         <div className="space-y-2 text-sm text-slate-300 mt-4">
                             <div className="flex items-center gap-2">
                                 <Phone size={14} className="text-slate-500"/> {visitor.phone}
                             </div>
                             <div className="flex items-center gap-2">
                                 <User size={14} className="text-slate-500"/> Meeting: <span className="text-white font-medium">{visitor.person_to_meet}</span>
                             </div>
                             <div className="p-2 bg-white/5 rounded text-xs italic text-slate-400">
                                 "{visitor.purpose}"
                             </div>
                         </div>
                     </div>

                     <div className="mt-6 flex justify-between items-center border-t border-white/5 pt-4">
                         <div className="text-xs text-slate-500">
                             In: {new Date(visitor.check_in_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                             {visitor.check_out_time && ` • Out: ${new Date(visitor.check_out_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                         </div>
                         
                         {visitor.status === 'ON_CAMPUS' && (
                             <button 
                                onClick={() => handleCheckOut(visitor.id)}
                                className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded text-xs font-bold transition-all"
                             >
                                 <LogOut size={14}/> Check Out
                             </button>
                         )}
                     </div>
                 </GlassCard>
             ))}
             {filteredVisitors.length === 0 && <div className="col-span-3 text-center text-slate-500 py-10">No visitors found.</div>}
         </div>

         {/* CHECK-IN MODAL */}
         <GlassModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Visitor Check-In">
            <form onSubmit={handleCheckIn} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Full Name" required value={newVisitor.name} onChange={e=>setNewVisitor({...newVisitor, name: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white"/>
                    <input type="text" placeholder="Phone Number" required value={newVisitor.phone} onChange={e=>setNewVisitor({...newVisitor, phone: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white"/>
                </div>
                <input type="text" placeholder="Who are they meeting? (e.g. Principal)" required value={newVisitor.person_to_meet} onChange={e=>setNewVisitor({...newVisitor, person_to_meet: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white"/>
                <textarea placeholder="Purpose of Visit..." required value={newVisitor.purpose} onChange={e=>setNewVisitor({...newVisitor, purpose: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white h-24"/>
                <button className="w-full py-3 bg-pink-600 hover:bg-pink-500 rounded-xl font-bold shadow-lg">Print Gate Pass & Log</button>
            </form>
         </GlassModal>

       </main>
       <Dock />
    </div>
  );
};
export default Visitors;