import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, AlertCircle, Clock, CalendarCheck, BookOpen, Bell, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // <--- Import Recharts
import api from './api';
import Dock from './Dock';
import { Skeleton } from './components/GlassUI';

// Reusable "Live Tile" Component
const StatCard = ({ title, value, subtitle, icon: Icon, color, delay, loading }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-panel p-6 rounded-[2rem] relative overflow-hidden group hover:bg-white/5 transition-all duration-300 border border-white/10 hover:border-white/20"
  >
    <div className={`absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500 blur-2xl ${color} w-32 h-32 rounded-full`}></div>
    <div className="relative z-10">
      <div className={`p-3 rounded-2xl w-fit mb-4 ${color} bg-opacity-20 border border-white/5`}>
        <Icon size={24} className="text-white" />
      </div>
      <h3 className="text-gray-400 text-sm font-medium mb-1 tracking-wide">{title}</h3>
      {loading ? (
        <Skeleton className="h-10 w-24 mb-2 bg-white/10" />
      ) : (
        <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">{value}</h2>
      )}
      <p className="text-xs text-gray-500 font-medium group-hover:text-gray-300 transition-colors">{subtitle}</p>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [studentCount, setStudentCount] = useState(0);
  const [financeStats, setFinanceStats] = useState({ total_revenue: 0, collected: 0, pending: 0 });
  const [notices, setNotices] = useState([]);
  const [examData, setExamData] = useState([]); // <--- New State for Chart
  
  const fmt = (amt) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amt || 0);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [stuRes, finRes, noticeRes, chartRes] = await Promise.all([
          api.get('students/profiles/'),      
          api.get('finance/invoices/stats/'), 
          api.get('notices/posts/'),
          api.get('results/exams/analytics/').catch(() => ({ data: [] })) // <--- Fetch Analytics
        ]);

        setStudentCount(stuRes.data.length);
        setFinanceStats(finRes.data);
        setNotices(noticeRes.data.slice(0, 3)); 
        setExamData(chartRes.data);

      } catch (err) {
        console.error("Dashboard Sync Failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden selection:bg-blue-500/30">
      
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-black to-black -z-10"></div>
      <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-12 flex justify-between items-end relative z-10"
      >
        <div>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 mb-2 tracking-tight">Command Center</h1>
          <p className="text-gray-400 text-lg">Nexus Institute Overview</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-gray-500 text-sm uppercase tracking-widest font-bold">Current Session</p>
          <p className="text-white text-xl font-mono">2025-2026</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10">
        <StatCard title="Total Students" value={studentCount} loading={loading} subtitle="Active Enrollments" icon={Users} color="bg-blue-500" delay={0.1} />
        <StatCard title="Total Revenue" value={fmt(financeStats.total_revenue)} loading={loading} subtitle={`Collected: ${fmt(financeStats.collected)}`} icon={TrendingUp} color="bg-emerald-500" delay={0.2} />
        <StatCard title="Pending Dues" value={fmt(financeStats.pending)} loading={loading} subtitle="Outstanding Fees" icon={AlertCircle} color="bg-rose-500" delay={0.3} />
        <StatCard title="Avg Attendance" value="94%" loading={false} subtitle="Daily Average" icon={Clock} color="bg-violet-500" delay={0.4} />
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        
        {/* --- PERFORMANCE CHART (Replaced Placeholder) --- */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-panel p-8 rounded-[2rem] lg:col-span-2 min-h-[400px] border border-white/10 flex flex-col justify-between"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="text-blue-400" /> Academic Performance
            </h3>
            <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full text-gray-400">Exam Averages</span>
          </div>
          
          <div className="h-72 w-full">
            {loading ? (
                <Skeleton className="w-full h-full rounded-2xl bg-white/5" />
            ) : examData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={examData}>
                    <defs>
                        <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis 
                        dataKey="name" 
                        stroke="#6b7280" 
                        tick={{fill: '#9ca3af', fontSize: 12}} 
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis 
                        stroke="#6b7280" 
                        tick={{fill: '#9ca3af', fontSize: 12}} 
                        axisLine={false}
                        tickLine={false}
                        domain={[0, 100]}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="average" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorAvg)" 
                    />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                    <Activity size={32} />
                    <p>No exam data available yet.</p>
                </div>
            )}
          </div>
        </motion.div>

        {/* Live Notices Feed */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="glass-panel p-8 rounded-[2rem] border border-white/10 bg-white/5"
        >
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Bell className="text-yellow-400" /> Notice Board
             </h3>
          </div>

          <div className="space-y-4">
            {loading ? (
                [...Array(3)].map((_, i) => (
                    <div key={i} className="p-5 rounded-[1.5rem] bg-black/20 border border-white/5">
                        <Skeleton className="h-3 w-20 mb-3 bg-white/10" />
                        <Skeleton className="h-5 w-3/4 mb-2 bg-white/10" />
                    </div>
                ))
            ) : notices.length === 0 ? (
                <div className="text-gray-500 text-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/10">No active notices.</div>
            ) : (
                notices.map((notice) => (
                  <div key={notice.id} className="p-5 rounded-[1.5rem] bg-black/20 hover:bg-white/5 transition-all cursor-pointer border border-white/5 group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2 relative z-10">
                      <div className="flex items-center gap-2">
                        <CalendarCheck size={14} className="text-blue-400" />
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{notice.category}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">{new Date(notice.created_at).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-bold text-white mb-1 group-hover:text-blue-200 transition-colors relative z-10">{notice.title}</h4>
                    <p className="text-xs text-gray-400 line-clamp-2 relative z-10">{notice.content}</p>
                  </div>
                ))
            )}
          </div>
        </motion.div>
      </div>

      <Dock />
    </div>
  );
};

export default Dashboard;