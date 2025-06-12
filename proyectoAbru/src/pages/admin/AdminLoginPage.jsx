import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const AdminLoginPage = () => {
  // Ahora usamos el currentUser para saber si ya estamos logueados
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  // Estados para manejar el formulario, errores y carga
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Si el usuario ya está logueado, lo redirigimos al dashboard
  if (currentUser) {
    return <Navigate to="/admin/dashboard" />;
  }

  // Nueva función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpiamos errores anteriores
    setLoading(true); // Empezamos la carga

    try {
      // Llamamos a la nueva función login de nuestro AuthContext
      await login(email, password);
      // Si el login es exitoso, Firebase nos redirigirá automáticamente
      // gracias al onAuthStateChanged, pero podemos forzarlo por si acaso.
      navigate('/admin');
    } catch (firebaseError) {
      // Si Firebase devuelve un error (ej. contraseña incorrecta)
      console.error('Error de Firebase:', firebaseError.code);
      setError('Credenciales incorrectas. Por favor, verifica tu email y contraseña.');
    } finally {
      // Pase lo que pase, dejamos de cargar
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Panel de Administración
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading} // Deshabilitamos el botón mientras carga
              className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;