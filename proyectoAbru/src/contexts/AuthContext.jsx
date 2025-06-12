import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';

// 1. Creamos el contexto
const AuthContext = createContext();

// 2. Creamos un hook personalizado para usar el contexto más fácilmente
export const useAuth = () => {
  return useContext(AuthContext);
};

// 3. Creamos el proveedor del contexto, que contendrá toda la lógica
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Para saber si ya se verificó la autenticación inicial
  const navigate = useNavigate();

  // --- LÓGICA DE AUTENTICACIÓN DE FIREBASE ---

  // Función para iniciar sesión
  const login = (email, password) => {
    // Usamos la función de Firebase, que devuelve una promesa
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Función para cerrar sesión
  const logout = () => {
    return signOut(auth);
  };

  // Efecto que se ejecuta una sola vez para verificar si el usuario ya está logueado
  useEffect(() => {
    // onAuthStateChanged es un "oyente" de Firebase que se activa
    // cada vez que el estado de autenticación cambia (login/logout).
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user); // Si hay un usuario, lo guardamos en el estado. Si no, será null.
      setLoading(false); // Marcamos que la carga inicial ha terminado.
    });

    // Nos desuscribimos del "oyente" cuando el componente se desmonta para evitar fugas de memoria
    return unsubscribe;
  }, []);

  // --- VALORES QUE PROVEERÁ EL CONTEXTO ---
  // Estos son los datos y funciones que otros componentes podrán usar
  const value = {
    currentUser,
    login,
    logout,
  };

  // El proveedor retorna el contexto con los valores, y solo si no está cargando,
  // renderiza los componentes hijos (el resto de tu app).
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};