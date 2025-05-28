// src/components/ui/ServiceCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const ServiceCard = ({ service }) => {
  const { name, description, price, equipment, payment, imageUrl, contactLink = "/contacto" } = service;

  return (
    <div className="bg-white-off rounded-lg shadow-soft overflow-hidden flex flex-col md:flex-row group transition-all duration-300 hover:shadow-soft-md">
      {imageUrl && (
        <div className="md:w-2/5 md:max-w-[300px] h-64 md:h-auto overflow-hidden flex-shrink-0"> {/* Añadido flex-shrink-0 y md:max-w */}
          <img
            src={imageUrl}
            alt={`Imagen representativa de ${name}`}
            className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              console.error(`Error cargando imagen para servicio ${name}: ${e.target.src}`);
              // Opcional: ocultar el div de la imagen si falla la carga
              // e.target.parentElement.style.display = 'none';
            }}
          />
        </div>
      )}
      {/* Contenedor del texto, se expandirá para llenar el espacio */}
      <div className={`p-6 md:p-8 flex flex-col flex-grow ${imageUrl ? 'md:w-3/5' : 'w-full'}`}>
        <h3 className="font-serif text-2xl text-accent-script mb-3">{name}</h3>
        {/* La descripción ya no tiene flex-grow, ocupará su altura natural */}
        <p className="text-text-secondary text-sm mb-4 leading-relaxed whitespace-pre-wrap">
          {description}
        </p>
        {/* Contenedor para los detalles y el botón, que se empujará hacia abajo */}
        <div className="mt-auto pt-4"> {/* mt-auto empuja este bloque hacia abajo, pt-4 para espacio arriba */}
          <div className="text-xs space-y-2 text-text-primary">
            {price && <p><strong>Precio:</strong> {price}</p>}
            {equipment && <p><strong>Equipo Principal:</strong> {equipment}</p>}
            {payment && <p><strong>Formas de Pago:</strong> {payment}</p>}
          </div>
          <div className="mt-6">
            <Link
              to={contactLink}
              className="inline-block px-6 py-2.5 bg-accent-script text-white-off font-sans text-sm rounded-md shadow-soft hover:bg-opacity-80 transition-colors"
            >
              Consultar / Contratar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
