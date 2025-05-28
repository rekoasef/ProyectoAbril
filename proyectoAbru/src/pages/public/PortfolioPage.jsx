// src/pages/public/PortfolioPage.jsx
import React, { useState, useEffect } from 'react';
// Ya no necesitamos el Modal como componente separado si usamos la versión simple de abajo
// import Modal from '../../components/common/Modal'; 

// Helper para obtener imágenes de localStorage (debe ser la misma que en AdminPortfolioPage)
const getStoredPortfolioImages = () => {
  const images = localStorage.getItem('sevePhotographyFirebasePortfolio'); // Usar la nueva clave
  return images ? JSON.parse(images) : [];
};

// Componente Modal simple (si no usas uno común)
const ImageModal = ({ isOpen, onClose, image }) => {
  if (!isOpen || !image) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white-off rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-4 md:p-6 relative transform transition-all duration-300 scale-95 opacity-0 animate-modalShow"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="text-text-secondary hover:text-accent-script p-1 rounded-full absolute top-3 right-3 z-10 bg-white-off/80 hover:bg-beige-light"
          aria-label="Cerrar modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        {image.url ? ( // image.url es la downloadURL de Firebase
          <img
            src={image.url}
            alt={image.title || "Imagen del portfolio"}
            className="w-full h-auto rounded-md object-contain max-h-[calc(90vh-80px)]"
          />
        ) : <p>No se pudo cargar la imagen.</p>}
        <div className="mt-4 text-center md:text-left">
          <h3 className="text-xl font-serif text-accent-script">{image.title}</h3>
          {image.description && <p className="text-text-secondary text-sm mt-1">{image.description}</p>}
        </div>
      </div>
    </div>
  );
};


const PortfolioPage = () => {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [categories, setCategories] = useState(['Todos']);
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const loadedImages = getStoredPortfolioImages();
    setImages(loadedImages);
    setFilteredImages(loadedImages); // Mostrar todas al inicio
    if (loadedImages.length > 0) {
      const uniqueCategories = ['Todos', ...new Set(loadedImages.map(img => img.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } else {
      setCategories(['Todos']);
    }
  }, []);

  const handleFilter = (category) => {
    setSelectedCategory(category);
    if (category === 'Todos') {
      setFilteredImages(images);
    } else {
      setFilteredImages(images.filter(img => img.category === category));
    }
  };

  const openImageModal = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-12 min-h-[calc(100vh-20rem)]">
      <div className="text-center">
        <h1 className="editorial-title">Mi Trabajo</h1>
        <p className="text-text-secondary max-w-xl mx-auto">
          Un vistazo a las historias que he tenido el privilegio de capturar. Cada imagen es un tesoro de emociones y momentos irrepetibles.
        </p>
      </div>

      {categories.length > 1 && (
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => handleFilter(category)}
              className={`px-4 py-2 text-sm rounded-md transition-colors duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-50
                ${selectedCategory === category
                  ? 'bg-accent-script text-white-off focus:ring-accent-script'
                  : 'bg-beige-light text-text-primary hover:bg-sepia-gray-soft focus:ring-sepia-gray-soft'
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {filteredImages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredImages.map((image) => (
            <div
              key={image.id || image.firebasePath} // Usar un ID único
              className="aspect-[4/3] bg-beige-light rounded-lg overflow-hidden shadow-soft hover:shadow-soft-md transition-all duration-300 cursor-pointer group"
              onClick={() => openImageModal(image)}
            >
              {image.url ? ( // image.url es la downloadURL de Firebase
                <img
                  src={image.url}
                  alt={image.title || `Fotografía de ${image.category}`}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => {
                    console.error(`Error cargando imagen de grid (pública) para ${image.id}: ${e.target.src}`);
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-text-secondary col-span-full py-10">
          Aún no hay imágenes en el portfolio. ¡Vuelve pronto!
        </p>
      )}

      <ImageModal isOpen={isModalOpen} onClose={closeImageModal} image={selectedImage} />
    </div>
  );
};

export default PortfolioPage;
