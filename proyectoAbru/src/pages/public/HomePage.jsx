// src/pages/public/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../../component/ui/Hero';
import { Camera, Users, Heart } from 'lucide-react'; // Iconos para las tarjetas de características

const HomePage = () => {
  return (
    // Contenedor principal de la página, con espaciado entre secciones
    <div className="space-y-16 md:space-y-24 pb-10">
      <Hero /> {/* El componente Hero que ya creamos */}

      {/* Sección de Características o "Por qué elegirme" */}
      <section className="container mx-auto px-4 text-center">
        <h2 className="editorial-title mb-12">Momentos Únicos, Recuerdos Eternos</h2>
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {/* Tarjeta 1 */}
          <div className="bg-white-off p-6 rounded-lg shadow-soft hover:shadow-soft-md transition-shadow">
            <Heart size={48} className="mx-auto mb-4 text-accent-script" strokeWidth={1.5}/>
            <h3 className="font-serif text-xl text-text-primary mb-2">Pasión por Contar Historias</h3>
            <p className="text-text-secondary text-sm">
              Cada click es una oportunidad para narrar tu historia con autenticidad y belleza.
            </p>
          </div>
          {/* Tarjeta 2 */}
          <div className="bg-white-off p-6 rounded-lg shadow-soft hover:shadow-soft-md transition-shadow">
            <Camera size={48} className="mx-auto mb-4 text-accent-script" strokeWidth={1.5}/>
            <h3 className="font-serif text-xl text-text-primary mb-2">Calidad Profesional</h3>
            <p className="text-text-secondary text-sm">
              Equipo de alta gama y una mirada artística para asegurar imágenes impactantes y atemporales.
            </p>
          </div>
          {/* Tarjeta 3 */}
          <div className="bg-white-off p-6 rounded-lg shadow-soft hover:shadow-soft-md transition-shadow">
            <Users size={48} className="mx-auto mb-4 text-accent-script" strokeWidth={1.5}/>
            <h3 className="font-serif text-xl text-text-primary mb-2">Experiencia Personalizada</h3>
            <p className="text-text-secondary text-sm">
              Me dedico a conocerte y entender tus deseos para capturar tu esencia en cada fotografía.
            </p>
          </div>
        </div>
      </section>

      {/* Sección de Llamada a la Acción (CTA) a otras páginas */}
      <section className="container mx-auto px-4">
        <div className="bg-beige-light p-10 md:p-16 rounded-lg shadow-soft text-center">
          <h2 className="editorial-title mb-6">¿Lista para crear recuerdos inolvidables?</h2>
          <p className="text-text-secondary mb-8 max-w-xl mx-auto">
            Explora mis servicios o contáctame directamente para charlar sobre tu evento o sesión de fotos.
          </p>
          <div className="space-y-4 sm:space-y-0 sm:flex sm:justify-center sm:space-x-6"> {/* Ajuste para centrar botones en desktop */}
            <Link
              to="/servicios"
              className="inline-block px-8 py-3 bg-accent-script text-white-off font-sans rounded-md shadow-soft hover:bg-opacity-80 transition-all"
            >
              Ver Servicios
            </Link>
            <Link
              to="/contacto"
              className="inline-block px-8 py-3 border border-accent-script text-accent-script font-sans rounded-md shadow-soft hover:bg-accent-script hover:text-white-off transition-all"
            >
              Contactar
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;