// src/pages/public/PortfolioPage.jsx - VERSIÓN FINAL REFINADA
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, where, orderBy, getDocs, limit, startAfter } from 'firebase/firestore';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from '../../components/common/Modal';

const PortfolioPage = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categories, setCategories] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [page, setPage] = useState(1);
    const [lastDoc, setLastDoc] = useState(null);
    const [isLastPage, setIsLastPage] = useState(false);
    const [pageHistory, setPageHistory] = useState([null]); // Almacena el último doc de la página ANTERIOR

    const imagesPerPage = 12;

    // 1. Obtiene las categorías dinámicamente (solo una vez)
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const portfolioSnapshot = await getDocs(collection(db, 'portfolio_items'));
                const uniqueCategories = [...new Set(portfolioSnapshot.docs.map(doc => doc.data().category))];
                setCategories(['all', ...uniqueCategories.sort()]);
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };
        fetchCategories();
    }, []);

    // 2. Carga las imágenes cada vez que la categoría o la página cambian
    useEffect(() => {
        const fetchImages = async () => {
            setLoading(true);
            setError(null);
            try {
                const portfolioCollection = collection(db, 'portfolio_items');
                
                // Construye la consulta base
                const baseQuery = selectedCategory === 'all'
                    ? query(portfolioCollection, orderBy('uploadedAt', 'desc'))
                    : query(portfolioCollection, where('category', '==', selectedCategory), orderBy('uploadedAt', 'desc'));

                // Añade la paginación a la consulta
                const docToStartAfter = page === 1 ? null : pageHistory[page-1];
                const imagesQuery = docToStartAfter
                    ? query(baseQuery, startAfter(docToStartAfter), limit(imagesPerPage))
                    : query(baseQuery, limit(imagesPerPage));
                
                const documentSnapshots = await getDocs(imagesQuery);
                
                if (!documentSnapshots.empty) {
                    const fetchedImages = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    const newLastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];

                    setImages(fetchedImages);
                    setLastDoc(newLastVisible);

                    // Actualizar el historial para la paginación "Siguiente"
                    setPageHistory(prev => {
                        const newHistory = [...prev];
                        newHistory[page] = newLastVisible;
                        return newHistory;
                    });

                    // Comprobar si es la última página
                    const nextQuery = query(baseQuery, startAfter(newLastVisible), limit(1));
                    const nextSnapshot = await getDocs(nextQuery);
                    setIsLastPage(nextSnapshot.empty);

                } else {
                    setImages([]);
                    setIsLastPage(true);
                }

            } catch (err) {
                console.error("Error fetching images: ", err);
                if (err.code === 'failed-precondition') {
                    setError("Error de base de datos: Se necesita un índice para esta consulta. Revisa la consola (F12) para crearlo.");
                } else {
                    setError("No se pudieron cargar las imágenes. Inténtalo de nuevo.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, [selectedCategory, page]);

    // 3. Resetea la paginación cuando la categoría cambia
    const handleCategoryChange = (category) => {
        if (category !== selectedCategory) {
            setSelectedCategory(category);
            setPage(1);
            setLastDoc(null);
            setPageHistory([null]);
            setIsLastPage(false);
        }
    };
    
    const handleNextPage = () => { if (!isLastPage) setPage(p => p + 1); };
    const handlePrevPage = () => { if (page > 1) setPage(p => p - 1); };

    const openModal = (image) => setSelectedImage(image);
    const closeModal = () => setSelectedImage(null);

    return (
        <>
            <div className="bg-white-off text-center py-16 px-4 md:px-8 min-h-screen">
                <h1 className="script-logo text-5xl md:text-6xl text-accent-script mb-4">Mi Galería</h1>
                <p className="font-sans text-lg text-text-secondary max-w-2xl mx-auto mb-10">
                    Un vistazo a los momentos que he tenido el placer de capturar.
                </p>

                {categories.length > 1 && (
                     <div className="flex justify-center flex-wrap gap-2 md:gap-4 mb-12">
                        {categories.map(category => (
                            <button key={category} onClick={() => handleCategoryChange(category)}
                                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${selectedCategory === category ? 'bg-accent-script text-white-off shadow-soft' : 'bg-beige-light text-text-secondary hover:bg-sepia-gray-soft/40'}`}>
                                {category === 'all' ? 'Todas' : category}
                            </button>
                        ))}
                    </div>
                )}

                {loading && <p className="text-gray-700">Cargando imágenes...</p>}
                {error && <p className="text-red-500 px-4">{error}</p>}

                {!loading && !error && images.length === 0 && (
                    <p className="text-gray-500 mt-8">No hay imágenes en esta categoría.</p>
                )}

                {!loading && images.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {images.map(image => (
                                <div key={image.id} onClick={() => openModal(image)}
                                    className="group relative overflow-hidden rounded-lg shadow-soft aspect-[4/3] cursor-pointer"
                                >
                                    <img
                                        src={image.thumbnailUrl || image.originalUrl}
                                        alt={image.title || `Foto de ${image.category}`}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-end justify-start p-4">
                                        <p className="text-white-off text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-y-2 group-hover:translate-y-0">
                                            {image.title}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex justify-center items-center mt-12 space-x-4">
                            <button onClick={handlePrevPage} disabled={page <= 1 || loading}
                                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">
                                <ChevronLeft size={24} />
                            </button>
                            <span className="text-gray-700 font-medium">Página {page}</span>
                            <button onClick={handleNextPage} disabled={isLastPage || loading}
                                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </>
                )}
            </div>

            <Modal isOpen={!!selectedImage} onClose={closeModal} title={selectedImage?.title}>
              {selectedImage && (
                <img
                    src={selectedImage.originalUrl}
                    alt={selectedImage.title || `Foto de ${selectedImage.category}`}
                    className="w-full h-auto max-h-[80vh] object-contain rounded-md"
                />
              )}
            </Modal>
        </>
    );
};

export default PortfolioPage;