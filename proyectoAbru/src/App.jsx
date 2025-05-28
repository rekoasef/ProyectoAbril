// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Páginas Públicas
// ... (tus importaciones de páginas públicas)
import HomePage from './pages/public/HomePage';
import PortfolioPage from './pages/public/PortfolioPage';
import ServicesPage from './pages/public/ServicesPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import NotFoundPage from './pages/public/NotFoundPage';


// Páginas de Admin
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminPortfolioPage from './pages/admin/AdminPortfolioPage'; // <--- AÑADIR IMPORTACIÓN
import AdminServicesPage from './pages/admin/AdminServicesPage'

function App() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="servicios" element={<ServicesPage />} />
        <Route path="sobre-mi" element={<AboutPage />} />
        <Route path="contacto" element={<ContactPage />} />
      </Route>

      {/* Rutas de Admin */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="portfolio" element={<AdminPortfolioPage />} /> {/* <--- AÑADIR RUTA */}
        <Route path="servicios" element={<AdminServicesPage />} /> {/* <--- AÑADIR RUTA */}
        {/* Aquí irán más rutas de admin anidadas, ej:
        <Route path="servicios" element={<AdminServicesPage />} />
        */}
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;