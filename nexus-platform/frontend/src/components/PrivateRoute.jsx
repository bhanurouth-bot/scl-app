import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  
  // Real engineering: In the future, we would check if the token is expired here.
  // For now, simple existence check is enough for MVP.
  return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;