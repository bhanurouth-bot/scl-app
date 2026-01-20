import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Settings, 
  LogOut, 
  Bell, 
  Book, 
  ClipboardList,
  Shield,
  Printer,
  Calendar,
  Heart, // Gradebook
  Bus            // Transport (if you kept it) or remove if unused
} from 'lucide-react';
import { Briefcase } from 'lucide-react';

const Dock = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Students', path: '/students' },
    { icon: BookOpen, label: 'Academics', path: '/academics' },
    { icon: Book, label: 'Library', path: '/library' },
    { icon: ClipboardList, label: 'Gradebook', path: '/gradebook' },
    { icon: BookOpen, label: 'LMS', path: '/lms' }, // Re-using BookOpen is fine for the icon, just not the import
    { icon: Bell, label: 'Notices', path: '/notices' },
    { icon: Briefcase, label: 'HR', path: '/hr' },
    { icon: Shield, label: 'Front Desk', path: '/visitors' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: Printer, label: 'Print', path: '/certificates' },
    { icon: Heart, label: 'Health', path: '/health' },
    { icon: Calendar, label: 'Timetable', path: '/timetable' },

  ];

  const handleLogout = () => {
    if(confirm("Log out of Nexus?")) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/15">
        
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`group relative p-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)] scale-110 -translate-y-2' 
                  : 'hover:bg-white/10 hover:scale-110 hover:-translate-y-1'
              }`}
            >
              <item.icon 
                size={22} 
                className={`transition-colors duration-300 ${isActive ? 'text-white' : 'text-blue-200 group-hover:text-white'}`} 
              />
              
              {/* Tooltip */}
              <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
                {item.label}
              </span>
              
              {/* Active Dot */}
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_5px_currentColor]"></span>
              )}
            </button>
          );
        })}

        {/* Divider */}
        <div className="w-px h-8 bg-white/10 mx-1"></div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="group relative p-3 rounded-xl hover:bg-red-500/20 hover:scale-110 hover:-translate-y-1 transition-all duration-300"
        >
          <LogOut size={22} className="text-red-300 group-hover:text-red-100" />
          <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/80 text-red-200 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-red-500/30">
            Log Out
          </span>
        </button>

      </div>
    </div>
  );
};

export default Dock;