import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, orderBy, limit, getDocs, startAfter, where, endBefore } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Modal from '../../components/common/Modal';

const ITEMS_PER_PAGE = 9;

const PortfolioPage = () => {
    const [images, setImages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastVisibleDoc, setLastVisibleDoc] = useState(null);
    const [firstVisibleDoc, setFirstVisibleDoc] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedImage, setSelectedImage] = useState(null);
    const [pageFirstDocHistory, setPageFirstDocHistory] = useState([null]); // Historial del primer documento de cada página


    const fetchCategories = useCallback(async () => {
        try {
            const portfolioCollection = collection(db, 'portfolio');
            const snapshot = await getDocs(portfolioCollection);
            const uniqueCategories = new Set(['Todas']);
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.category) {
                    uniqueCategories.add(data.category);
                }
            });
            setCategories(Array.from(uniqueCategories));
        } catch (error) {
            console.error("Error fetching categories: ", error);
        }
    }, []);

    const fetchTotalCount = useCallback(async () => {
        try {
            let countQuery;
            if (selectedCategory === 'Todas') {
                countQuery = query(collection(db, 'portfolio'));
            } else {
                countQuery = query(collection(db, 'portfolio'), where('category', '==', selectedCategory));
            }
            const snapshot = await getDocs(countQuery);
            const totalDocs = snapshot.size;
            setTotalPages(Math.ceil(totalDocs / ITEMS_PER_PAGE));
        } catch (error) {
            console.error("Error fetching total document count: ", error);
        }
    }, [selectedCategory]);

    const loadImages = useCallback(async (pageDirection = 'next', pageNum = 1) => {
        const initialLoad = pageDirection === 'initial';
        if (initialLoad) setLoading(true);
        else setLoadingMore(true);

        try {
            const getBaseQuery = () => {
                const base = collection(db, 'portfolio');
                return selectedCategory === 'Todas' ? base : query(base, where('category', '==', selectedCategory));
            };

            let imagesQuery;
            // La consulta a Firestore puede fallar si no existe un índice compuesto.
            // Si ves un error en la consola que dice 'FAILED_PRECONDITION',
            // ve a tu base de datos de Firestore -> Índices y crea un índice con:
            // Colección: 'portfolio', Campos: 'category' (Ascendente), 'uploadedAt' (Descendente).
            const baseOrder = orderBy("uploadedAt", "desc");
            
            if (pageDirection === 'next' && lastVisibleDoc) {
                imagesQuery = query(getBaseQuery(), baseOrder, startAfter(lastVisibleDoc), limit(ITEMS_PER_PAGE));
            } else if (pageDirection === 'prev' && firstVisibleDoc) {
                // La paginación hacia atrás con 'endBefore' y 'orderBy desc' es compleja.
                // Esta implementación puede no funcionar como se espera en todos los casos.
                // Una mejor estrategia sería invertir el orden de la consulta y revertir los resultados.
                imagesQuery = query(getBaseQuery(), baseOrder, endBefore(firstVisibleDoc), limit(ITEMS_PER_PAGE));
            } else { // Carga inicial o cambio de categoría
                imagesQuery = query(getBaseQuery(), baseOrder, limit(ITEMS_PER_PAGE));
            }

            const documentSnapshots = await getDocs(imagesQuery);
            const newImages = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (!documentSnapshots.empty) {
                setFirstVisibleDoc(documentSnapshots.docs[0]);
                setLastVisibleDoc(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
                setImages(newImages);

                if (pageDirection === 'next') {
                  const newHistory = [...pageFirstDocHistory, documentSnapshots.docs[0]];
                  setPageFirstDocHistory(newHistory);
              } else if (pageDirection === 'prev') {
                  // Al retroceder, eliminamos el último elemento del historial
                  const newHistory = pageFirstDocHistory.slice(0, -1);
                  setPageFirstDocHistory(newHistory);
              }

            } else {
                if (pageDirection === 'initial') {
                    setImages([]);
                }
                setLastVisibleDoc(null);
            }
        } catch (error) {
            console.error("Error fetching images: ", error);
            // Mostrar mensaje de error al usuario aquí
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [selectedCategory, lastVisibleDoc, firstVisibleDoc, pageFirstDocHistory]);


    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        fetchTotalCount();
        setLastVisibleDoc(null);
        setFirstVisibleDoc(null);
        setCurrentPage(1);
        setPageFirstDocHistory([null]);
        loadImages('initial');
    }, [selectedCategory, fetchTotalCount]);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
            loadImages('next');
        }
    };
    
    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
            loadImages('prev');
        }
    };

    const openModal = (image) => {
        setSelectedImage(image);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="text-center mb-12">
                <h1 className="editorial-title">Portfolio</h1>
                <p className="text-text-secondary max-w-xl mx-auto">Explora una selección de mis trabajos fotográficos, cada uno contando una historia única.</p>
            </div>

            <div className="flex justify-center flex-wrap gap-2 md:gap-4 mb-8">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 text-sm md:text-base font-medium rounded-full transition-colors duration-300 ${
                            selectedCategory === category
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-background-secondary text-text-primary hover:bg-gray-300'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : images.length > 0 ? (
                <>
                    <motion.div 
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {images.map(image => (
                            <motion.div
                                key={image.id}
                                className="group relative overflow-hidden rounded-lg shadow-lg cursor-pointer"
                                variants={itemVariants}
                                layoutId={`card-${image.id}`}
                                onClick={() => openModal(image)}
                            >
                                <img
                                    src={image.thumbnailUrl || image.url}
                                    alt={image.title || 'Portfolio image'}
                                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                                    style={{aspectRatio: '1 / 1'}}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <p className="text-white text-lg font-semibold">{image.title}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    <div className="flex justify-center items-center mt-12 space-x-4">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1 || loadingMore}
                            className="p-2 rounded-full bg-background-secondary hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <span className="font-medium text-text-secondary">Página {currentPage} de {totalPages}</span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages || loadingMore}
                            className="p-2 rounded-full bg-background-secondary hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loadingMore ? <Loader2 className="h-6 w-6 animate-spin" /> : <ChevronRight className="h-6 w-6" />}
                        </button>
                    </div>
                </>
            ) : (
                <div className="text-center py-16">
                    <p className="text-text-secondary">No se encontraron imágenes en esta categoría.</p>
                </div>
            )}

            {selectedImage && (
                <Modal onClose={closeModal}>
                    <motion.div layoutId={`card-${selectedImage.id}`} className="max-w-3xl w-full">
                         <img
                            src={selectedImage.url}
                            alt={selectedImage.title}
                            className="max-w-full max-h-[80vh] w-auto h-auto rounded-lg shadow-2xl"
                        />
                         <div className="mt-4 text-center">
                             <h3 className="text-xl font-bold text-text-primary">{selectedImage.title}</h3>
                             <p className="text-text-secondary">{selectedImage.description}</p>
                         </div>
                    </motion.div>
                </Modal>
            )}
        </div>
    );
};

export default PortfolioPage;