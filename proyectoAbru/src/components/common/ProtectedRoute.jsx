// src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loadingAuth } = useAuth();
  const location = useLocation();

  // Si aún está cargando la info de auth, no renderizar nada o un loader
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirige al login, guardando la ubicación desde la que se intentó acceder
    // para poder volver después del login.
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children; // Si está autenticado, renderiza el contenido protegido
};

export default ProtectedRoute;