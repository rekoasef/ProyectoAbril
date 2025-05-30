// src/components/layout/AdminLayout.jsx
import React, { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Image, Briefcase, LayoutDashboard, MessageSquareText, Menu, X } from 'lucide-react'; // Añadido MessageSquareText

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const commonLinkClasses = "flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150";
  const activeLinkClasses = "bg-gray-900 text-white-off";
  const inactiveLinkClasses = "text-gray-300 hover:bg-gray-700 hover:text-white-off";

  const navItems = [
    { to: "/admin", text: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { to: "/admin/portfolio", text: "Portfolio", icon: <Image size={20} /> },
    { to: "/admin/servicios", text: "Servicios", icon: <Briefcase size={20} /> },
    { to: "/admin/reseñas", text: "Reseñas", icon: <MessageSquareText size={20} /> }, // Nuevo enlace
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex md:flex-shrink-0 w-64 flex-col bg-gray-800 text-white-off">
        <div className="flex items-center justify-center h-20 border-b border-gray-700">
          <Link to="/admin" className="script-logo text-3xl text-white-off">
            SeVe Admin
          </Link>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.text}
              to={item.to}
              end={item.to === "/admin"} // 'end' solo para la ruta raíz del admin
              className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
            >
              {item.icon}
              <span>{item.text}</span>
            </NavLink>
          ))}
        </nav>
        <div className="px-2 py-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className={`${commonLinkClasses} w-full text-gray-300 hover:bg-red-600 hover:text-white-off`}
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal y Navbar Móvil */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar Superior (para móvil) */}
        <header className="md:hidden bg-gray-800 text-white-off shadow-md">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/admin" className="script-logo text-2xl text-white-off">
                SeVe Admin
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Abrir menú</span>
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
          {/* Menú Móvil Desplegable */}
          {isMobileMenuOpen && (
            <nav className="md:hidden border-t border-gray-700" id="mobile-menu">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navItems.map(item => (
                  <NavLink
                    key={item.text}
                    to={item.to}
                    end={item.to === "/admin"}
                    onClick={() => setIsMobileMenuOpen(false)} // Cierra el menú al hacer clic
                    className={({ isActive }) => `${commonLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
                  >
                    {item.icon}
                    <span>{item.text}</span>
                  </NavLink>
                ))}
                <button
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className={`${commonLinkClasses} w-full text-gray-300 hover:bg-red-600 hover:text-white-off`}
                >
                  <LogOut size={20} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </nav>
          )}
        </header>

        {/* Contenido de la página */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default AdminLayout;
