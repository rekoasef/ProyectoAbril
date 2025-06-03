// src/components/ui/ServiceCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const ServiceCard = ({ service }) => {
  // Desestructura las propiedades del servicio, proveyendo valores por defecto si es necesario.
  const { 
    name, 
    description, 
    price, 
    equipment, 
    payment, 
    imageUrl, 
    contactLink = "/contacto" // Link por defecto si no se especifica
  } = service;

  return (
    <div className="bg-white-off rounded-lg shadow-soft overflow-hidden flex flex-col md:flex-row group transition-all duration-300 hover:shadow-soft-md">
      {/* Sección de la Imagen del Servicio (si existe imageUrl) */}
      {imageUrl && (
        <div className="md:w-2/5 md:max-w-[300px] h-64 md:h-auto overflow-hidden flex-shrink-0">
          <img
            src={imageUrl}
            alt={`Imagen representativa de ${name}`} // Texto alternativo descriptivo para la imagen
            className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
            loading="lazy" // Carga diferida para mejorar el rendimiento
            onError={(e) => {
              // Manejo de error si la imagen no se puede cargar
              console.error(`Error cargando imagen para servicio ${name}: ${e.target.src}`);
              // Opcional: se podría ocultar el div de la imagen o mostrar un placeholder
              // e.target.parentElement.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Contenedor del Contenido de Texto del Servicio */}
      {/* Este div es un flex container vertical y se expandirá si 'flex-grow' está activo 
          y hay espacio disponible (ej. si la imagen es más alta en layout de fila) */}
      <div className={`p-6 md:p-8 flex flex-col flex-grow ${imageUrl ? 'md:w-3/5' : 'w-full'}`}>
        {/* Nombre del Servicio */}
        <h3 className="font-serif text-2xl text-accent-script mb-3">{name}</h3>
        
        {/* Descripción del Servicio */}
        {/* La descripción ocupa su altura natural. */}
        <p className="text-text-secondary text-sm mb-4 leading-relaxed whitespace-pre-wrap">
          {description}
        </p>
        
        {/* Contenedor para Detalles Adicionales y Botón de Acción */}
        {/* Se eliminó 'mt-auto' para que este bloque siga directamente a la descripción.
            'pt-4' añade un padding superior para separación. */}
        <div className="pt-4"> 
          {/* Detalles del Servicio (Precio, Equipo, Formas de Pago) */}
          <div className="text-xs space-y-2 text-text-primary">
            {price && <p><strong>Precio:</strong> {price}</p>}
            {equipment && <p><strong>Equipo Principal:</strong> {equipment}</p>}
            {payment && <p><strong>Formas de Pago:</strong> {payment}</p>}
          </div>
          
          {/* Botón de Llamada a la Acción */}
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
