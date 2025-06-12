import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, where, orderBy, limit, getDocs, startAfter } from 'firebase/firestore';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PortfolioPage = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    
    // State for robust pagination
    const [page, setPage] = useState(1);
    const [isLastPage, setIsLastPage] = useState(false);
    // We store the first document of each page to navigate backwards.
    const [pageSnapshots, setPageSnapshots] = useState([null]); 

    const imagesPerPage = 8;
    const categories = ['all', 'Bodas', 'Eventos', 'Retratos', 'Producto'];

    const fetchImages = async () => {
        setLoading(true);
        setError(null);
        try {
            const portfolioCollection = collection(db, 'portfolio_items');
            
            // Define the base query with category filtering
            const baseQuery = selectedCategory === 'all'
                ? portfolioCollection
                : query(portfolioCollection, where('category', '==', selectedCategory));

            // Add ordering by date
            const orderedQuery = query(baseQuery, orderBy('uploadedAt', 'desc'));

            // Get the correct starting point for the current page
            const lastVisibleDoc = pageSnapshots[page - 1];
            const imagesQuery = query(orderedQuery, startAfter(lastVisibleDoc), limit(imagesPerPage));
            
            const querySnapshot = await getDocs(imagesQuery);
            const fetchedImages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (querySnapshot.docs.length > 0) {
                // Save the last document of the current page to use as a starting point for the NEXT page.
                const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
                setPageSnapshots(prev => {
                    const newSnapshots = [...prev];
                    newSnapshots[page] = lastDoc;
                    return newSnapshots;
                });
            }
            
            setImages(fetchedImages);
            setIsLastPage(querySnapshot.docs.length < imagesPerPage);

        } catch (err) {
            console.error("Error fetching images: ", err);
            if (err.code === 'failed-precondition') {
                 setError("Error: La base de datos requiere un índice para esta consulta. Por favor, abre la consola (F12), y haz clic en el enlace que proporciona Firebase para crearlo.");
            } else {
                setError("No se pudieron cargar las imágenes. Inténtalo de nuevo más tarde.");
            }
        } finally {
            setLoading(false);
        }
    };

    // This effect runs when the page number or category changes.
    useEffect(() => {
        fetchImages();
    }, [page, selectedCategory]);

    // This effect resets the pagination when the category filter changes.
    useEffect(() => {
        setPage(1);
        setPageSnapshots([null]);
        setIsLastPage(false);
    }, [selectedCategory]);

    const handleNextPage = () => {
        if (!isLastPage) {
            setPage(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (page > 1) {
            setPage(prev => prev - 1);
        }
    };

    return (
        <div className="bg-white-off text-center py-16 px-4 md:px-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 script-logo">Mi Galería</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
                Un vistazo a los momentos que he tenido el placer de capturar.
            </p>

            <div className="flex justify-center flex-wrap space-x-2 md:space-x-4 mb-12">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 my-1 text-sm md:text-base font-medium rounded-full transition-colors duration-200 ${selectedCategory === category
                                ? 'bg-gray-800 text-white-off'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                ))}
            </div>

            {loading && <p className="text-gray-700">Cargando imágenes...</p>}
            {error && <p className="text-red-500 px-4">{error}</p>}

            {!loading && !error && images.length === 0 && (
                 <p className="text-gray-500 mt-8">No hay imágenes en esta categoría.</p>
            )}

            {!loading && images.length > 0 && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {images.map(image => (
                            <div key={image.id} className="group relative overflow-hidden rounded-lg shadow-lg aspect-w-1 aspect-h-1">
                                <img
                                    src={image.thumbnailUrl}
                                    alt={`Portfolio image from category ${image.category}`}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                                    <p className="text-white-off text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        {image.category}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Pagination Controls */}
                    <div className="flex justify-center items-center mt-12 space-x-4">
                        <button
                            onClick={handlePrevPage}
                            disabled={page <= 1 || loading}
                            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <span className="text-gray-700 font-medium">Página {page}</span>
                        <button
                            onClick={handleNextPage}
                            disabled={isLastPage || loading}
                            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default PortfolioPage;
