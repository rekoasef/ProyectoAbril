// src/pages/public/ServicesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ServiceCard from '../../components/ui/ServiceCard'; // Verifica la ruta

// --- COMIENZA A EDITAR AQUÍ CON TUS PROPIOS SERVICIOS ---
// DATOS DE EJEMPLO - Reemplaza con tus propios servicios.
// Si tienes imágenes representativas para cada servicio en Cloudinary, añade sus publicId.
const sampleServices = [
  {
    id: 'servicio-15-desayuno',
    name: 'Cobertura Desayuno 15 Años',
    description: 'Capturamos la alegría y emoción del desayuno de tus 15, desde los preparativos íntimos en casa hasta el brindis familiar. Un recuerdo especial y diferente, lleno de espontaneidad y momentos genuinos.',
    price: 'Consultar presupuesto personalizado',
    equipment: 'Cámara Full Frame, Lentes luminosos (Prime), Iluminación portátil profesional, Micrófono ambiental (opcional para video highlights).',
    payment: 'Transferencia Bancaria, Mercado Pago, Efectivo (con seña previa). Planes de pago disponibles.',
    imagePublicId: 'portfolio/servicios/desayuno_15_muestra' // EJEMPLO: Sube una imagen a Cloudinary/portfolio/servicios/
  },
  {
    id: 'servicio-boda-completa',
    name: 'Cobertura Completa de Boda "Momentos Inolvidables"',
    description: 'Desde los preparativos de los novios, ceremonia civil y religiosa, hasta la recepción y fiesta. Nos enfocamos en capturar cada detalle, emoción y la atmósfera única de su gran día. Incluye sesión de fotos de pareja post-ceremonia.',
    price: 'Desde $XXX.XXX (Paquetes adaptables)',
    equipment: '2 Cámaras Full Frame/Mirrorless, Variedad de lentes (zoom y prime), Drone para tomas aéreas (sujeto a locación), Iluminación profesional para fiesta, Estabilizadores.',
    payment: 'Contrato con seña. Cuotas personalizadas. Transferencia, Mercado Pago.',
    imagePublicId: 'portfolio/servicios/boda_completa_muestra' // EJEMPLO
  },
  {
    id: 'servicio-sesion-retrato',
    name: 'Sesión de Retratos "Tu Esencia"',
    description: 'Una sesión fotográfica personalizada en exteriores o estudio, diseñada para capturar tu personalidad, belleza y esencia. Ideal para books personales, profesionales, o simplemente para tener un recuerdo artístico de ti mismo/a.',
    price: '$XX.XXX (Incluye X fotos editadas en alta calidad)',
    equipment: 'Cámara profesional, Lentes de retrato (85mm, 50mm), Reflectores, Iluminación de estudio (opcional).',
    payment: 'Seña para reservar fecha. Resto el día de la sesión.',
    imagePublicId: 'portfolio/servicios/sesion_retrato_muestra' // EJEMPLO
  },
  // --- FIN DE LA EDICIÓN DE SERVICIOS ---
  // Añade más servicios aquí
];
// --- FIN DE DATOS DE EJEMPLO ---


const ServicesPage = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    // En una aplicación real, estos datos podrían venir de una API
    // o ser gestionados desde el panel de admin y guardados en localStorage/backend.
    // Por ahora, usamos los datos de ejemplo.
    // Si quieres persistencia básica sin backend, podrías guardar esto en localStorage
    // y leerlo aquí, y el panel de admin lo modificaría.
    setServices(sampleServices);
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
        <div className="space-y-8 md:space-y-12 max-w-4xl mx-auto"> {/* Centra las tarjetas */}
          {services.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <p className="text-center text-text-secondary py-10">
          Actualmente no hay servicios detallados. ¡Vuelve pronto o contáctame para más información!
        </p>
      )}

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

    </div>
  );
};

export default ServicesPage;