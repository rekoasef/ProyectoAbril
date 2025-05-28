// src/pages/public/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'; // Importar motion
import Hero from '../../components/ui/Hero'; // El Hero ya tiene sus animaciones
import { Camera, Users, Heart } from 'lucide-react';

// Variantes para la aparición de secciones al hacer scroll
const sectionFadeInVariants = {
  hidden: { opacity: 0, y: 40 }, // Empieza un poco abajo y transparente
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
      // staggerChildren no es necesario aquí si animamos los hijos individualmente con whileInView
    },
  },
};

// Variantes para las tarjetas individuales o elementos dentro de una sección
const itemFadeInUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const HomePage = () => {
  return (
    <div className="space-y-20 md:space-y-28 pb-12 overflow-x-hidden"> {/* Aumentado el espacio y overflow-x-hidden */}
      <Hero />

      {/* Sección de Características o "Por qué elegirme" */}
      <motion.section
        className="container mx-auto px-4 text-center"
        variants={sectionFadeInVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }} // Anima cuando el 20% de la sección es visible
      >
        <motion.h2
          className="editorial-title mb-12 md:mb-16"
          // Aplicar una variante simple de aparición para el título de la sección
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } }}
          viewport={{ once: true, amount: 0.5 }}
        >
          Momentos Únicos, Recuerdos Eternos
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {/* Tarjeta 1 */}
          <motion.div
            className="bg-white-off p-6 rounded-lg shadow-soft hover:shadow-soft-md transition-shadow"
            variants={itemFadeInUpVariants} // Usamos la variante para ítems
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }} // Anima cuando el 40% de la tarjeta es visible
          >
            <Heart size={48} className="mx-auto mb-4 text-accent-script" strokeWidth={1.5}/>
            <h3 className="font-serif text-xl text-text-primary mb-2">Pasión por Contar Historias</h3>
            <p className="text-text-secondary text-sm">
              Cada click es una oportunidad para narrar tu historia con autenticidad y belleza.
            </p>
          </motion.div>
          {/* Tarjeta 2 */}
          <motion.div
            className="bg-white-off p-6 rounded-lg shadow-soft hover:shadow-soft-md transition-shadow"
            variants={itemFadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4, delay: 0.15 }} // Pequeño delay para efecto escalonado
          >
            <Camera size={48} className="mx-auto mb-4 text-accent-script" strokeWidth={1.5}/>
            <h3 className="font-serif text-xl text-text-primary mb-2">Calidad Profesional</h3>
            <p className="text-text-secondary text-sm">
              Equipo de alta gama y una mirada artística para asegurar imágenes impactantes y atemporales.
            </p>
          </motion.div>
          {/* Tarjeta 3 */}
          <motion.div
            className="bg-white-off p-6 rounded-lg shadow-soft hover:shadow-soft-md transition-shadow"
            variants={itemFadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4, delay: 0.3 }} // Mayor delay
          >
            <Users size={48} className="mx-auto mb-4 text-accent-script" strokeWidth={1.5}/>
            <h3 className="font-serif text-xl text-text-primary mb-2">Experiencia Personalizada</h3>
            <p className="text-text-secondary text-sm">
              Me dedico a conocerte y entender tus deseos para capturar tu esencia en cada fotografía.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Sección de Llamada a la Acción (CTA) a otras páginas */}
      <motion.section
        className="container mx-auto px-4"
        variants={sectionFadeInVariants} // Reutilizamos las variantes de sección
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="bg-beige-light p-10 md:p-16 rounded-lg shadow-soft text-center overflow-hidden"> {/* overflow-hidden para los hijos */}
          <motion.h2 
            className="editorial-title mb-6" 
            variants={itemFadeInUpVariants}
            initial="hidden" // Cada elemento hijo de la sección CTA tendrá su propio control whileInView
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
          >
            ¿Lista para crear recuerdos inolvidables?
          </motion.h2>
          <motion.p 
            className="text-text-secondary mb-8 max-w-xl mx-auto" 
            variants={itemFadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5, delay:0.1 }}
          >
            Explora mis servicios o contáctame directamente para charlar sobre tu evento o sesión de fotos.
          </motion.p>
          <motion.div 
            className="space-y-4 sm:space-y-0 sm:flex sm:justify-center sm:space-x-6" 
            variants={itemFadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5, delay:0.2 }}
          >
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
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;
