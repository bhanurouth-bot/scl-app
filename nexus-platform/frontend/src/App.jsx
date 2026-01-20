import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// --- Auth ---
import Login from './Login';
import PrivateRoute from './PrivateRoute';

// --- Modules ---
import Dashboard from './Dashboard';
import Students from './Students';

// Academics
import Academics from './Academics';
import ClassroomDetail from './ClassroomDetail'; // The Cockpit
import Subjects from './Subjects'; // Global Subject Manager

// HR & Staff
import Employees from './Employees';

// Finance
import Finance from './Finance';

// Scheduling
import Timetable from './Timetable';

// --- Navigation ---
import Dock from './Dock';
import FeeStructures from './FeeStructures';
import FeeHeads from './FeeHeads';
import Attendance from './Attendance';



// Placeholder for Notices (Coming Soon)
const Notices = () => (
  <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center">
    <h1 className="text-4xl font-bold text-gray-500 mb-4">Notices</h1>
    <p className="text-gray-600">Communication module under construction.</p>
    <Dock />
  </div>
);

// --- Layout Wrapper ---
// This ensures the Dock is visible on every authenticated page
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

          {/* --- PROTECTED ROUTES --- */}
          
          {/* Dashboard */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <AppLayout><Dashboard /></AppLayout>
            </PrivateRoute>
          } />

          {/* Student Directory */}
          <Route path="/students" element={
            <PrivateRoute>
              <AppLayout><Students /></AppLayout>
            </PrivateRoute>
          } />

          {/* Academics Module */}
          <Route path="/academics" element={
            <PrivateRoute>
              <AppLayout><Academics /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/academics/:id" element={ // The Classroom Cockpit
            <PrivateRoute>
              <AppLayout><ClassroomDetail /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/subjects" element={ // Global Subject Manager
            <PrivateRoute>
              <AppLayout><Subjects /></AppLayout>
            </PrivateRoute>
          } />

          {/* HR / Staff Module */}
          <Route path="/employees" element={
            <PrivateRoute>
              <AppLayout><Employees /></AppLayout>
            </PrivateRoute>
          } />

          {/* Finance Module */}
          <Route path="/finance" element={
            <PrivateRoute>
              <AppLayout><Finance /></AppLayout>
            </PrivateRoute>
          } />

          {/* Timetable Module */}
          <Route path="/timetable" element={
            <PrivateRoute>
              <AppLayout><Timetable /></AppLayout>
            </PrivateRoute>
          } />

          {/* Notices */}
          <Route path="/notices" element={
            <PrivateRoute>
              <AppLayout><Notices /></AppLayout>
            </PrivateRoute>
          } />

          {/* Fallback - Redirect unknown routes to Dashboard or Login */}
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/finance/structures" element={<PrivateRoute><AppLayout><FeeStructures /></AppLayout></PrivateRoute>} />
          <Route path="/finance/heads" element={<PrivateRoute><AppLayout><FeeHeads /></AppLayout></PrivateRoute>} />
          <Route path="/attendance" element={<PrivateRoute><AppLayout><Attendance /></AppLayout></PrivateRoute>} />

        </Routes>
      </AnimatePresence>
    </Router>
  );
};

export default App;