// src/pages/public/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Hero from '../../components/ui/Hero';
import ReviewCard from '../../components/ui/ReviewCard';
import { Camera, Users, Heart } from 'lucide-react';
// import { getStoredReviews } from '../../utils/localStorageHelpers'; // Ya no se usa para leer
import { db } from '../../firebase/firebaseConfig'; // Importar db de Firebase
import { collection, query, where, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore'; // Funciones de Firestore

// Variantes de animación (sin cambios)
const sectionFadeInVariants = { /* ... */ };
const itemFadeInUpVariants = { /* ... */ };
// (Mantén tus definiciones de variantes aquí)
// Variantes para la aparición de secciones al hacer scroll
// const sectionFadeInVariants = {
//   hidden: { opacity: 0, y: 40 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.7,
//       ease: "easeOut",
//     },
//   },
// };

// // Variantes para las tarjetas individuales o elementos dentro de una sección
// const itemFadeInUpVariants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.5,
//       ease: "easeOut",
//     },
//   },
// };


const HomePage = () => {
  const [approvedReviews, setApprovedReviews] = useState([]);
  const [totalApprovedReviewsCount, setTotalApprovedReviewsCount] = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    setLoadingReviews(true);
    const reviewsCollectionRef = collection(db, "reviews");
    // Consulta para obtener las 3 reseñas aprobadas más recientes (basado en createdAt)
    const q = query(
      reviewsCollectionRef, 
      where("approved", "==", true), 
      orderBy("createdAt", "desc"), // Ordenar por el timestamp de creación
      limit(3)
    );

    // Listener en tiempo real para las 3 reseñas de la home
    const unsubscribeHomeReviews = onSnapshot(q, (querySnapshot) => {
      const homeReviewsData = [];
      querySnapshot.forEach((doc) => {
        homeReviewsData.push({ id: doc.id, ...doc.data() });
      });
      setApprovedReviews(homeReviewsData);
      // Para el botón "Ver todos", necesitamos el conteo total de aprobadas
      // Hacemos una consulta separada sin límite para esto (o podrías manejarlo de otra forma)
    }, (error) => {
      console.error("Error fetching home reviews from Firestore: ", error);
    });

    // Consulta para obtener el conteo total de reseñas aprobadas
    const countQuery = query(reviewsCollectionRef, where("approved", "==", true));
    const unsubscribeTotalCount = onSnapshot(countQuery, (snapshot) => {
        setTotalApprovedReviewsCount(snapshot.size);
        setLoadingReviews(false);
    }, (error) => {
        console.error("Error fetching total approved reviews count: ", error);
        setLoadingReviews(false);
    });


    return () => {
      unsubscribeHomeReviews();
      unsubscribeTotalCount();
    }; // Limpiar listeners al desmontar
  }, []);

  return (
    <div className="space-y-20 md:space-y-28 pb-12 overflow-x-hidden">
      <Hero />

      {/* Sección de Características ... (sin cambios) ... */}
      <motion.section
        className="container mx-auto px-4 text-center"
        variants={sectionFadeInVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.h2
          className="editorial-title mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } }}
          viewport={{ once: true, amount: 0.5 }}
        >
          Momentos Únicos, Recuerdos Eternos
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          <motion.div
            className="bg-white-off p-6 rounded-lg shadow-soft hover:shadow-soft-md transition-shadow"
            variants={itemFadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
          >
            <Heart size={48} className="mx-auto mb-4 text-accent-script" strokeWidth={1.5}/>
            <h3 className="font-serif text-xl text-text-primary mb-2">Pasión por Contar Historias</h3>
            <p className="text-text-secondary text-sm">
              Cada click es una oportunidad para narrar tu historia con autenticidad y belleza.
            </p>
          </motion.div>
          <motion.div
            className="bg-white-off p-6 rounded-lg shadow-soft hover:shadow-soft-md transition-shadow"
            variants={itemFadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4, delay: 0.15 }}
          >
            <Camera size={48} className="mx-auto mb-4 text-accent-script" strokeWidth={1.5}/>
            <h3 className="font-serif text-xl text-text-primary mb-2">Calidad Profesional</h3>
            <p className="text-text-secondary text-sm">
              Equipo de alta gama y una mirada artística para asegurar imágenes impactantes y atemporales.
            </p>
          </motion.div>
          <motion.div
            className="bg-white-off p-6 rounded-lg shadow-soft hover:shadow-soft-md transition-shadow"
            variants={itemFadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4, delay: 0.3 }}
          >
            <Users size={48} className="mx-auto mb-4 text-accent-script" strokeWidth={1.5}/>
            <h3 className="font-serif text-xl text-text-primary mb-2">Experiencia Personalizada</h3>
            <p className="text-text-secondary text-sm">
              Me dedico a conocerte y entender tus deseos para capturar tu esencia en cada fotografía.
            </p>
          </motion.div>
        </div>
      </motion.section>


      {/* Sección de Reseñas */}
      {loadingReviews && <p className="text-center text-text-secondary">Cargando testimonios...</p>}
      {!loadingReviews && approvedReviews.length > 0 && (
        <motion.section
          className="container mx-auto px-4"
          variants={sectionFadeInVariants}
          initial="hidden"
          whileInView="visible" // O animate="visible" si quieres que siempre se anime al cargar
          viewport={{ once: true, amount: 0.15 }}
        >
          <motion.h2
            className="editorial-title text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } }}
            viewport={{ once: true, amount: 0.5 }}
          >
            Lo que dicen mis clientes
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {approvedReviews.map((review, index) => (
              <motion.div
                key={review.id}
                variants={itemFadeInUpVariants}
                initial="hidden"
                whileInView="visible" // Animar cada tarjeta cuando entra en vista
                viewport={{ once: true, amount: 0.3, delay: index * 0.2 }}
              >
                <ReviewCard review={review} />
              </motion.div>
            ))}
          </div>
          
          {totalApprovedReviewsCount > 3 && (
             <motion.div 
                className="text-center mt-12 md:mt-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: (approvedReviews.length * 0.2) + 0.2 }} // Delay después de la última tarjeta
                viewport={{ once: true, amount: 0.5 }}
            >
                <Link 
                    to="/testimonios"
                    className="inline-block px-8 py-3 border border-accent-script text-accent-script font-sans text-sm rounded-md hover:bg-accent-script hover:text-white-off transition-all duration-300 ease-in-out shadow-soft hover:shadow-md"
                >
                    Ver todos los testimonios
                </Link>
            </motion.div>
          )}
        </motion.section>
      )}
      {!loadingReviews && approvedReviews.length === 0 && totalApprovedReviewsCount === 0 && (
        <div className="container mx-auto px-4 text-center">
            <p className="text-text-secondary">Aún no hay testimonios para mostrar.</p>
        </div>
      )}


      {/* Sección de Llamada a la Acción (CTA) ... (sin cambios) ... */}
      <motion.section
        className="container mx-auto px-4"
        variants={sectionFadeInVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="bg-beige-light p-10 md:p-16 rounded-lg shadow-soft text-center overflow-hidden">
          <motion.h2 
            className="editorial-title mb-6" 
            variants={itemFadeInUpVariants}
            initial="hidden"
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
              className="inline-block px-8 py-3 border border-accent-script text-accent-script font-sans rounded-md shadow-soft hover:bg-accent-script hover:text-white-off transition-all ml-0 sm:ml-4 mt-3 sm:mt-0"
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
