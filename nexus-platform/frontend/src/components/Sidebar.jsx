import React from 'react';
import { LayoutDashboard, Users, BookOpen, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const NavItem = ({ icon: Icon, label, active }) => (
    <div className={`
      flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300
      ${active 
        ? 'bg-nexus-accent/20 text-white border border-nexus-accent/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
        : 'text-slate-400 hover:text-white hover:bg-white/5'}
    `}>
      <Icon size={20} />
      <span className="font-medium text-sm">{label}</span>
    </div>
  );

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-nexus-dark/90 backdrop-blur-xl border-r border-glass-border flex flex-col z-50">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-600 shadow-lg"></div>
        <h1 className="text-xl font-bold tracking-wider text-white">NEXUS</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        <NavItem icon={LayoutDashboard} label="Dashboard" active />
        <NavItem icon={Users} label="Students" />
        <NavItem icon={BookOpen} label="Academics" />
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-glass-border">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;