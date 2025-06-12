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
import TestimonialsPage from './pages/public/TestimonialsPage';

// Páginas de Admin
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminPortfolioPage from './pages/admin/AdminPortfolioPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';

function App() {
  return (
    <Routes>
      {/* Rutas Públicas: envueltas por el PublicLayout */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="servicios" element={<ServicesPage />} />
        <Route path="sobre-mi" element={<AboutPage />} />
        <Route path="contacto" element={<ContactPage />} />
        <Route path="testimonios" element={<TestimonialsPage />} />
      </Route>

      {/* --- Rutas de Admin --- */}
      {/* 1. La ruta de login es pública y no necesita protección */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      
      {/* 2. El resto de las rutas de admin están anidadas y protegidas */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* Estas rutas se renderizarán DENTRO de AdminLayout */}
        <Route index element={<AdminDashboardPage />} />
        <Route path="portfolio" element={<AdminPortfolioPage />} />
        <Route path="servicios" element={<AdminServicesPage />} />
        <Route path="reseñas" element={<AdminReviewsPage />} />
      </Route>

      {/* Ruta global para páginas no encontradas */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
