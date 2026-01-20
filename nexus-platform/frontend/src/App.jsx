import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import Students from './pages/Students';
import StudentProfile from './pages/StudentProfile';
import Academics from './pages/Academics';
import Notices from './pages/Notices';
import Gradebook from './pages/Gradebook';
import Settings from './pages/Settings';
import Library from './pages/Library'; // <--- ADD THIS LINE
import Assignments from './pages/Assignments';
import HR from './pages/HR';
import Certificates from './pages/Certificates';
import Visitors from './pages/Visitors';
import Infirmary from './pages/Infirmary';
import Timetable from './pages/Timetable';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/students" element={<PrivateRoute><Students /></PrivateRoute>} />
        <Route path="/students/:id" element={<PrivateRoute><StudentProfile /></PrivateRoute>} />
        <Route path="/academics" element={<PrivateRoute><Academics /></PrivateRoute>} />
        <Route path="/notices" element={<PrivateRoute><Notices /></PrivateRoute>} />
        <Route path="/gradebook" element={<PrivateRoute><Gradebook /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        
        {/* Now this will work because Library is imported */}
        <Route path="/library" element={<PrivateRoute><Library /></PrivateRoute>} />

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        <Route path="/lms" element={<PrivateRoute><Assignments /></PrivateRoute>} />
        <Route path="/hr" element={<PrivateRoute><HR /></PrivateRoute>} />
        <Route path="/certificates" element={<PrivateRoute><Certificates /></PrivateRoute>} />
        <Route path="/visitors" element={<PrivateRoute><Visitors /></PrivateRoute>} />
        <Route path="/health" element={<PrivateRoute><Infirmary /></PrivateRoute>} />
        <Route path="/timetable" element={<PrivateRoute><Timetable /></PrivateRoute>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;