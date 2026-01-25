import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, AlertCircle, Clock, CalendarCheck, BookOpen, Bell, Activity } from 'lucide-react';
import api from './api';

const Dashboard = () => {
  // 1. Initialize state as NULL to detect "loading" vs "empty"
  const [stats, setStats] = useState(null);
  const [notices, setNotices] = useState([]);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2. Fetch Data on Mount
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        // Fetch all required data in parallel
        // Note: Ensure these endpoints exist in your Django backend!
        // We use try/catch inside Promise.allSettled or individual catches if endpoints might fail separately.
        // For now, simple parallel fetch:
        
        const [statsRes, noticesRes, attendanceRes] = await Promise.all([
          api.get('core/stats/').catch(err => ({ data: { total_students: 0, total_staff: 0, pending_fees: 0 } })), 
          api.get('notices/').catch(err => ({ data: [] })),
          api.get('attendance/stats/').catch(err => ({ data: { percentage: 0, present_today: 0 } }))
        ]);

        setStats(statsRes.data);
        setNotices(noticesRes.data);
        setAttendanceData(attendanceRes.data);

      } catch (error) {
        console.error("Dashboard Data Load Failed:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  // 3. Loading Skeleton (Prevents Crash / Blank Screen)
  if (loading || !stats) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-8 bg-white/10 w-1/4 rounded mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-white/5 rounded-2xl border border-white/10"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="h-64 bg-white/5 rounded-2xl lg:col-span-2"></div>
          <div className="h-64 bg-white/5 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // 4. Safe Data Access (using Optional Chaining ?. and fallbacks ||)
  const statCards = [
    { 
      title: 'Total Students', 
      value: stats?.total_students || '0', 
      icon: Users, 
      color: 'text-blue-400', 
      trend: '+12%',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    },
    { 
      title: 'Attendance', 
      value: `${attendanceData?.percentage || 0}%`, 
      icon: CalendarCheck, 
      color: 'text-emerald-400', 
      trend: '+5%',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    },
    { 
      title: 'Total Staff', 
      value: stats?.total_staff || '0', 
      icon: Briefcase, // Ensure Briefcase is imported or swap icon
      color: 'text-purple-400', 
      trend: 'Active',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20'
    },
    { 
      title: 'Pending Fees', 
      value: `$${stats?.pending_fees || '0'}`, 
      icon: AlertCircle, 
      color: 'text-amber-400', 
      trend: '-8%',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20'
    },
  ];

  return (
    <div className="p-8 space-y-8 pb-24">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-gray-400">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex gap-4">
          <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2 text-sm text-gray-300">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`glass-panel p-6 rounded-2xl border ${stat.border} relative overflow-hidden group hover:bg-white/5 transition-all duration-300`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-full blur-2xl -mr-16 -mt-16 transition-all duration-500 group-hover:blur-3xl opacity-50`}></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} border ${stat.border}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg border border-emerald-400/20">
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Activity / Performance Chart Area */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Recent Activity
            </h2>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500 border-2 border-dashed border-white/10 rounded-xl bg-black/20">
            Chart Component Placeholder
          </div>
        </div>

        {/* Notices / Side Panel */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-400" />
              Notice Board
            </h2>
          </div>
          
          <div className="space-y-4">
            {notices.length > 0 ? (
              notices.slice(0, 3).map((notice, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">
                      {notice.category || 'General'}
                    </span>
                    <span className="text-xs text-gray-500">{new Date(notice.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-sm font-medium text-white mb-1 line-clamp-1">{notice.title}</h4>
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {notice.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No recent notices
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Needed for the 'Briefcase' icon reference in statCards
import { Briefcase } from 'lucide-react'; 

export default Dashboard;