// src/pages/admin/AdminPortfolioPage.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { UploadCloud, Eye, Trash2 } from 'lucide-react';
import { storage } from '../../firebase/firebaseConfig'; // Importar storage de Firebase
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

// Funciones para localStorage
const getStoredPortfolioImages = () => {
  const images = localStorage.getItem('sevePhotographyFirebasePortfolio'); // Nueva clave para Firebase
  return images ? JSON.parse(images) : [];
};

const storePortfolioImages = (images) => {
  localStorage.setItem('sevePhotographyFirebasePortfolio', JSON.stringify(images));
};

const AdminPortfolioPage = () => {
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm();
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({ message: '', type: '', progress: 0 });
  const [portfolioImages, setPortfolioImages] = useState([]);

  useEffect(() => {
    setPortfolioImages(getStoredPortfolioImages().reverse());
  }, []);

  const imageFileWatcher = watch("imageFile"); // Renombrado para claridad

  useEffect(() => {
    if (imageFileWatcher && imageFileWatcher[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(imageFileWatcher[0]);
    } else {
      setImagePreview(null);
    }
  }, [imageFileWatcher]);

  const onSubmitImage = async (data) => {
    setUploadStatus({ message: '', type: '', progress: 0 });
    if (!data.imageFile || data.imageFile.length === 0) {
      setUploadStatus({ message: "Por favor, selecciona un archivo de imagen.", type: 'error' });
      return;
    }

    const file = data.imageFile[0];
    // Crear una referencia única en Firebase Storage (ej. portfolio_images/nombreArchivo_timestamp.ext)
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${file.name.split('.')[0]}_${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `portfolio_images/${uniqueFileName}`);
    
    setUploadStatus({ message: 'Subiendo imagen...', type: 'info', progress: 0 });

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadStatus(prev => ({ ...prev, message: `Subiendo: ${Math.round(progress)}%`, progress: Math.round(progress) }));
      },
      (error) => {
        console.error("AdminPortfolioPage - Error al subir a Firebase Storage:", error);
        setUploadStatus({ message: `Error al subir: ${error.message}`, type: 'error', progress: 0 });
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUploadStatus({ message: `¡Imagen "${data.title}" subida con éxito!`, type: 'success', progress: 100 });

          const newImageMetadata = {
            id: uploadTask.snapshot.ref.fullPath, // Usar fullPath como ID único
            firebasePath: uploadTask.snapshot.ref.fullPath, // Guardar el path para posible borrado
            url: downloadURL, // URL de descarga para mostrar
            title: data.title,
            category: data.category,
            uploadedAt: new Date().toISOString(),
            fileName: uniqueFileName, // Guardar el nombre de archivo único
          };
          console.log("AdminPortfolioPage - Metadata guardada (Firebase):", newImageMetadata);

          const currentImages = getStoredPortfolioImages();
          const updatedImages = [newImageMetadata, ...currentImages];
          storePortfolioImages(updatedImages);
          setPortfolioImages(updatedImages);
          reset();
          setImagePreview(null);
          setTimeout(() => setUploadStatus({ message: '', type: '', progress: 0 }), 5000); // Limpiar mensaje después de 5s
        } catch (error) {
          console.error("AdminPortfolioPage - Error obteniendo downloadURL:", error);
          setUploadStatus({ message: `Error obteniendo URL de descarga: ${error.message}`, type: 'error', progress: 0 });
        }
      }
    );
  };

  const handleDeleteImage = async (imageToDelete) => {
    if (window.confirm(`¿Estás segura de que quieres eliminar "${imageToDelete.title}" del listado Y de Firebase Storage? Esta acción no se puede deshacer.`)) {
      try {
        // Crear referencia al archivo en Firebase Storage para borrarlo
        const imageRef = ref(storage, imageToDelete.firebasePath);
        await deleteObject(imageRef);
        console.log(`Imagen ${imageToDelete.firebasePath} eliminada de Firebase Storage.`);

        // Eliminar de localStorage y del estado
        const currentImages = getStoredPortfolioImages();
        const updatedImages = currentImages.filter(img => img.id !== imageToDelete.id);
        storePortfolioImages(updatedImages);
        setPortfolioImages(updatedImages.reverse()); // O solo updatedImages si ya estaban ordenadas
        alert(`Imagen "${imageToDelete.title}" eliminada con éxito.`);
      } catch (error) {
        console.error("Error eliminando imagen de Firebase Storage:", error);
        alert(`Error al eliminar la imagen de Firebase Storage: ${error.message}. Es posible que necesites borrarla manualmente desde la consola de Firebase. La imagen ha sido eliminada del listado local.`);
        // Opcionalmente, eliminar de localStorage incluso si falla en Firebase:
        const currentImages = getStoredPortfolioImages();
        const updatedImages = currentImages.filter(img => img.id !== imageToDelete.id);
        storePortfolioImages(updatedImages);
        setPortfolioImages(updatedImages.reverse());
      }
    }
  };

  const portfolioCategories = ["Bodas", "15 Años", "Retratos", "Eventos Sociales", "Producto", "Artística", "Otros"];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold text-gray-800">Gestionar Portfolio (Firebase Storage)</h1>

      {/* Formulario de Subida */}
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-3">Subir Nueva Imagen</h2>
        {uploadStatus.message && (
          <div>
            <div className={`p-3 rounded-md text-sm mb-2 ${
              uploadStatus.type === 'success' ? 'bg-green-100 text-green-700' :
              uploadStatus.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {uploadStatus.message}
            </div>
            {uploadStatus.type === 'info' && uploadStatus.progress > 0 && uploadStatus.progress < 100 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-150" 
                  style={{ width: `${uploadStatus.progress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmitImage)} className="space-y-5">
          {/* Campos del formulario (title, category, imageFile, preview) ... */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Título de la Imagen <span className="text-red-500">*</span>
            </label>
            <input type="text" id="title" {...register("title", { required: "El título es obligatorio." })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-script/50 focus:border-accent-script/80" />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
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
            <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-1">
              Archivo de Imagen <span className="text-red-500">*</span>
            </label>
            <input type="file" id="imageFile" accept="image/jpeg, image/png, image/webp, image/heic, image/heif"
              {...register("imageFile", { required: "Debes seleccionar un archivo de imagen." })}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-beige-light file:text-accent-script hover:file:bg-accent-script/20 cursor-pointer" />
            {errors.imageFile && <p className="mt-1 text-xs text-red-500">{errors.imageFile.message}</p>}
          </div>
          {imagePreview && (
            <div className="mt-4 p-2 border border-gray-200 rounded-md inline-block">
              <p className="text-xs font-medium text-gray-600 mb-1">Vista Previa:</p>
              <img src={imagePreview} alt="Vista previa de la imagen" className="max-h-48 w-auto rounded shadow-sm" />
            </div>
          )}
          <button type="submit" disabled={isSubmitting || (uploadStatus.type === 'info' && uploadStatus.progress < 100)}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white-off bg-accent-script hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-script disabled:opacity-60">
            <UploadCloud size={18} className="mr-2"/>
            {isSubmitting ? "Procesando..." : (uploadStatus.type === 'info' && uploadStatus.progress < 100 ? `Subiendo ${uploadStatus.progress}%` : "Subir Imagen al Portfolio")}
          </button>
        </form>
      </div>

      {/* Sección para Listar Imágenes Subidas */}
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md mt-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-3">Imágenes del Portfolio ({portfolioImages.length})</h2>
        {portfolioImages.length === 0 ? (
          <p className="text-sm text-gray-500">Aún no has subido ninguna imagen al portfolio.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {portfolioImages.map(image => (
              <div key={image.id} className="border border-gray-200 rounded-lg p-3 space-y-2 shadow-sm hover:shadow-md transition-shadow relative group">
                <div className="aspect-[4/3] bg-gray-100 rounded overflow-hidden mb-2">
                  <img
                    src={image.url} // Esta es la downloadURL de Firebase
                    alt={`Miniatura de ${image.title || 'imagen del portfolio'}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { console.error(`Error cargando imagen de Firebase para ${image.id}: ${e.target.src}`, e);}}
                  />
                </div>
                <p className="text-sm font-semibold text-gray-700 truncate" title={image.title}>{image.title}</p>
                <p className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block">{image.category}</p>
                <p className="text-xs text-gray-400">Subida: {new Date(image.uploadedAt).toLocaleDateString()}</p>
                <p className="text-[10px] text-gray-400 truncate" title={image.fileName}>Archivo: {image.fileName}</p>
                
                <div className="absolute top-2 right-2 flex flex-col space-y-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <a href={image.url} target="_blank" rel="noopener noreferrer" title="Ver imagen completa"
                    className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow">
                    <Eye size={14} />
                  </a>
                  <button onClick={() => handleDeleteImage(image)} title="Eliminar"
                    className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPortfolioPage;
