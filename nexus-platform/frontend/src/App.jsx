import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// --- Auth ---
import Login from './Login';
import PrivateRoute from './PrivateRoute';

// --- Modules ---
import Dashboard from './Dashboard';
import Students from './Students';
import StudentDetail from './StudentDetail'; // <--- Ensure this is imported

// Academics
import Academics from './Academics';
import ClassroomDetail from './ClassroomDetail';
import Subjects from './Subjects'; 

// HR & Staff
import Employees from './Employees';

// Finance
import Finance from './Finance';
import FeeStructures from './FeeStructures';
import FeeHeads from './FeeHeads';

// Scheduling
import Timetable from './Timetable';
import Exams from './Exams';        // <--- Add if missing
import ExamDetail from './ExamDetail'; // <--- Add if missing
import Attendance from './Attendance';

import Dock from './Dock';

const Notices = () => (
  <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center">
    <h1 className="text-4xl font-bold text-gray-500 mb-4">Notices</h1>
    <Dock />
  </div>
);

const AppLayout = ({ children }) => {
  return (
    <>
      {children}
      <Dock />
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Login />} />

          {/* --- DASHBOARD --- */}
          <Route path="/dashboard" element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />

          {/* --- STUDENTS MODULE --- */}
          <Route path="/students" element={<PrivateRoute><AppLayout><Students /></AppLayout></PrivateRoute>} />
          
          {/* NEW: Student Profile Route */}
          <Route path="/students/:id" element={<PrivateRoute><AppLayout><StudentDetail /></AppLayout></PrivateRoute>} />

          {/* --- ACADEMICS MODULE --- */}
          <Route path="/academics" element={<PrivateRoute><AppLayout><Academics /></AppLayout></PrivateRoute>} />
          <Route path="/academics/:id" element={<PrivateRoute><AppLayout><ClassroomDetail /></AppLayout></PrivateRoute>} />
          <Route path="/subjects" element={<PrivateRoute><AppLayout><Subjects /></AppLayout></PrivateRoute>} />

          {/* --- EXAMS MODULE --- */}
          <Route path="/exams" element={<PrivateRoute><AppLayout><Exams /></AppLayout></PrivateRoute>} />
          <Route path="/exams/:id" element={<PrivateRoute><AppLayout><ExamDetail /></AppLayout></PrivateRoute>} />

          {/* --- ATTENDANCE MODULE --- */}
          <Route path="/attendance" element={<PrivateRoute><AppLayout><Attendance /></AppLayout></PrivateRoute>} />

          {/* --- HR MODULE --- */}
          <Route path="/employees" element={<PrivateRoute><AppLayout><Employees /></AppLayout></PrivateRoute>} />

          {/* --- FINANCE MODULE --- */}
          <Route path="/finance" element={<PrivateRoute><AppLayout><Finance /></AppLayout></PrivateRoute>} />
          <Route path="/finance/structures" element={<PrivateRoute><AppLayout><FeeStructures /></AppLayout></PrivateRoute>} />
          <Route path="/finance/heads" element={<PrivateRoute><AppLayout><FeeHeads /></AppLayout></PrivateRoute>} />

          {/* --- TIMETABLE --- */}
          <Route path="/timetable" element={<PrivateRoute><AppLayout><Timetable /></AppLayout></PrivateRoute>} />

          <Route path="/notices" element={<PrivateRoute><AppLayout><Notices /></AppLayout></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
          
        </Routes>
      </AnimatePresence>
    </Router>
  );
};

export default App;