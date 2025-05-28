// src/pages/admin/AdminDashboardPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Image, Briefcase } from 'lucide-react'; // Iconos

const AdminDashboardPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-gray-800">Dashboard Principal</h1>
      <p className="text-gray-600">
        ¡Bienvenida al panel de administración de SeVe Photography! Desde aquí podrás gestionar el contenido de tu sitio web.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/admin/portfolio"
          className="block p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1"
        >
          <div className="flex items-center text-indigo-600 mb-3">
            <Image size={32} className="mr-4"/>
            <h2 className="text-xl font-semibold text-gray-700">Gestionar Portfolio</h2>
          </div>
          <p className="text-gray-500 text-sm">Sube nuevas fotos, organiza por categorías y gestiona las imágenes existentes.</p>
        </Link>

        <Link
          to="/admin/servicios"
          className="block p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1"
        >
          <div className="flex items-center text-green-600 mb-3">
            <Briefcase size={32} className="mr-4"/>
            <h2 className="text-xl font-semibold text-gray-700">Gestionar Servicios</h2>
          </div>
          <p className="text-gray-500 text-sm">Agrega, edita o elimina los paquetes de servicios que ofreces.</p>
        </Link>
      </div>
    </div>
  );
};
export default AdminDashboardPage;