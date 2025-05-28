// src/components/layout/PublicLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar'; // Asegúrate de que esta línea esté descomentada
import Footer from './Footer'; // Asegúrate de que esta línea esté descomentada

const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white-off"> {/* Quita el style del borde rojo */}
      <Navbar /> {/* Asegúrate de que esta línea esté descomentada y se llame el componente */}
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer /> {/* Asegúrate de que esta línea esté descomentada y se llame el componente */}
    </div>
  );
};

export default PublicLayout;