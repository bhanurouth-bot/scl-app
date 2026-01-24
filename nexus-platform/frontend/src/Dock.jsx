import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, Users, GraduationCap, CreditCard, FileText, 
  Settings, LogOut, Briefcase, Library, ClipboardList,Bus,
  IdCard, Award, FileBarChart, BookOpen, Scroll, Calculator,Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Dynamic Calendar Icon ---
const DynamicCalendarIcon = ({ className }) => {
  const [date, setDate] = useState(new Date().getDate());
  useEffect(() => {
    const timer = setInterval(() => setDate(new Date().getDate()), 60000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className={`${className} bg-white rounded-[5px] shadow-sm overflow-hidden flex flex-col items-center justify-between border border-gray-200 relative`} style={{ width: '20px', height: '20px' }}>
      <div className="h-[5px] w-full bg-red-500"></div>
      <div className="flex-1 flex items-center justify-center">
        <span className="text-black text-[11px] font-bold leading-none font-sans -mt-0.5 tracking-tighter">{date}</span>
      </div>
    </div>
  );
};

const Dock = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredTab, setHoveredTab] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [exitTimer, setExitTimer] = useState(null);

  // --- ENHANCEMENT: Role-Based Access ---
  // Default to 'ADMIN' if not found, or 'GUEST' if you prefer stricter security
  const userRole = localStorage.getItem('user_type') || 'ADMIN'; 

  // Define Menu Items with Access Control
  const allMenuItems = [
    { icon: LayoutGrid, label: 'Dashboard', path: '/dashboard', allowedRoles: ['ADMIN', 'STAFF', 'STUDENT'] },
    { icon: FileText, label: 'Notices', path: '/notices', allowedRoles: ['ADMIN', 'STAFF', 'STUDENT'] },
    
    // Academic & Students
    { icon: Users, label: 'Students', path: '/students', allowedRoles: ['ADMIN', 'STAFF'] },
    { icon: GraduationCap, label: 'Academics', path: '/academics', allowedRoles: ['ADMIN', 'STAFF'] },
    { icon: BookOpen, label: 'Classes', path: '/classes', allowedRoles: ['ADMIN', 'STAFF'] },
    { icon: ClipboardList, label: 'Tasks', path: '/assignments', allowedRoles: ['ADMIN', 'STAFF', 'STUDENT'] },
    
    // Exams & Grades
    { icon: Scroll, label: 'Exams', path: '/exams', allowedRoles: ['ADMIN', 'STAFF'] },
    { icon: Calculator, label: 'Grades', path: '/gradebook', allowedRoles: ['ADMIN', 'STAFF'] }, 
    { icon: FileBarChart, label: 'Reports', path: '/report-cards', allowedRoles: ['ADMIN', 'STAFF', 'STUDENT'] },

    // Admin / Utility
    { icon: IdCard, label: 'ID Cards', path: '/id-cards', allowedRoles: ['ADMIN', 'STAFF'] },
    { icon: Award, label: 'Certificates', path: '/certificates', allowedRoles: ['ADMIN'] },
    { icon: Library, label: 'Library', path: '/library', allowedRoles: ['ADMIN', 'STAFF', 'STUDENT'] },
    { icon: DynamicCalendarIcon, label: 'Timetable', path: '/timetable', allowedRoles: ['ADMIN', 'STAFF', 'STUDENT'] },
    
    // Sensitive Modules
    { icon: Shield, label: 'Gatekeeper', path: '/visitors', allowedRoles: ['ADMIN', 'SECURITY'] },
    { icon: Bus, label: 'Fleet', path: '/transport', allowedRoles: ['ADMIN'] },
    { icon: CreditCard, label: 'Finance', path: '/finance', allowedRoles: ['ADMIN', 'ACCOUNTANT'] },
    { icon: Briefcase, label: 'HR', path: '/hr', allowedRoles: ['ADMIN'] },
  ];

  // Filter items based on the current user's role
  const menuItems = allMenuItems.filter(item => item.allowedRoles.includes(userRole));

  const handleMouseEnter = () => {
    if (exitTimer) clearTimeout(exitTimer);
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    const timer = setTimeout(() => {
        setIsVisible(false);
    }, 500);
    setExitTimer(timer);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_type'); // Clear role on logout
    navigate('/');
  };

  return (
    <>
      {/* Invisible Trigger Zone */}
      <div 
        className="fixed bottom-0 left-0 w-full h-6 z-50 bg-transparent"
        onMouseEnter={handleMouseEnter}
      />

      {/* Dock Container */}
      <motion.div 
        className="fixed bottom-4 left-1/2 z-50 w-auto pointer-events-auto"
        initial={{ x: "-50%", y: 150 }} 
        animate={{ x: "-50%", y: isVisible ? 0 : 150 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl border border-white/20 backdrop-blur-2xl bg-black/40 relative">
          
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const isHovered = hoveredTab === item.label;

            return (
              <motion.button
                key={item.label}
                onHoverStart={() => setHoveredTab(item.label)}
                onHoverEnd={() => setHoveredTab(null)}
                whileHover={{ scale: 1.2, y: -15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(item.path)}
                className="relative group p-2"
              >
                {/* Icon Container */}
                <motion.div 
                  className={`p-3 rounded-2xl transition-all duration-300 flex items-center justify-center ${isActive ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.5)]' : 'bg-white/5 hover:bg-white/10'}`}
                  animate={isHovered ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                >
                  <item.icon size={20} className={`transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                </motion.div>
                
                {/* Tooltip Label */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.span 
                      initial={{ opacity: 0, y: 10, x: "-50%" }}
                      animate={{ opacity: 1, y: 0, x: "-50%" }}
                      exit={{ opacity: 0, y: 5, x: "-50%" }}
                      className="absolute -top-14 left-1/2 px-3 py-1.5 bg-black/80 backdrop-blur-md text-white text-xs font-bold rounded-xl border border-white/10 shadow-xl whitespace-nowrap pointer-events-none"
                    >
                      {item.label}
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45 border-r border-b border-white/10"></div>
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {/* Active Dot Indicator */}
                {isActive && (
                  <motion.div layoutId="activeDot" className="absolute -bottom-2 left-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,1)] transform -translate-x-1/2" />
                )}
              </motion.button>
            );
          })}

          <div className="w-px h-8 bg-white/10 mx-2" /> 

          {/* Settings (Static) */}
          <motion.button
            whileHover={{ rotate: 180, scale: 1.1 }}
            className="p-3 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <Settings size={20} />
          </motion.button>

          {/* Logout (Static) */}
          <motion.button
            whileHover={{ scale: 1.1, color: '#ef4444', x: [0, -2, 2, 0] }}
            onClick={handleLogout}
            className="p-3 rounded-full hover:bg-red-500/10 text-gray-400 transition-colors"
          >
            <LogOut size={20} />
          </motion.button>

        </div>
      </motion.div>
      
      {/* Dock Hint Bar (Visible when dock is hidden) */}
      <AnimatePresence>
        {!isVisible && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1.5 bg-white/20 rounded-full pointer-events-none z-40 blur-[1px]"
            />
        )}
      </AnimatePresence>
    </>
  );
};

export default Dock;