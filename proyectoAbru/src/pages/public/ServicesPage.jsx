// src/pages/public/ServicesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ServiceCard from '../../components/ui/ServiceCard'; // Asegúrate que la ruta sea correcta
import { getStoredServices } from '../../utils/localStorageHelpers'; // Importar desde el helper

const ServicesPage = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const loadedServices = getStoredServices();
    // Opcional: Ordenar los servicios por nombre o algún otro criterio
    setServices(loadedServices.sort((a, b) => a.name.localeCompare(b.name)));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 space-y-12 min-h-[calc(100vh-20rem)]">
      <div className="text-center">
        <h1 className="editorial-title">Mis Servicios</h1>
        <p className="text-text-secondary max-w-xl mx-auto">
          Ofrezco una variedad de paquetes fotográficos diseñados para capturar tus momentos más especiales con profesionalismo y un toque artístico. Descubre cómo puedo ayudarte a preservar tus recuerdos.
        </p>
      </div>

      {services.length > 0 ? (
        <div className="space-y-8 md:space-y-12 max-w-4xl mx-auto">
          {services.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
            <p className="text-text-secondary mb-6">
                Actualmente no hay servicios detallados. ¡Vuelve pronto o contáctame para más información!
            </p>
            <Link
                to="/contacto"
                className="inline-block px-8 py-3 bg-accent-script text-white-off font-sans rounded-md shadow-soft hover:bg-opacity-80 transition-all"
              >
                Consultar Ahora
            </Link>
        </div>
      )}

      {services.length > 0 && ( // Solo mostrar esta sección si hay servicios
          <div className="text-center pt-12 mt-12 border-t border-sepia-gray-soft/20">
              <h2 className="font-serif text-2xl text-text-primary mb-4">¿No encuentras lo que buscas?</h2>
              <p className="text-text-secondary mb-6 max-w-lg mx-auto">
                  Cada evento y sesión es única. Si tienes una idea particular o necesitas un paquete a medida, no dudes en contactarme. ¡Me encantaría ayudarte a hacerlo realidad!
              </p>
              <Link
                to="/contacto"
                className="inline-block px-8 py-3 bg-accent-script text-white-off font-sans rounded-md shadow-soft hover:bg-opacity-80 transition-all"
              >
                Hablemos de tu Proyecto
              </Link>
          </div>
      )}
    </div>
  );
};

export default ServicesPage;
