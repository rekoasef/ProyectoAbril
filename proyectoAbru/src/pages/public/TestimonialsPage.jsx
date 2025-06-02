// src/pages/public/TestimonialsPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReviewCard from '../../components/ui/ReviewCard'; // Asegúrate que la ruta sea correcta
import ReviewSubmissionForm from '../../components/ui/ReviewSubmissionForm'; // Asegúrate que la ruta sea correcta
import { db } from '../../firebase/firebaseConfig'; // Importar db de Firebase
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'; // Funciones de Firestore

// Variantes para la aparición de la sección y las tarjetas
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }, // No staggerChildren aquí, se maneja por item o por whileInView
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const formSectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: "easeOut", delay: 0.4 } 
    }
};

const TestimonialsPage = () => {
  const [approvedReviews, setApprovedReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    setLoadingReviews(true);
    const reviewsCollectionRef = collection(db, "reviews");
    // Consulta para obtener TODAS las reseñas aprobadas, ordenadas por 'createdAt' (o 'date' si prefieres y es consistente)
    // Asegúrate que el campo por el que ordenas exista en los documentos que quieres que aparezcan.
    // Si 'createdAt' es un Timestamp, el orden será cronológico.
    const q = query(
      reviewsCollectionRef, 
      where("approved", "==", true), 
      orderBy("createdAt", "desc") // Ordenar por el timestamp de creación
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reviewsData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Formatear la fecha para ReviewCard si es necesario
        let displayDate = data.date; // El que el admin puede editar
        if (data.createdAt?.toDate && !data.date) { // Si no hay 'date' del admin, usar 'createdAt'
            displayDate = new Date(data.createdAt.toDate()).toISOString().split('T')[0];
        }
        reviewsData.push({ 
            id: doc.id, 
            ...data,
            date: displayDate // Asegurar que 'date' se pase a ReviewCard
        });
      });
      console.log("TestimonialsPage - Reseñas APROBADAS cargadas de Firestore:", reviewsData);
      setApprovedReviews(reviewsData);
      setLoadingReviews(false);
    }, (error) => {
      console.error("Error fetching testimonials from Firestore: ", error);
      setLoadingReviews(false);
    });

    return () => unsubscribe(); // Limpiar listener al desmontar
  }, []); // Se ejecuta solo una vez al montar

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 min-h-[calc(100vh-15rem)]">
      <motion.div // Contenedor principal para la animación de la sección de título y grid
        initial="hidden"
        animate="visible" 
        variants={sectionVariants}
      >
        <h1 className="editorial-title text-center mb-12 md:mb-16">Lo que Mis Clientes Opinan</h1>

        {loadingReviews && <p className="text-center text-text-secondary">Cargando testimonios...</p>}
        {!loadingReviews && approvedReviews.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            // Para animar los hijos en secuencia si la sección principal ya está visible
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            initial="hidden" // Heredado de sectionVariants si no se especifica
            animate="visible" // Heredado de sectionVariants si no se especifica
          >
            {approvedReviews.map((review, index) => (
              <motion.div 
                key={review.id} 
                variants={itemVariants}
                // initial, animate son heredados si están en el motion.div padre (el grid)
                // Si el grid no es motion, entonces estos initial/animate se aplican directamente:
                // initial="hidden" 
                // animate="visible"
                // transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }} // Stagger manual
              >
                <ReviewCard review={review} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          !loadingReviews && <motion.p 
            className="text-center text-text-secondary"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }} // Un pequeño delay
          >
            Aún no hay testimonios para mostrar. ¡Vuelve pronto o sé el primero en dejar el tuyo!
          </motion.p>
        )}
      </motion.div>
      
      {/* Sección para el formulario de nueva reseña */}
      <motion.div
        className="mt-16 md:mt-24 pt-10 border-t border-sepia-gray-soft/30"
        variants={formSectionVariants} // Usa una variante específica para esta sección
        initial="hidden"
        whileInView="visible" // Animar cuando entra en vista
        viewport={{ once: true, amount: 0.2 }}
      >
        <h2 
            className="editorial-title text-center mb-8"
        >
            Comparte tu Experiencia
        </h2 >
        <p 
            className="text-center text-text-secondary max-w-xl mx-auto mb-10"
        >
            Si has trabajado conmigo, ¡me encantaría conocer tu opinión! Tu reseña ayuda a otros a conocerme mejor.
        </p>
        <ReviewSubmissionForm />
      </motion.div>
    </div>
  );
};

export default TestimonialsPage;
