// src/components/ui/Hero.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'; // Importar motion

// Opcional: si quieres una imagen de fondo para el hero
// import heroBackgroundImage from '../../assets/images/hero-background.jpg';

// Variantes para la animación del contenedor principal de la sección Hero
const heroContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.1, // Un pequeño delay antes de que la sección misma aparezca
      staggerChildren: 0.8, // Retraso entre la animación de los hijos directos
      delayChildren: 0.5,   // Retraso antes de que los hijos empiecen a animar (después del delay del contenedor)
    },
  },
};

// Variantes para los elementos hijos (título, párrafo, botón)
const itemVariants = {
  hidden: { y: 20, opacity: 0 }, // Empieza 20px abajo e invisible
  visible: {
    y: 0, // Termina en su posición original
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut", // Un easing suave
    },
  },
};

const Hero = () => {
  return (
    <motion.section
      className="bg-beige-light py-20 md:py-32 text-center shadow-soft rounded-lg overflow-hidden" // overflow-hidden para evitar saltos por elementos que empiezan fuera
      // Opcional: Estilo para imagen de fondo.
      // style={{
      //   backgroundImage: `linear-gradient(rgba(250, 240, 230, 0.7), rgba(250, 240, 230, 0.7)), url(${heroBackgroundImage})`,
      //   backgroundSize: 'cover',
      //   backgroundPosition: 'center',
      // }}
      variants={heroContainerVariants}
      initial="hidden"
      animate="visible" // Animar cuando el componente Hero se monta
    >
      {/* No es necesario un div contenedor extra aquí si los hijos directos son los elementos animados */}
      <motion.h1
        className="script-logo text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-4 md:mb-6 container mx-auto px-4" // Añadido container y padding aquí para asegurar que el texto no se corte
        variants={itemVariants}
      >
        SeVe Photography
      </motion.h1>

      <motion.p
        className="font-sans text-xl md:text-2xl text-text-secondary mb-8 md:mb-10 max-w-2xl mx-auto container px-4" // Añadido container y padding
        variants={itemVariants}
      >
        Capturando la esencia de tus momentos más preciados, con arte y emoción.
      </motion.p>

      <motion.div // Envolvemos el Link para que herede la animación de itemVariants
        className="container mx-auto px-4" // Asegurar que el botón también esté dentro del flujo del contenedor
        variants={itemVariants}
      >
        <Link
          to="/portfolio"
          className="inline-block px-8 py-3 bg-accent-script text-white-off font-sans text-lg rounded-md shadow-soft hover:bg-opacity-80 hover:shadow-soft-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent-script focus:ring-offset-2 focus:ring-offset-beige-light"
        >
          Descubre Mi Trabajo
        </Link>
      </motion.div>
    </motion.section>
  );
};

export default Hero;
