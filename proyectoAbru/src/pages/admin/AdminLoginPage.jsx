// src/pages/admin/AdminLoginPage.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminLoginPage = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm();
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin"; // A dónde ir después del login

  const [loginError, setLoginError] = useState('');

  const onSubmit = async (data) => {
    setLoginError(''); // Limpiar errores previos
    const success = login(data.username, data.password);
    if (success) {
      navigate(from, { replace: true });
    } else {
      // setError no funciona bien para errores de servidor/autenticación aquí, usamos estado local
      setLoginError("Usuario o contraseña incorrectos.");
    }
  };

  // Si ya está autenticado, redirigir al dashboard de admin
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-lg shadow-xl space-y-6">
        <div className="text-center">
          <h1 className="script-logo text-5xl text-accent-script mb-2">
            SeVe Photography
          </h1>
          <h2 className="text-2xl font-semibold text-text-primary">Panel de Administración</h2>
        </div>

        {loginError && (
          <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-md">
            {loginError}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              {...register("username", { required: "El nombre de usuario es obligatorio" })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-script/50 focus:border-accent-script/80"
            />
            {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>}
          </div>
          <div>
            <label htmlFor="password"className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register("password", { required: "La contraseña es obligatoria" })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-script/50 focus:border-accent-script/80"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center px-6 py-3 bg-accent-script text-white-off font-semibold rounded-md shadow-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-script disabled:opacity-70 transition-colors"
          >
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default AdminLoginPage;