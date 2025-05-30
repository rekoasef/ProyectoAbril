// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Páginas Públicas
import HomePage from './pages/public/HomePage';
import PortfolioPage from './pages/public/PortfolioPage';
import ServicesPage from './pages/public/ServicesPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import NotFoundPage from './pages/public/NotFoundPage';

// Páginas de Admin
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminPortfolioPage from './pages/admin/AdminPortfolioPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage'; // Importar la nueva página de reseñas

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
        <Route path="portfolio" element={<AdminPortfolioPage />} />
        <Route path="servicios" element={<AdminServicesPage />} />
        <Route path="reseñas" element={<AdminReviewsPage />} /> {/* Ruta para la gestión de reseñas */}
      </Route>

      {/* Ruta global para páginas no encontradas */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
