import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  // Check for authentication token
  const isAuthenticated = !!localStorage.getItem('access_token');

  if (!isAuthenticated) {
    // Redirect to Login if not authenticated
    return <Navigate to="/" replace />;
  }

  // Render child component if authenticated
  return children;
};

export default PrivateRoute;