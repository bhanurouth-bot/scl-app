import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  // Check the simple flag we set during login in Login.jsx
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  // If true, render the child routes (Dashboard). If false, go to Login.
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default PrivateRoute;