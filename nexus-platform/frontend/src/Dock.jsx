import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, Users, GraduationCap, CreditCard, FileText, 
  Settings, LogOut, Briefcase, Library, ClipboardList, 
  IdCard, Award, FileBarChart, BookOpen, Scroll, Calculator // <--- Both Icons imported
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

  const menuItems = [
    { icon: LayoutGrid, label: 'Dashboard', path: '/dashboard', animation: { rotate: 180 } },
    { icon: Users, label: 'Students', path: '/students', animation: { y: [0, -5, 0], transition: { repeat: Infinity, duration: 0.8 } } },
    { icon: GraduationCap, label: 'Academics', path: '/academics', animation: { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } },
    { icon: BookOpen, label: 'Classes', path: '/classes' },
    { icon: ClipboardList, label: 'Tasks', path: '/assignments' },
    
    // --- BOTH MODULES NOW VISIBLE ---
    { icon: Scroll, label: 'Exams', path: '/exams', animation: { rotate: [0, 10, -10, 0] } },
    { icon: Calculator, label: 'Grades', path: '/gradebook', animation: { scale: [1, 1.2, 1] } }, 

    { icon: IdCard, label: 'ID Cards', path: '/id-cards', animation: { scaleX: [1, -1, 1], transition: { duration: 0.8 } } },
    { icon: Award, label: 'Certificates', path: '/certificates', animation: { scale: [1, 1.2, 1] } },
    { icon: FileBarChart, label: 'Reports', path: '/report-cards' },
    { icon: Library, label: 'Library', path: '/library', animation: { scale: [1, 1.1, 1] } },
    { icon: CreditCard, label: 'Finance', path: '/finance', animation: { rotateY: 180, transition: { duration: 0.6 } } },
    { icon: DynamicCalendarIcon, label: 'Timetable', path: '/timetable', animation: { x: [0, -3, 3, -3, 0] } },
    { icon: Briefcase, label: 'HR', path: '/hr', animation: { rotate: [0, -15, 15, -15, 0], transition: { duration: 0.5 } } },
    { icon: FileText, label: 'Notices', path: '/notices', animation: { rotate: [0, 10, 0] } },
  ];

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/');
  };

  return (
    <>
      <div 
        className="fixed bottom-0 left-0 w-full h-6 z-50 bg-transparent"
        onMouseEnter={handleMouseEnter}
      />

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
                <motion.div 
                  className={`p-3 rounded-2xl transition-all duration-300 flex items-center justify-center ${isActive ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.5)]' : 'bg-white/5 hover:bg-white/10'}`}
                  animate={isHovered ? item.animation : { rotate: 0, y: 0, x: 0, scale: 1 }}
                >
                  <item.icon size={20} className={`transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                </motion.div>
                
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
                
                {isActive && (
                  <motion.div layoutId="activeDot" className="absolute -bottom-2 left-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,1)] transform -translate-x-1/2" />
                )}
              </motion.button>
            );
          })}

          <div className="w-px h-8 bg-white/10 mx-2" /> 

          <motion.button
            whileHover={{ rotate: 180, scale: 1.1 }}
            className="p-3 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <Settings size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, color: '#ef4444', x: [0, -2, 2, 0] }}
            onClick={handleLogout}
            className="p-3 rounded-full hover:bg-red-500/10 text-gray-400 transition-colors"
          >
            <LogOut size={20} />
          </motion.button>

        </div>
      </motion.div>
      
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