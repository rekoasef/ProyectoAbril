// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

// ---- CONFIGURACIÓN DE CREDENCIALES DE ADMIN ----
// ¡IMPORTANTE! Estas son credenciales hardcodeadas para simplicidad.
// En una aplicación real con datos sensibles, NUNCA hagas esto.
// Deberías usar un backend seguro para la autenticación.
// Para este proyecto, como es un panel para una sola persona (la fotógrafa),
// y los datos no son críticos más allá de su propio portfolio, es una simplificación aceptable
// PERO considera cambiar estas credenciales regularmente o buscar una solución más robusta a futuro.
const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME;
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;
// ---- FIN DE CONFIGURACIÓN DE CREDENCIALES ----

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true); // Para evitar flashes de contenido no autenticado

  useEffect(() => {
    // Comprueba si ya hay una sesión en localStorage al cargar la app
    const storedAuth = localStorage.getItem('sevePhotographyAdminAuthenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
    setLoadingAuth(false);
  }, []);

  const login = (username, password) => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem('sevePhotographyAdminAuthenticated', 'true');
      setIsAuthenticated(true);
      console.log("Admin login successful");
      return true;
    }
    console.log("Admin login failed. Provided:", username, "Expected:", ADMIN_USERNAME);
    return false;
  };

  const logout = () => {
    localStorage.removeItem('sevePhotographyAdminAuthenticated');
    setIsAuthenticated(false);
    console.log("Admin logout");
  };

  // No renderizar hijos hasta que se haya verificado el estado de autenticación
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-text-secondary">Verificando autenticación...</p>
        {/* Podrías poner un spinner aquí */}
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};