import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// --- Auth ---
import Login from './Login';
import PrivateRoute from './PrivateRoute';

// --- Core Modules ---
import Dashboard from './Dashboard';
import Dock from './Dock';
import Timetable from './Timetable';
import Notices from './Notices';  // <--- IMPORTED REAL COMPONENT

// --- Students Module ---
import Students from './Students';
import StudentDetail from './StudentDetail';

// --- Academics Module ---
import Academics from './Academics';
import ClassroomDetail from './ClassroomDetail';
import Subjects from './Subjects'; 

// --- Exams Module ---
import Exams from './Exams';
import ExamDetail from './ExamDetail';

// --- Attendance Module ---
import Attendance from './Attendance';

// --- HR Module ---
import HR from './HR';

// --- Finance Module ---
import Finance from './Finance';
import FeeStructures from './FeeStructures';
import FeeHeads from './FeeHeads';
import Assignments from './Assignments';
import AssignmentDetail from './AssignmentDetail';

// --- Library Module ---
import Library from './Library';
import IDCardGenerator from './IDCardGenerator';
import Certificates from './Certificates';
import Gradebook from './Gradebook';
import ReportCards from './ReportCards';
import Classes from './Classes';
import Visitors from './Visitors';
import Transport from './Transport';
import DriverTracker from './DriverTracker';

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
          {/* Public Route */}
          <Route path="/" element={<Login />} />

          {/* --- DASHBOARD --- */}
          <Route path="/dashboard" element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />

          {/* --- NOTICES (New) --- */}
          <Route path="/notices" element={<PrivateRoute><AppLayout><Notices /></AppLayout></PrivateRoute>} />

          {/* --- STUDENTS --- */}
          <Route path="/students" element={<PrivateRoute><AppLayout><Students /></AppLayout></PrivateRoute>} />
          <Route path="/students/:id" element={<PrivateRoute><AppLayout><StudentDetail /></AppLayout></PrivateRoute>} />

          {/* --- ACADEMICS --- */}
          <Route path="/academics" element={<PrivateRoute><AppLayout><Academics /></AppLayout></PrivateRoute>} />
          <Route path="/academics/:id" element={<PrivateRoute><AppLayout><ClassroomDetail /></AppLayout></PrivateRoute>} />
          <Route path="/subjects" element={<PrivateRoute><AppLayout><Subjects /></AppLayout></PrivateRoute>} />

          {/* --- EXAMS --- */}
          <Route path="/exams" element={<PrivateRoute><AppLayout><Exams /></AppLayout></PrivateRoute>} />
          <Route path="/exams/:id" element={<PrivateRoute><AppLayout><ExamDetail /></AppLayout></PrivateRoute>} />

          {/* --- ATTENDANCE --- */}
          <Route path="/attendance" element={<PrivateRoute><AppLayout><Attendance /></AppLayout></PrivateRoute>} />

          {/* --- LIBRARY --- */}
          <Route path="/library" element={<PrivateRoute><AppLayout><Library /></AppLayout></PrivateRoute>} />

          {/* --- HR / STAFF --- */}
          <Route path="/hr" element={<HR />} />

          {/* --- FINANCE --- */}
          <Route path="/finance" element={<PrivateRoute><AppLayout><Finance /></AppLayout></PrivateRoute>} />
          <Route path="/finance/structures" element={<PrivateRoute><AppLayout><FeeStructures /></AppLayout></PrivateRoute>} />
          <Route path="/finance/heads" element={<PrivateRoute><AppLayout><FeeHeads /></AppLayout></PrivateRoute>} />

          {/* --- TIMETABLE --- */}
          <Route path="/timetable" element={<PrivateRoute><AppLayout><Timetable /></AppLayout></PrivateRoute>} />
          <Route path="/assignments" element={<PrivateRoute><AppLayout><Assignments /></AppLayout></PrivateRoute>} />
          <Route path="/assignments/:id" element={<PrivateRoute><AppLayout><AssignmentDetail /></AppLayout></PrivateRoute>} />
          <Route path="/id-cards" element={<PrivateRoute><AppLayout><IDCardGenerator /></AppLayout></PrivateRoute>} />
          <Route path="/certificates" element={<PrivateRoute><AppLayout><Certificates /></AppLayout></PrivateRoute>} />
          <Route path="/gradebook" element={<PrivateRoute><AppLayout><Gradebook /></AppLayout></PrivateRoute>} />
          <Route path="/report-cards" element={<PrivateRoute><AppLayout><ReportCards /></AppLayout></PrivateRoute>} />
          <Route path="/classes" element={<PrivateRoute><AppLayout><Classes /></AppLayout></PrivateRoute>} />
          <Route path="/visitors" element={<PrivateRoute><Visitors /></PrivateRoute>} />
          <Route path="/transport" element={<PrivateRoute><Transport /></PrivateRoute>} />
          <Route path="/driver-tracker" element={<DriverTracker />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
          
        </Routes>
      </AnimatePresence>
    </Router>
  );
};

export default App;