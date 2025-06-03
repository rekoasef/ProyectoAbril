// src/pages/public/ServicesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ServiceCard from '../../components/ui/ServiceCard'; // Asegúrate que la ruta sea correcta
// Importaciones de Firebase
import { db } from '../../firebase/firebaseConfig';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

// Ya no se importa getStoredServices de localStorageHelpers
// import { getStoredServices } from '../../utils/localStorageHelpers'; 

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Estado para feedback de carga

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      try {
        const servicesCollectionRef = collection(db, "services_items");
        // Ordenar los servicios, por ejemplo, por nombre.
        // Si tienes un campo 'order' o 'createdAt', podrías usarlo también.
        const q = query(servicesCollectionRef, orderBy("name", "asc")); 
        
        const querySnapshot = await getDocs(q);
        const loadedServices = [];
        querySnapshot.forEach((doc) => {
          loadedServices.push({ id: doc.id, ...doc.data() });
        });
        
        setServices(loadedServices);
      } catch (error) {
        console.error("Error cargando servicios desde Firestore: ", error);
        // Aquí podrías establecer un estado de error para mostrar un mensaje al usuario
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []); // El array vacío asegura que se ejecute solo al montar

  return (
    <div className="container mx-auto px-4 py-8 space-y-12 min-h-[calc(100vh-20rem)]">
      <div className="text-center">
        <h1 className="editorial-title">Mis Servicios</h1>
        <p className="text-text-secondary max-w-xl mx-auto">
          Ofrezco una variedad de paquetes fotográficos diseñados para capturar tus momentos más especiales con profesionalismo y un toque artístico. Descubre cómo puedo ayudarte a preservar tus recuerdos.
        </p>
      </div>

      {/* Indicador de Carga */}
      {isLoading && (
        <p className="text-center text-text-secondary py-10">Cargando servicios...</p>
      )}

      {/* Listado de Servicios */}
      {!isLoading && services.length > 0 ? (
        <div className="space-y-8 md:space-y-12 max-w-4xl mx-auto">
          {services.map(service => (
            // El componente ServiceCard debería funcionar igual si la estructura de datos es la misma
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        !isLoading && ( // Solo mostrar si no está cargando y no hay servicios
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
        )
      )}

      {/* Sección de "No encuentras lo que buscas" */}
      {!isLoading && services.length > 0 && ( 
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
