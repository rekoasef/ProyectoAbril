// src/pages/public/PortfolioPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
// Importaciones de Firebase
import { db } from '../../firebase/firebaseConfig';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  getCountFromServer,
  startAfter,
  endBefore,
  where
} from 'firebase/firestore';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Componente Modal
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
        {/* Usar originalUrl para el modal */}
        {image.originalUrl ? ( 
          <img
            src={image.originalUrl}
            alt={image.title || "Imagen del portfolio"}
            className="w-full h-auto rounded-md object-contain max-h-[calc(90vh-80px)]"
          />
        ) : <p>No se pudo cargar la imagen original.</p>}
        <div className="mt-4 text-center md:text-left">
          <h3 className="text-xl font-serif text-accent-script">{image.title}</h3>
          {/* {image.description && <p className="text-text-secondary text-sm mt-1">{image.description}</p>} */}
        </div>
      </div>
    </div>
  );
};


const PortfolioPage = () => {
  const [images, setImages] = useState([]); 
  const [categories, setCategories] = useState(['Todos']);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true); 
  const [isFetchingPage, setIsFetchingPage] = useState(false);

  const ITEMS_PER_PAGE = 12; 
  const [currentPage, setCurrentPage] = useState(1);
  
  const [lastVisibleDoc, setLastVisibleDoc] = useState(null); 
  const [firstVisibleDoc, setFirstVisibleDoc] = useState(null); 
  const [pageFirstDocHistory, setPageFirstDocHistory] = useState([]); 
  const [totalImageCount, setTotalImageCount] = useState(0);

  const getBaseQuery = useCallback(() => {
    let q = collection(db, "portfolio_items");
    if (selectedCategory !== 'Todos') {
      q = query(q, where("category", "==", selectedCategory));
    }
    return q;
  }, [selectedCategory]);

  const loadImages = useCallback(async (pageDirection = 'initial') => {
    if (isFetchingPage && pageDirection !== 'initial_category_change') return;
    
    if (pageDirection !== 'initial_category_change') {
        setIsFetchingPage(true);
        if(pageDirection !== 'initial') setImages([]); 
    }

    try {
      let imagesQuery = getBaseQuery();
      const baseOrder = orderBy("uploadedAt", "desc");

      if (pageDirection === 'next' && lastVisibleDoc) {
        imagesQuery = query(imagesQuery, baseOrder, startAfter(lastVisibleDoc), limit(ITEMS_PER_PAGE));
      } else if (pageDirection === 'prev' && firstVisibleDoc && currentPage > 1) {
         imagesQuery = query(imagesQuery, baseOrder, endBefore(firstVisibleDoc), limit(ITEMS_PER_PAGE));
      } else { 
        imagesQuery = query(imagesQuery, baseOrder, limit(ITEMS_PER_PAGE));
      }
      
      const documentSnapshots = await getDocs(imagesQuery);
      const loadedImages = [];
      documentSnapshots.forEach((doc) => {
        loadedImages.push({ id: doc.id, ...doc.data() });
      });
      
      setImages(loadedImages);

      if (loadedImages.length > 0) {
        const newFirstVisible = documentSnapshots.docs[0];
        const newLastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
        
        setFirstVisibleDoc(newFirstVisible);
        setLastVisibleDoc(newLastVisible);

        if (pageDirection === 'initial' || pageDirection === 'initial_category_change' || (pageDirection === 'next' && currentPage === 1) ) {
          setPageFirstDocHistory([newFirstVisible]); 
        } else if (pageDirection === 'next') {
          setPageFirstDocHistory(prev => {
            const newHistory = [...prev];
            newHistory[currentPage -1] = newFirstVisible; 
            return newHistory;
          });
        }
      } else {
        if (pageDirection === 'next') {
            // No hay más items
        } else if (pageDirection === 'prev' && currentPage > 1) {
            // No hay items en la página anterior
        } else if (pageDirection === 'initial' || pageDirection === 'initial_category_change') {
            setFirstVisibleDoc(null);
            setLastVisibleDoc(null);
        }
      }

    } catch (error) {
      console.error("Error cargando imágenes paginadas desde Firestore: ", error);
      // Si es un error de índice, el mensaje de Firebase en la consola es la clave
      if (error.code === 'failed-precondition') {
        alert("Error: La consulta de imágenes requiere un índice que no existe o está siendo construido. Revisa la consola del navegador para un enlace para crear el índice en Firebase.");
      }
    } finally {
      setIsFetchingPage(false);
      if (pageDirection === 'initial' || pageDirection === 'initial_category_change') {
        setIsLoading(false); 
      }
    }
  }, [getBaseQuery, ITEMS_PER_PAGE, currentPage, firstVisibleDoc, lastVisibleDoc, isFetchingPage]);


  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setImages([]); 
      try {
        const portfolioItemsRef = collection(db, "portfolio_items");
        const categoriesSnapshot = await getDocs(query(portfolioItemsRef));
        const uniqueCategoriesSet = new Set(['Todos']);
        categoriesSnapshot.forEach(doc => {
          const category = doc.data().category;
          if (category) uniqueCategoriesSet.add(category);
        });
        setCategories(Array.from(uniqueCategoriesSet).sort());

        const countQuery = getBaseQuery(); 
        const countSnapshot = await getCountFromServer(countQuery);
        setTotalImageCount(countSnapshot.data().count);
        
        setCurrentPage(1);
        setLastVisibleDoc(null);
        setFirstVisibleDoc(null);
        setPageFirstDocHistory([]); 
        
        loadImages('initial_category_change'); 

      } catch (error) {
        console.error("Error en la configuración inicial del portfolio:", error);
        setIsLoading(false); 
      }
    };

    fetchInitialData();
  }, [selectedCategory, getBaseQuery]);


  const handleFilter = (category) => {
    if (selectedCategory === category) return;
    setSelectedCategory(category);
  };
  
  const goToNextPage = () => {
    if (!lastVisibleDoc || currentPage >= totalPages || isFetchingPage) return;
    setCurrentPage(prev => prev + 1); 
    loadImages('next'); 
  };
  
  const goToPrevPage = () => {
    if (currentPage <= 1 || isFetchingPage) return;
    setCurrentPage(prev => prev - 1);
    loadImages('prev'); 
  };
  
  const openImageModal = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; 
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
    document.body.style.overflow = 'auto'; 
  };

  const totalPages = Math.ceil(totalImageCount / ITEMS_PER_PAGE);

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

      {(isLoading || (isFetchingPage && images.length === 0 && currentPage > 1 )) && ( 
        <p className="text-center text-text-secondary py-10">Cargando galería...</p>
      )}
      
      {!isLoading && !isFetchingPage && images.length === 0 && (
        <p className="text-center text-text-secondary col-span-full py-10">
          No hay imágenes para mostrar en esta categoría o página.
        </p>
      )}

      {!isFetchingPage && images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {images.map((image) => ( 
            <div
              key={image.id}
              className="aspect-[4/3] bg-beige-light rounded-lg overflow-hidden shadow-soft hover:shadow-soft-md transition-all duration-300 cursor-pointer group"
              onClick={() => openImageModal(image)}
            >
              {/* Usar thumbnailUrl para el grid, con fallback a originalUrl */}
              {(image.thumbnailUrl || image.originalUrl) ? (
                <img
                  src={image.thumbnailUrl || image.originalUrl} 
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
      )}

      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center items-center space-x-3 sm:space-x-4 mt-10 pt-6 border-t border-sepia-gray-soft/20">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1 || isFetchingPage}
            className="px-3 py-2 sm:px-4 sm:py-2.5 bg-beige-light text-text-primary rounded-md shadow-soft hover:bg-sepia-gray-soft/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center text-sm"
          >
            <ChevronLeft size={18} className="mr-1 sm:mr-2" />
            Anterior
          </button>
          <span className="text-sm text-text-secondary">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages || isFetchingPage || (images.length < ITEMS_PER_PAGE && images.length > 0 && currentPage < totalPages) } 
            className="px-3 py-2 sm:px-4 sm:py-2.5 bg-beige-light text-text-primary rounded-md shadow-soft hover:bg-sepia-gray-soft/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center text-sm"
          >
            Siguiente
            <ChevronRight size={18} className="ml-1 sm:ml-2" />
          </button>
        </div>
      )}

      <ImageModal isOpen={isModalOpen} onClose={closeImageModal} image={selectedImage} />
    </div>
  );
};

export default PortfolioPage;
