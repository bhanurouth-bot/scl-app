import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, Users, GraduationCap, CreditCard, FileText, 
  Settings, LogOut, Briefcase, Library, ClipboardList, Bus,
  IdCard, Award, FileBarChart, BookOpen, Scroll, Calculator, Shield, UserCheck
} from 'lucide-react';
import api from './api'; // <--- Added API import

const Dock = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hoveredTab, setHoveredTab] = useState(null);

  // Map routes to tab IDs
  useEffect(() => {
    const path = location.pathname.substring(1);
    if (path) setActiveTab(path);
  }, [location]);

  const handleNavigation = (id) => {
    setActiveTab(id);
    navigate(`/${id}`);
  };

  // --- UPDATED LOGOUT LOGIC ---
  const handleLogout = async () => {
    try {
      // 1. Tell Backend to delete the HttpOnly cookie
      await api.post('logout/');
      console.log("Logged out from server");
    } catch (e) {
      console.error("Logout failed on server", e);
    } finally {
      // 2. Clear the UI flag that lets PrivateRoute pass
      localStorage.removeItem('isAuthenticated');
      
      // 3. Redirect to Login
      navigate('/');
    }
  };

  const menuItems = [
    { id: 'dashboard', icon: LayoutGrid, label: 'Dashboard', color: 'text-blue-400' },
    { id: 'students', icon: GraduationCap, label: 'Students', color: 'text-emerald-400' },
    { id: 'attendance', icon: UserCheck, label: 'Attendance', color: 'text-green-400' },
    { id: 'employees', icon: Users, label: 'Staff', color: 'text-purple-400' },
    { id: 'hr', icon: Briefcase, label: 'HR Dept', color: 'text-pink-400' },
    { id: 'academics', icon: BookOpen, label: 'Academics', color: 'text-indigo-400' },
    { id: 'subjects', icon: Library, label: 'Subjects', color: 'text-teal-400' },
    { id: 'classes', icon: Users, label: 'Classes', color: 'text-cyan-400' },
    { id: 'timetable', icon: Calculator, label: 'Timetable', color: 'text-sky-400' },
    { id: 'assignments', icon: ClipboardList, label: 'Tasks', color: 'text-orange-400' },
    { id: 'exams', icon: FileText, label: 'Exams', color: 'text-red-400' },
    { id: 'gradebook', icon: FileBarChart, label: 'Grades', color: 'text-yellow-400' },
    { id: 'report-cards', icon: Award, label: 'Reports', color: 'text-amber-400' },
    { id: 'certificates', icon: Scroll, label: 'Certs', color: 'text-lime-400' },
    { id: 'id-cards', icon: IdCard, label: 'ID Cards', color: 'text-fuchsia-400' },
    { id: 'library', icon: Library, label: 'Library', color: 'text-violet-400' },
    { id: 'transport', icon: Bus, label: 'Transport', color: 'text-rose-400' },
    { id: 'visitors', icon: Shield, label: 'Visitors', color: 'text-indigo-400' },
    { id: 'finance', icon: CreditCard, label: 'Finance', color: 'text-green-400' },
    { id: 'notices', icon: FileText, label: 'Notices', color: 'text-yellow-400' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      {/* Glass Container */}
      <div className="glass-panel px-4 py-3 rounded-2xl flex items-center gap-3 border border-white/10 shadow-2xl backdrop-blur-xl bg-black/40">
        
        {/* Scrollable Menu Items */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-[80vw] px-2 no-scrollbar pb-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isHovered = hoveredTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                onMouseEnter={() => setHoveredTab(item.id)}
                onMouseLeave={() => setHoveredTab(null)}
                className={`
                  relative group flex flex-col items-center justify-center
                  w-12 h-12 rounded-xl transition-all duration-300 ease-out
                  ${isActive 
                    ? 'bg-white/15 scale-110 -translate-y-2 shadow-lg shadow-black/20' 
                    : 'hover:bg-white/10 hover:scale-110 hover:-translate-y-1'
                  }
                `}
              >
                {/* Tooltip */}
                <span className={`
                  absolute -top-10 px-3 py-1 rounded-lg text-xs font-medium bg-black/80 text-white 
                  border border-white/10 backdrop-blur-md transition-all duration-200 pointer-events-none whitespace-nowrap
                  ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                `}>
                  {item.label}
                </span>

                <Icon 
                  className={`
                    w-5 h-5 transition-colors duration-300
                    ${isActive ? item.color : 'text-gray-400 group-hover:text-white'}
                  `}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                
                {/* Active Dot */}
                {isActive && (
                  <div className={`absolute -bottom-1 w-1 h-1 rounded-full ${item.color.replace('text-', 'bg-')}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-[1px] h-8 bg-white/10 mx-1" />

        {/* System Actions */}
        <div className="flex items-center gap-2">
          {/* Settings */}
          <button
            onClick={() => handleNavigation('settings')}
            className="group relative flex items-center justify-center w-10 h-10 rounded-xl hover:bg-white/10 transition-all duration-300"
          >
            <Settings className="w-5 h-5 text-gray-400 group-hover:text-white transition-transform duration-500 group-hover:rotate-90" />
          </button>

          {/* Logout Button (Updated) */}
          <button
            onClick={handleLogout}
            className="group relative flex items-center justify-center w-10 h-10 rounded-xl hover:bg-red-500/20 transition-all duration-300"
          >
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default Dock;