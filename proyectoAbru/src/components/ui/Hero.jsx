// src/components/ui/Hero.jsx
import React from 'react';
import { Link } from 'react-router-dom';
// Opcional: si quieres una imagen de fondo para el hero
// Asegúrate de tener una imagen en la ruta especificada o comenta/elimina estas líneas.
// import heroBackgroundImage from '../../assets/images/hero-background.jpg';

const Hero = () => {
  return (
    <section
      className="bg-beige-light py-20 md:py-32 text-center shadow-soft rounded-lg"
      // Opcional: Estilo para imagen de fondo. Si la usas, descomenta la importación de arriba también.
      // style={{
      //   backgroundImage: `linear-gradient(rgba(250, 240, 230, 0.7), rgba(250, 240, 230, 0.7)), url(${heroBackgroundImage})`, // Ejemplo con un overlay de color
      //   backgroundSize: 'cover',
      //   backgroundPosition: 'center',
      // }}
    >
      <div className="container mx-auto px-4">
        {/* Logo/Nombre de la Fotógrafa */}
        {/* Si tienes un logo SVG/PNG, podrías usar una etiqueta <img> aquí en lugar de solo texto, 
            o mantener el texto estilizado como el logo. */}
        <h1 className="script-logo text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-4 md:mb-6">
          SeVe Photography
        </h1>

        {/* Eslogan o Texto de Enfoque */}
        <p className="font-sans text-xl md:text-2xl text-text-secondary mb-8 md:mb-10 max-w-2xl mx-auto">
          Capturando la esencia de tus momentos más preciados, con arte y emoción.
          {/* Otras opciones de texto:
              "Capturando emociones reales, momentos inolvidables."
              "Fotografía que cuenta tu historia con autenticidad y estilo."
          */}
        </p>

        {/* Botón al Portfolio */}
        <Link
          to="/portfolio"
          className="inline-block px-8 py-3 bg-accent-script text-white-off font-sans text-lg rounded-md shadow-soft hover:bg-opacity-80 hover:shadow-soft-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent-script focus:ring-offset-2 focus:ring-offset-beige-light"
        >
          Descubre Mi Trabajo
        </Link>
      </div>
    </section>
  );
};

export default Hero;