import React from 'react';
import Dock from './Dock';
import { motion } from 'framer-motion';
import { TrendingUp, Users, AlertCircle, Clock, CalendarCheck } from 'lucide-react';

// Reusable "Live Tile" Component
const StatCard = ({ title, value, subtitle, icon: Icon, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-panel p-6 rounded-[2rem] relative overflow-hidden group hover:bg-white/5 transition-all duration-300 border border-white/10 hover:border-white/20"
  >
    {/* Background Glow */}
    <div className={`absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500 blur-2xl ${color} w-32 h-32 rounded-full`}></div>
    
    <div className="relative z-10">
      <div className={`p-3 rounded-2xl w-fit mb-4 ${color} bg-opacity-20 border border-white/5`}>
        <Icon size={24} className="text-white" />
      </div>
      <h3 className="text-gray-400 text-sm font-medium mb-1 tracking-wide">{title}</h3>
      <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">{value}</h2>
      <p className="text-xs text-gray-500 font-medium group-hover:text-gray-300 transition-colors">{subtitle}</p>
    </div>
  </motion.div>
);

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-black text-white pb-40 pt-10 px-6 md:px-12 relative overflow-x-hidden">
      
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-black to-black -z-10"></div>
      <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-12 flex justify-between items-end"
      >
        <div>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 mb-2">Command Center</h1>
          <p className="text-gray-400 text-lg">Overview of Nexus Institute Activity</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-gray-500 text-sm uppercase tracking-widest font-bold">Current Session</p>
          <p className="text-white text-xl font-mono">2025-2026</p>
        </div>
      </motion.div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Students" 
          value="1,240" 
          subtitle="+45 new admissions" 
          icon={Users} 
          color="bg-blue-500" 
          delay={0.1}
        />
        <StatCard 
          title="Monthly Revenue" 
          value="$84.2k" 
          subtitle="Tuition & Transport fees" 
          icon={TrendingUp} 
          color="bg-emerald-500" 
          delay={0.2}
        />
        <StatCard 
          title="Attendance" 
          value="94%" 
          subtitle="Average across all grades" 
          icon={Clock} 
          color="bg-violet-500" 
          delay={0.3}
        />
        <StatCard 
          title="Pending Dues" 
          value="18" 
          subtitle="Students with overdue fees" 
          icon={AlertCircle} 
          color="bg-rose-500" 
          delay={0.4}
        />
      </div>

      {/* Content Area (Asymmetrical Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Big Analytics Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-panel p-8 rounded-[2rem] lg:col-span-2 min-h-[400px] border border-white/10"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-semibold text-white">Financial Performance</h3>
            <select className="bg-black/40 border border-white/10 text-gray-300 text-sm rounded-lg px-4 py-2 outline-none">
              <option>This Semester</option>
              <option>Last Semester</option>
            </select>
          </div>
          
          {/* Placeholder for Chart */}
          <div className="h-64 w-full rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center text-gray-600 bg-white/5">
            [Chart.js / Recharts Component Will Go Here]
          </div>
        </motion.div>

        {/* Notices / Feed Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="glass-panel p-8 rounded-[2rem] border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Live Notices</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5 group">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <CalendarCheck size={14} className="text-blue-400" />
                    <span className="text-xs font-bold text-blue-400">ACADEMIC</span>
                  </div>
                  <span className="text-xs text-gray-500">2h ago</span>
                </div>
                <p className="text-sm text-gray-300 group-hover:text-white transition-colors">
                  Final exams for Grade 12 have been rescheduled to next Monday.
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* The Floating Navigation */}
      <Dock />
    </div>
  );
};

export default Dashboard;