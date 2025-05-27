import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="text-center p-20 min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-6xl font-bold text-accent-script mb-4">404</h1>
      <h2 className="editorial-title text-4xl mb-6">Página No Encontrada</h2>
      <p className="text-text-secondary mb-8">
        Lo sentimos, la página que buscas no existe o fue movida.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-accent-script text-white-off font-sans rounded-md shadow-soft hover:bg-opacity-80 transition-all"
      >
        Volver al Inicio
      </Link>
    </div>
  );
};
export default NotFoundPage;