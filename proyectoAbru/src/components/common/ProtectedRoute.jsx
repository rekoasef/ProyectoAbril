import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();

  // Esta es la línea clave:
  return currentUser ? children : <Navigate to="/admin/login" />;
};

export default ProtectedRoute;