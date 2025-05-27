// src/pages/public/PortfolioPage.jsx
import React, { useState, useEffect } from 'react';
import ImageCard from '../../component/ui/ImageCard'; // Verifica esta ruta
import Modal from '../../component/Modal';     // Verifica esta ruta
import { AdvancedImage, responsive, placeholder } from '@cloudinary/react';
import { Cloudinary } from "@cloudinary/url-gen";
import { limitFit } from "@cloudinary/url-gen/actions/resize";
import { quality, format } from "@cloudinary/url-gen/actions/delivery";
import { CLOUDINARY_CLOUD_NAME } from '../../utils/cloudinaryConfig'; // Verifica esta ruta

// Inicializa Cloudinary con tu cloud name
const cld = new Cloudinary({
  cloud: {
    cloudName: CLOUDINARY_CLOUD_NAME // Asegúrate que CLOUDINARY_CLOUD_NAME esté bien configurado
  }
});

// --- EMPieza a EDITAR AQUÍ con tus PROPIOS DATOS ---
// DATOS DE EJEMPLO - Reemplaza con tus propios Public IDs y detalles.
// Sube tus imágenes a Cloudinary y usa sus Public IDs.
// Asegúrate que los publicId coincidan con lo que tienes en Cloudinary.
const samplePortfolioImages = [
  { publicId: 'portfolio/bodas/boda_ejemplo_1', category: 'Bodas', title: 'Atardecer Romántico', description: 'Pareja disfrutando de un hermoso atardecer en su día especial.' },
  { publicId: 'portfolio/quince/quince_ejemplo_1', category: '15 Años', title: 'Sueños de Juventud', description: 'Celebrando una etapa mágica llena de alegría e ilusión.' },
  { publicId: 'portfolio/retratos/retrato_ejemplo_1', category: 'Retratos', title: 'Mirada Intensa', description: 'Un retrato que captura la esencia y la personalidad del sujeto.' },
  { publicId: 'portfolio/bodas/boda_ejemplo_2', category: 'Bodas', title: 'Detalles Preciosos', description: 'Los pequeños detalles que hacen único un día de boda.' },
  { publicId: 'portfolio/eventos/evento_ejemplo_1', category: 'Eventos', title: 'Celebración Familiar', description: 'Cobertura de un evento familiar, capturando sonrisas y momentos.' },
  { publicId: 'portfolio/retratos/retrato_ejemplo_2', category: 'Retratos', title: 'Sonrisa Contagiosa', description: 'La alegría reflejada en una sonrisa genuina y espontánea.' },
  // --- TERMINA DE EDITAR AQUÍ ---
  // Puedes añadir más objetos de imagen aquí, siguiendo el mismo formato.
  // Ejemplo:
  // { publicId: 'tu_carpeta_cloud/tu_imagen', category: 'TuCategoría', title: 'TuTítulo', description: 'TuDescripción' },
];
// --- FIN DE LA SECCIÓN DE DATOS DE EJEMPLO ---


const PortfolioPage = () => {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [categories, setCategories] = useState(['Todos']);
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (samplePortfolioImages.length === 0) {
        console.warn("No hay imágenes de ejemplo configuradas en PortfolioPage.jsx. Por favor, añade tus Public IDs.");
    }
    if (!CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME === 'TU_CLOUD_NAME_AQUI') {
        console.error("CLOUDINARY_CLOUD_NAME no está configurado en cloudinaryConfig.js. Las imágenes no se cargarán.");
    }

    setImages(samplePortfolioImages);
    setFilteredImages(samplePortfolioImages);
    const uniqueCategories = ['Todos', ...new Set(samplePortfolioImages.map(img => img.category).filter(Boolean))];
    setCategories(uniqueCategories);
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

  const modalImageTransformation = selectedImage ?
    cld.image(selectedImage.publicId)
       .resize(limitFit().width(1200).height(800))
       .delivery(quality('auto'))
       .delivery(format('auto'))
    : null;

  return (
    <div className="container mx-auto px-4 py-8 space-y-12 min-h-[calc(100vh-20rem)]"> {/* min-h para empujar footer */}
      <div className="text-center">
        <h1 className="editorial-title">Mi Trabajo</h1>
        <p className="text-text-secondary max-w-xl mx-auto">
          Un vistazo a las historias que he tenido el privilegio de capturar. Cada imagen es un tesoro de emociones y momentos irrepetibles.
        </p>
      </div>

      {/* Filtros de Categoría */}
      {categories.length > 1 && ( // Solo mostrar filtros si hay más que "Todos"
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

      {/* Grid de Imágenes */}
      {filteredImages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredImages.map((image) => (
            <ImageCard
              key={image.publicId}
              publicId={image.publicId}
              alt={image.title || `Imagen de ${image.category}`}
              onClick={() => openImageModal(image)}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-text-secondary col-span-full py-10">
          Actualmente no hay imágenes para mostrar en esta categoría o aún no se han cargado.
          {selectedCategory === 'Todos' && images.length === 0 && " Por favor, configura las imágenes en el código."}
        </p>
      )}

      {/* Modal para la Imagen */}
      {selectedImage && modalImageTransformation && (
        <Modal isOpen={isModalOpen} onClose={closeImageModal} title={selectedImage.title}>
          <AdvancedImage
            cldImg={modalImageTransformation}
            plugins={[responsive({ steps: [400, 800, 1200] }), placeholder({mode: 'blur'})]}
            className="w-full h-auto rounded-md object-contain max-h-[calc(90vh-100px)]" // Ajusta max-h para el contenido del modal
            alt={selectedImage.title || "Imagen del portfolio"}
          />
          {selectedImage.description && (
            <p className="text-text-secondary mt-4 text-sm">{selectedImage.description}</p>
          )}
        </Modal>
      )}
    </div>
  );
};

export default PortfolioPage;