import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dock from '../components/Dock';
import GlassCard from '../components/GlassCard';
import FeeCollectionModal from '../modules/Finance/FeeCollectionModal';
import { Users, DollarSign, TrendingUp, Clock, ArrowRight, Bell, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isFeeModalOpen, setFeeModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // --- STATE MANAGEMENT ---
  const [stats, setStats] = useState({
    total_students: 0,
    total_revenue: 0,
    recent_admissions: [],
    recent_activity: []
  });

  const [liveClasses, setLiveClasses] = useState([]);
  const [latestNotice, setLatestNotice] = useState(null);

  // --- DATA FETCHING ---
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      // If no token, kick to login immediately
      if (!token) {
        navigate('/login');
        return;
      }

      const headers = { 'Authorization': `Bearer ${token}` };

      // --- HELPER: SAFE FETCH (Handles 401 Unauthorized) ---
      const safeFetch = async (url) => {
        try {
            const res = await fetch(url, { headers });
            if (res.status === 401) {
                // Token Expired: Log out and redirect
                console.warn("Session expired. Redirecting to login...");
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                navigate('/login');
                return null;
            }
            return res.ok ? await res.json() : null;
        } catch (error) {
            console.error(`Error fetching ${url}:`, error);
            return null;
        }
      };

      // 1. Fetch Finance & Student Stats
      const statsData = await safeFetch('http://127.0.0.1:8000/api/finance/stats/');
      if (statsData) setStats(statsData);

      // 2. Fetch Live Classes (Academics)
      const liveData = await safeFetch('http://127.0.0.1:8000/api/academics/live/');
      if (liveData) setLiveClasses(liveData);

      // 3. Fetch Pinned Notice (Notices)
      const noticesData = await safeFetch('http://127.0.0.1:8000/api/notices/');
      if (noticesData && noticesData.length > 0) {
          // Find the first pinned notice, or just the latest one if none pinned
          const pinned = noticesData.find(n => n.is_pinned) || noticesData[0];
          setLatestNotice(pinned);
      }

    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  // --- HELPERS ---
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const timeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return "Just now";
  };

  return (
    <div className="min-h-screen bg-nexus-dark text-white selection:bg-blue-500/30 overflow-hidden relative">
      
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-60"></div>
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-nexus-dark/50 to-nexus-dark"></div>
      </div>

      <header className="relative z-10 p-8 flex justify-between items-center max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Nexus OS
          </h1>
          <p className="text-blue-200/60 text-sm font-mono tracking-widest uppercase">
            Institute Control Center
          </p>
        </div>
        
        {/* User Profile */}
        <div className="flex items-center gap-3">
           <div className="text-right hidden sm:block">
             <div className="text-sm font-bold">Admin User</div>
             <div className="text-xs text-green-400">● Online</div>
           </div>
           <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border-2 border-white/20 shadow-lg"></div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-6 h-auto md:h-[700px]">
          
          {/* Tile 1: TOTAL STUDENTS */}
          <GlassCard className="col-span-1 md:col-span-2 row-span-2 flex flex-col justify-between p-8 bg-gradient-to-br from-blue-600/20 to-purple-600/20 hover:border-blue-500/30 transition-all duration-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 font-medium mb-1">Total Active Students</p>
                <h2 className="text-6xl font-bold text-white tracking-tight">
                  {loading ? '...' : stats.total_students}
                </h2>
              </div>
              <div className="p-3 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/40">
                <Users className="text-white" size={32} />
              </div>
            </div>
            <div className="flex gap-2 items-end h-24 mt-4 opacity-80">
               {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
                 <div key={i} style={{height: `${h}%`}} className="flex-1 bg-white/20 rounded-t-sm hover:bg-blue-400 transition-colors"></div>
               ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-green-400 text-sm font-medium bg-green-400/10 w-fit px-3 py-1 rounded-full border border-green-400/20">
              <TrendingUp size={14} /> Database Active
            </div>
          </GlassCard>

          {/* Tile 2: TOTAL REVENUE */}
          <GlassCard 
            onClick={() => setFeeModalOpen(true)} 
            className="col-span-1 p-6 flex flex-col justify-between gap-4 hover:bg-white/10 cursor-pointer group hover:scale-[1.02] transition-all bg-gradient-to-br from-orange-500/10 to-transparent"
          >
            <div className="flex justify-between items-start">
               <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                 <DollarSign size={20} />
               </div>
               <span className="text-xs text-orange-300 font-medium">+ Collect</span>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {loading ? '...' : formatMoney(stats.total_revenue)}
              </h3>
            </div>
          </GlassCard>

          {/* Tile 3: LIVE CLASSES FEED */}
          <GlassCard className="col-span-1 p-0 relative overflow-hidden group flex flex-col">
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-red-500/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <h3 className="text-sm font-bold text-red-200 tracking-wider">LIVE NOW</h3>
              </div>
              <Clock size={16} className="text-red-400" />
            </div>

            <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
              {liveClasses.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center">
                  <div className="mb-2 opacity-50"><Clock size={32} /></div>
                  <p className="text-xs">No classes in session.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {liveClasses.map((session) => (
                    <div key={session.id} className="relative">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-white font-bold text-sm truncate w-24">
                          {session.subject_name}
                        </span>
                        <span className="text-xs font-mono text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded border border-green-400/20">
                          {session.room_name}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mb-1">
                        with {session.teacher_name}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest">
                        Class {session.grade}-{session.section}
                      </div>
                      <div className="mt-2 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500/50 w-1/2 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>

          {/* Tile 4: Recent Admissions */}
          <GlassCard className="col-span-1 md:col-span-2 row-span-1 p-0 overflow-hidden">
             <div className="p-5 border-b border-white/10 flex justify-between items-center">
               <h3 className="font-semibold">Recent Admissions</h3>
               <button 
                 onClick={() => navigate('/students')}
                 className="text-xs text-blue-300 hover:text-white transition-colors flex items-center gap-1"
               >
                 View All <ArrowRight size={12}/>
               </button>
             </div>
             <div className="p-2 space-y-1">
               {stats.recent_admissions.length === 0 ? (
                 <div className="p-4 text-center text-slate-500 text-sm">No recent admissions.</div>
               ) : (
                 stats.recent_admissions.map((student) => (
                   <div key={student.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer group">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-600 to-slate-500 flex items-center justify-center text-xs font-bold">
                          {student.first_name[0]}
                       </div>
                       <div>
                         <div className="text-sm font-medium text-white">{student.first_name} {student.last_name}</div>
                         <div className="text-xs text-slate-400">Class {student.grade}-{student.section}</div>
                       </div>
                     </div>
                     <div className="text-xs text-slate-500 group-hover:text-white">
                        {timeAgo(student.created_at)}
                     </div>
                   </div>
                 ))
               )}
             </div>
          </GlassCard>

          {/* Tile 5: CAMPUS ALERTS (Dynamic Notices) */}
          <GlassCard className={`col-span-1 md:col-span-2 p-6 flex flex-col justify-center relative overflow-hidden transition-all duration-500
              ${latestNotice?.category === 'URGENT' ? 'bg-red-900/40 border-red-500/30' : 
                latestNotice?.category === 'WARNING' ? 'bg-orange-900/40 border-orange-500/30' : 
                latestNotice?.category === 'SUCCESS' ? 'bg-green-900/40 border-green-500/30' :
                'bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border-emerald-500/30'}`}>
              
              {latestNotice ? (
                  <>
                      <div className="flex justify-between items-start z-10">
                          <div className="flex items-center gap-2 mb-2">
                              {latestNotice.category === 'URGENT' ? <AlertCircle className="text-red-400" /> : <Bell className="text-emerald-400" />}
                              <h3 className="text-lg font-bold text-white">{latestNotice.title}</h3>
                          </div>
                          <span className="text-[10px] uppercase tracking-widest opacity-60 bg-black/20 px-2 py-1 rounded">
                              {new Date(latestNotice.created_at).toLocaleDateString()}
                          </span>
                      </div>
                      <p className="text-slate-300 text-sm z-10 line-clamp-2">{latestNotice.message}</p>
                  </>
              ) : (
                  <div className="flex items-center gap-3 opacity-50">
                      <Bell /> <span>No new announcements</span>
                  </div>
              )}
          </GlassCard>

        </div>
      </main>

      <Dock />

      <FeeCollectionModal 
        isOpen={isFeeModalOpen} 
        onClose={() => {
          setFeeModalOpen(false);
          fetchDashboardData();
        }} 
      />

    </div>
  );
};

export default Dashboard;