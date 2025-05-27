// src/App.jsx
import { Routes, Route } from 'react-router-dom';

// Importar el Layout Público
import PublicLayout from './component/PublicLayout';

// Importar las páginas públicas
import HomePage from './pages/public/HomePage';
import PortfolioPage from './pages/public/PortfolioPage';
import ServicesPage from './pages/public/ServicesPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import NotFoundPage from './pages/public/NotFoundPage';

function App() {
  return (
    <Routes>
      {/* ESTA ES LA PARTE CLAVE:
          La ruta para "/" carga PublicLayout, y DENTRO de PublicLayout
          se renderizarán las rutas hijas (HomePage, PortfolioPage, etc.)
          gracias al componente <Outlet /> en PublicLayout.
      */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<HomePage />} /> {/* HomePage es la página índice para "/" */}
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="servicios" element={<ServicesPage />} />
        <Route path="sobre-mi" element={<AboutPage />} />
        <Route path="contacto" element={<ContactPage />} />
        {/* Si quieres que NotFoundPage también use el layout, muévela aquí */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Route>

      {/* Si NotFoundPage está aquí, se renderizará SIN Navbar ni Footer */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;