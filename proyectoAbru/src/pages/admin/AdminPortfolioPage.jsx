// src/pages/admin/AdminPortfolioPage.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
// Asegúrate de que 'Trash' esté importado aquí
import { UploadCloud, Eye, Trash2, ImagePlus, CheckSquare, Square, Trash } from 'lucide-react'; 
import { storage, db } from '../../firebase/firebaseConfig'; 
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  uploadBytes // Para subir blobs directamente
} from "firebase/storage";
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  deleteDoc,
  writeBatch
} from 'firebase/firestore';

// --- Función para Redimensionar Imagen en el Cliente ---
const resizeImageClientSide = (file, maxWidth, maxHeight, quality = 0.85, type = 'image/webp') => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas to Blob conversion failed'));
              return;
            }
            resolve(blob);
          },
          type,
          quality
        );
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};


const AdminPortfolioPage = () => {
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting: isFormSubmittingHook } } = useForm();
  
  const [imagePreviews, setImagePreviews] = useState([]); 
  const [uploadStatus, setUploadStatus] = useState({ 
    message: '', type: '', progress: 0, currentFile: 0, totalFiles: 0, successCount: 0, errorCount: 0
  });
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  
  const [selectedImages, setSelectedImages] = useState([]);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, "portfolio_items"), orderBy("uploadedAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const imagesData = [];
      querySnapshot.forEach((document) => {
        imagesData.push({ id: document.id, ...document.data() });
      });
      setPortfolioImages(imagesData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error cargando imágenes desde Firestore: ", error);
      setUploadStatus(prev => ({ ...prev, message: `Error al cargar imágenes: ${error.message}`, type: 'error' }));
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const imageFilesWatcher = watch("imageFiles");

  useEffect(() => {
    if (imageFilesWatcher && imageFilesWatcher.length > 0) {
      const newPreviews = [];
      Array.from(imageFilesWatcher).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push({ name: file.name, url: reader.result });
          if (newPreviews.length === imageFilesWatcher.length) {
            setImagePreviews(newPreviews);
          }
        };
        reader.readAsDataURL(file);
      });
    } else {
      setImagePreviews([]);
    }
  }, [imageFilesWatcher]);

  const onSubmitImages = async (data) => {
    const files = data.imageFiles;
    if (!files || files.length === 0) {
      setUploadStatus({ message: "Por favor, selecciona al menos un archivo de imagen.", type: 'error', progress: 0, totalFiles: 0, currentFile: 0, successCount: 0, errorCount: 0 });
      return;
    }

    setIsBatchUploading(true);
    setUploadStatus({
      message: `Iniciando subida de ${files.length} imágenes...`, type: 'processing',
      progress: 0, totalFiles: files.length, currentFile: 0, successCount: 0, errorCount: 0
    });

    let uploadedCount = 0;
    let errorCount = 0;
    const firestoreBatch = writeBatch(db);

    for (let i = 0; i < files.length; i++) {
      const originalFile = files[i];
      setUploadStatus(prev => ({
        ...prev, message: `Procesando imagen ${i + 1}/${files.length}: ${originalFile.name}`,
        currentFile: i + 1, progress: Math.round((i / files.length) * 100)
      }));

      let imageTitle = data.title || originalFile.name.replace(/\.[^/.]+$/, "");
      if (files.length > 1) {
        imageTitle = `${data.title || 'Imagen'} - ${i + 1}`;
      }
      const baseFileName = `${imageTitle.replace(/\s+/g, '_')}_${Date.now()}`;

      try {
        // 1. Redimensionar para miniatura
        const thumbnailBlob = await resizeImageClientSide(originalFile, 800, 800, 0.8, 'image/webp');
        const thumbnailFileExtension = 'webp';
        const thumbnailFileName = `${baseFileName}_thumb.${thumbnailFileExtension}`;
        const thumbnailStoragePath = `portfolio_images/thumbnails/${thumbnailFileName}`;
        const thumbnailStorageRef = ref(storage, thumbnailStoragePath);

        // 2. Subir miniatura
        setUploadStatus(prev => ({ ...prev, message: `Subiendo miniatura para ${originalFile.name}...`}));
        await uploadBytes(thumbnailStorageRef, thumbnailBlob);
        const thumbnailUrl = await getDownloadURL(thumbnailStorageRef);

        // 3. Subir original
        const originalFileExtension = originalFile.name.split('.').pop();
        const originalFileName = `${baseFileName}_original.${originalFileExtension}`;
        const originalStoragePath = `portfolio_images/originals/${originalFileName}`;
        const originalStorageRef = ref(storage, originalStoragePath);
        
        setUploadStatus(prev => ({ ...prev, message: `Subiendo original para ${originalFile.name}...`}));
        await uploadBytes(originalStorageRef, originalFile); // Subir el archivo original directamente
        const originalUrl = await getDownloadURL(originalStorageRef);

        // 4. Preparar metadata para Firestore
        const newImageMetadata = {
          title: imageTitle,
          category: data.category,
          originalUrl: originalUrl,
          thumbnailUrl: thumbnailUrl,
          firebaseOriginalPath: originalStoragePath, // Para poder borrar la original
          firebaseThumbnailPath: thumbnailStoragePath, // Para poder borrar la miniatura
          fileName: originalFileName, // Podría ser el nombre base o el original
          uploadedAt: serverTimestamp()
        };
        
        const docRef = doc(collection(db, "portfolio_items"));
        firestoreBatch.set(docRef, newImageMetadata);
        uploadedCount++;

      } catch (error) {
        console.error(`Error procesando o subiendo ${originalFile.name}:`, error);
        errorCount++;
      }
    } // Fin del bucle for

    try {
      if (uploadedCount > 0) {
        await firestoreBatch.commit();
      }
    } catch (batchError) {
      console.error("Error al ejecutar el batch de Firestore:", batchError);
      errorCount += uploadedCount; 
      uploadedCount = 0;
    }

    setUploadStatus({
      message: `Proceso completado. Éxitos: ${uploadedCount}. Errores: ${errorCount}.`,
      type: errorCount > 0 ? (uploadedCount > 0 ? 'warning' : 'error') : 'success',
      progress: 100, totalFiles: files.length, currentFile: files.length,
      successCount: uploadedCount, errorCount: errorCount
    });

    setIsBatchUploading(false);
    if (errorCount === 0) {
      reset();
      setImagePreviews([]);
    }
    setTimeout(() => setUploadStatus(prev => ({ ...prev, message: '', type: prev.type === 'error' || prev.type === 'warning' ? prev.type : '' })), 8000);
  };

  const handleDeleteImage = async (imageToDelete) => {
    if (!imageToDelete || !imageToDelete.id) {
        alert("Error: No se puede eliminar la imagen. Información incompleta.");
        return;
    }
    if (window.confirm(`¿Estás segura de que quieres eliminar "${imageToDelete.title}"? Se eliminarán todas sus versiones.`)) {
      setIsDeletingSelected(true); 
      try {
        // Eliminar original de Storage (si existe el path)
        if (imageToDelete.firebaseOriginalPath) {
          const originalRef = ref(storage, imageToDelete.firebaseOriginalPath);
          await deleteObject(originalRef).catch(err => console.warn("No se pudo borrar original de Storage:", err));
        }
        // Eliminar miniatura de Storage (si existe el path)
        if (imageToDelete.firebaseThumbnailPath) {
          const thumbRef = ref(storage, imageToDelete.firebaseThumbnailPath);
          await deleteObject(thumbRef).catch(err => console.warn("No se pudo borrar miniatura de Storage:", err));
        }
        
        // Eliminar de Firestore
        await deleteDoc(doc(db, "portfolio_items", imageToDelete.id));
        alert(`Imagen "${imageToDelete.title}" y sus versiones eliminadas con éxito.`);
      } catch (error) {
        console.error("Error eliminando imagen:", error);
        alert(`Error al eliminar la imagen: ${error.message}.`);
      } finally {
        setIsDeletingSelected(false);
      }
    }
  };
  
  const handleDeleteSelectedImages = async () => {
    if (selectedImages.length === 0) return;
    if (!window.confirm(`¿Estás segura de que quieres eliminar ${selectedImages.length} imágenes seleccionadas?`)) return;

    setIsDeletingSelected(true);
    setUploadStatus({ message: `Eliminando ${selectedImages.length} imágenes...`, type: 'processing', progress: 0, totalFiles: selectedImages.length, currentFile: 0, successCount: 0, errorCount: 0 });

    let deletedCount = 0;
    let errorCount = 0;
    const batch = writeBatch(db);

    for (let i = 0; i < selectedImages.length; i++) {
      const imageId = selectedImages[i];
      const imageToDelete = portfolioImages.find(img => img.id === imageId);
      setUploadStatus(prev => ({ ...prev, currentFile: i + 1, progress: Math.round((i / selectedImages.length) * 100) }));

      if (imageToDelete) {
        try {
          if (imageToDelete.firebaseOriginalPath) {
            await deleteObject(ref(storage, imageToDelete.firebaseOriginalPath)).catch(err => console.warn("Fallo al borrar original", err));
          }
          if (imageToDelete.firebaseThumbnailPath) {
            await deleteObject(ref(storage, imageToDelete.firebaseThumbnailPath)).catch(err => console.warn("Fallo al borrar thumbnail", err));
          }
          batch.delete(doc(db, "portfolio_items", imageId));
          deletedCount++;
        } catch (error) {
          errorCount++;
        }
      } else {
        errorCount++;
      }
    }

    try {
      if (deletedCount > 0 || errorCount > 0) { 
        await batch.commit();
      }
    } catch (batchError) {
      errorCount = selectedImages.length; deletedCount = 0;
    }
    setUploadStatus({
      message: `Eliminación completada. Éxitos: ${deletedCount}. Errores: ${errorCount}.`,
      type: errorCount > 0 ? (deletedCount > 0 ? 'warning' : 'error') : 'success',
      progress: 100, totalFiles: selectedImages.length, currentFile: selectedImages.length,
      successCount: deletedCount, errorCount: errorCount
    });
    setSelectedImages([]);
    setIsDeletingSelected(false);
    setTimeout(() => setUploadStatus(prev => ({ ...prev, message: '', type: prev.type === 'error' || prev.type === 'warning' ? prev.type : '' })), 8000);
  };

  const handleToggleSelectImage = (imageId) => {
    setSelectedImages(prevSelected =>
      prevSelected.includes(imageId)
        ? prevSelected.filter(id => id !== imageId)
        : [...prevSelected, imageId]
    );
  };

  const handleSelectAllImages = () => {
    setSelectedImages(portfolioImages.map(img => img.id));
  };

  const handleDeselectAllImages = () => {
    setSelectedImages([]);
  };

  const portfolioCategories = ["Bodas", "15 Años", "Retratos", "Eventos Sociales", "Producto", "Artística", "Otros"];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold text-gray-800">Gestionar Portfolio (Redim. Cliente)</h1>

      {/* FORMULARIO DE SUBIDA */}
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-3">Subir Nueva(s) Imagen(es)</h2>
        {uploadStatus.message && (
          <div>
            <div className={`p-3 rounded-md text-sm mb-2 
              ${uploadStatus.type === 'success' ? 'bg-green-100 text-green-700' : 
                uploadStatus.type === 'error' ? 'bg-red-100 text-red-700' : 
                uploadStatus.type === 'warning' ? 'bg-yellow-100 text-yellow-700' : 
                'bg-blue-100 text-blue-700'}`}>
              {uploadStatus.message}
            </div>
            {(uploadStatus.type === 'processing' || (uploadStatus.progress < 100 && uploadStatus.totalFiles > 0 && uploadStatus.type !== 'success' && uploadStatus.type !== 'error' )) && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-150" 
                  style={{ width: `${uploadStatus.progress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmitImages)} className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Título Base (Opcional)
            </label>
            <input type="text" id="title" {...register("title")}
              placeholder="Ej: Boda Ana y Juan (se añadirá -1, -2, etc.)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-script/50 focus:border-accent-script/80" />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Categoría <span className="text-red-500">*</span>
            </label>
            <select id="category" {...register("category", { required: "La categoría es obligatoria." })}
              className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-script/50 focus:border-accent-script/80" >
              <option value="">Selecciona una categoría...</option>
              {portfolioCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
          </div>
          <div>
            <label htmlFor="imageFiles" className="block text-sm font-medium text-gray-700 mb-1">
              Archivos de Imagen <span className="text-red-500">*</span>
            </label>
            <input 
              type="file" id="imageFiles" accept="image/jpeg, image/png, image/webp" // HEIC/HEIF es más complejo en cliente
              multiple {...register("imageFiles", { required: "Debes seleccionar al menos una imagen." })}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-beige-light file:text-accent-script hover:file:bg-accent-script/20 cursor-pointer" 
            />
            {errors.imageFiles && <p className="mt-1 text-xs text-red-500">{errors.imageFiles.message}</p>}
          </div>
          {imagePreviews.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-gray-600 mb-1">Vistas Previas ({imagePreviews.length} seleccionadas):</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="aspect-square border border-gray-200 rounded-md overflow-hidden">
                    <img src={preview.url} alt={`Vista previa ${preview.name}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
          <button type="submit" disabled={isBatchUploading || isFormSubmittingHook || isDeletingSelected}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white-off bg-accent-script hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-script disabled:opacity-60">
            <ImagePlus size={18} className="mr-2"/>
            {isBatchUploading ? `Procesando ${uploadStatus.currentFile}/${uploadStatus.totalFiles}...` : "Subir Imágenes"}
          </button>
        </form>
      </div>

      {/* LISTADO DE IMÁGENES y ACCIONES DE ELIMINACIÓN MASIVA */}
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md mt-10">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b pb-3 gap-4">
          <h2 className="text-xl font-semibold text-gray-700">Imágenes del Portfolio ({portfolioImages.length})</h2>
          {portfolioImages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button onClick={handleSelectAllImages} disabled={isBatchUploading || isDeletingSelected}
                className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 disabled:opacity-50">
                Seleccionar Todas
              </button>
              <button onClick={handleDeselectAllImages} disabled={selectedImages.length === 0 || isBatchUploading || isDeletingSelected}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50">
                Deseleccionar Todas
              </button>
              <button onClick={handleDeleteSelectedImages} disabled={selectedImages.length === 0 || isBatchUploading || isDeletingSelected}
                className="px-3 py-1.5 text-xs font-medium text-white-off bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center">
                {/* Aquí es donde se usa el icono Trash */}
                <Trash size={14} className="mr-1.5" /> 
                Eliminar ({selectedImages.length})
              </button>
            </div>
          )}
        </div>
        {isLoading ? ( <p>Cargando...</p> ) : portfolioImages.length === 0 ? ( <p>No hay imágenes.</p> ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {portfolioImages.map(image => {
              const isSelected = selectedImages.includes(image.id);
              return (
                <div key={image.id} 
                  className={`border rounded-lg p-3 space-y-2 shadow-sm hover:shadow-md transition-all duration-200 relative group cursor-pointer
                              ${isSelected ? 'border-accent-script ring-2 ring-accent-script bg-accent-script/5' : 'border-gray-200'}`}
                  onClick={() => handleToggleSelectImage(image.id)}
                >
                  <div className="absolute top-2 left-2 z-10">
                    <input type="checkbox" checked={isSelected} onChange={() => handleToggleSelectImage(image.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-5 w-5 text-accent-script bg-white border-gray-300 rounded focus:ring-accent-script focus:ring-2"
                    />
                  </div>
                  <div className="aspect-[4/3] bg-gray-100 rounded overflow-hidden mb-2">
                    <img src={image.thumbnailUrl || image.originalUrl} // Priorizar thumbnail
                      alt={`Miniatura de ${image.title}`} className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => { console.error(`Error cargando imagen ${image.id}`);}}
                    />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 truncate" title={image.title}>{image.title}</p>
                  <p className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block">{image.category}</p>
                  {image.uploadedAt?.toDate && (<p className="text-xs text-gray-400">Subida: {new Date(image.uploadedAt.toDate()).toLocaleDateString()}</p>)}
                  
                  {!isSelected && (
                    <div className="absolute top-2 right-2 flex flex-col space-y-1.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
                      <a href={image.originalUrl} target="_blank" rel="noopener noreferrer" title="Ver original"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow">
                        <Eye size={14} />
                      </a>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteImage(image);}} 
                        title="Eliminar esta imagen" disabled={isBatchUploading || isDeletingSelected}
                        className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow disabled:opacity-50">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPortfolioPage;
