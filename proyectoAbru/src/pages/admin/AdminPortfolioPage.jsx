// src/pages/admin/AdminPortfolioPage.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { UploadCloud, Eye, Trash2, Camera } from 'lucide-react'; // Añadido Camera para placeholder
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../../utils/cloudinaryConfig';
import { AdvancedImage } from '@cloudinary/react';
import { Cloudinary } from "@cloudinary/url-gen";
import { thumbnail } from "@cloudinary/url-gen/actions/resize";
import { quality, format } from "@cloudinary/url-gen/actions/delivery";

// TU API KEY DE CLOUDINARY
const CLOUDINARY_API_KEY = '675717664235993'; // Reemplaza si es diferente

const cld = new Cloudinary({ cloud: { cloudName: CLOUDINARY_CLOUD_NAME } });

// ---- Sección de Prueba de Imagen Simple ----
const TEST_PUBLIC_ID = 'seve_test_image_01'; // Reemplaza si usaste otro ID para tu imagen de prueba en la raíz
let testImageCldObject = null;
let testImageUrlDirect = '';

if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_CLOUD_NAME !== 'TU_CLOUD_NAME_AQUI') {
    testImageCldObject = cld.image(TEST_PUBLIC_ID)
                            .resize(thumbnail().width(300)) // Transformación simple
                            .delivery(quality('auto')).delivery(format('auto'));
    
    testImageUrlDirect = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_300/${TEST_PUBLIC_ID}`;
    // O si sabes que es jpg y quieres probar sin f_auto, q_auto:
    // testImageUrlDirect = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_300/${TEST_PUBLIC_ID}.jpg`;

    // Estos logs se ejecutarán al cargar el componente, no necesitan estar dentro de la función del componente.
    // Si quieres que se ejecuten solo una vez, envuélvelos en un useEffect con array vacío.
    // Por ahora, para depuración, está bien así.
    console.log("AdminPortfolioPage - TEST IMAGE - SDK URL:", testImageCldObject?.toURL());
    console.log("AdminPortfolioPage - TEST IMAGE - Direct URL:", testImageUrlDirect);
}
// ---- Fin Sección de Prueba de Imagen Simple ----


const getStoredPortfolioImages = () => {
  const images = localStorage.getItem('sevePhotographyPortfolioImages');
  return images ? JSON.parse(images) : [];
};

const storePortfolioImages = (images) => {
  localStorage.setItem('sevePhotographyPortfolioImages', JSON.stringify(images));
};

const AdminPortfolioPage = () => {
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm();
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({ message: '', type: '' });
  const [portfolioImages, setPortfolioImages] = useState([]);

  useEffect(() => {
    setPortfolioImages(getStoredPortfolioImages().reverse());
  }, []);

  const imageFile = watch("imageFile");

  useEffect(() => {
    if (imageFile && imageFile[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(imageFile[0]);
    } else {
      setImagePreview(null);
    }
  }, [imageFile]);

  const onSubmitImage = async (data) => {
    setUploadStatus({ message: '', type: '' });
    if (!data.imageFile || data.imageFile.length === 0) {
      setUploadStatus({ message: "Por favor, selecciona un archivo de imagen.", type: 'error' });
      return;
    }

    const file = data.imageFile[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    // El Upload Preset debe encargarse de la carpeta ('portfolio_uploads')
    formData.append('api_key', CLOUDINARY_API_KEY);

    setUploadStatus({ message: 'Intentando subir...', type: 'info' });

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      console.log("AdminPortfolioPage - Respuesta COMPLETA de Cloudinary:", JSON.stringify(result, null, 2));

      if (response.ok && result.secure_url) {
        setUploadStatus({ message: `¡Imagen "${data.title}" subida con éxito!`, type: 'success' });
        
        const newImageMetadata = {
          id: result.asset_id || result.public_id,
          publicId: result.public_id, 
          assetFolder: result.asset_folder,
          url: result.secure_url,
          title: data.title,
          category: data.category,
          uploadedAt: new Date().toISOString(),
        };
        console.log("AdminPortfolioPage - Metadata guardada:", newImageMetadata);

        const currentImages = getStoredPortfolioImages();
        const updatedImages = [newImageMetadata, ...currentImages];
        storePortfolioImages(updatedImages);
        setPortfolioImages(updatedImages);
        reset();
        setImagePreview(null);
      } else {
        const errorMessage = result.error?.message || `Error HTTP ${response.status}: ${response.statusText || 'Error desconocido al subir'}`;
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("AdminPortfolioPage - Error al subir imagen:", error);
      setUploadStatus({ message: `Error al subir: ${error.message}`, type: 'error' });
    }
  };

  const handleDeleteImage = (idToDelete) => {
    if (window.confirm("¿Estás segura de que quieres eliminar esta imagen del listado? (Esto no la elimina de Cloudinary)")) {
      const currentImages = getStoredPortfolioImages();
      const updatedImages = currentImages.filter(img => img.id !== idToDelete);
      storePortfolioImages(updatedImages);
      setPortfolioImages(updatedImages.reverse());
      console.log(`Imagen con id ${idToDelete} eliminada de localStorage.`);
    }
  };

  const portfolioCategories = ["Bodas", "15 Años", "Retratos", "Eventos Sociales", "Producto", "Artística", "Otros"];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold text-gray-800">Gestionar Portfolio</h1>
      
      {/* --- SECCIÓN DE PRUEBA DE IMAGEN --- */}
      <div className="my-6 p-4 border-2 border-dashed border-blue-400 bg-blue-50 rounded-md">
        <h3 className="text-lg font-semibold text-blue-700 mb-3">Prueba de Imagen Simple (ID: {TEST_PUBLIC_ID}):</h3>
        {(CLOUDINARY_CLOUD_NAME && CLOUDINARY_CLOUD_NAME !== 'TU_CLOUD_NAME_AQUI') ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <p className="text-sm mb-1 font-medium text-gray-700">1. Con AdvancedImage (SDK):</p>
              {testImageCldObject ? (
                <AdvancedImage 
                  cldImg={testImageCldObject} 
                  className="border-2 border-green-500 max-w-xs h-auto rounded shadow" 
                  alt={`Prueba SDK - ${TEST_PUBLIC_ID}`}
                  onError={(e) => console.error("Error en AdvancedImage de prueba:", e.target?.src, e)}
                />
              ) : <p className="text-xs text-red-500">No se pudo generar objeto Cloudinary para SDK.</p>}
              {testImageCldObject && <p className="text-xs mt-1 text-gray-500 break-all">URL SDK: {testImageCldObject.toURL()}</p>}
            </div>
            
            <div>
              <p className="text-sm mb-1 font-medium text-gray-700">2. Con &lt;img&gt; (URL directa):</p>
              {testImageUrlDirect ? (
                <img 
                  src={testImageUrlDirect} 
                  alt={`Prueba img tag - ${TEST_PUBLIC_ID}`}
                  className="border-2 border-purple-500 max-w-xs h-auto rounded shadow" 
                  onError={(e) => console.error("Error en <img> de prueba:", e.target?.src, e)}
                />
              ) : <p className="text-xs text-red-500">No se pudo generar URL directa.</p>}
              {testImageUrlDirect && <p className="text-xs mt-1 text-gray-500 break-all">URL Directa: {testImageUrlDirect}</p>}
            </div>
          </div>
        ) : <p className="text-red-600 font-semibold">CLOUDINARY_CLOUD_NAME no está configurado correctamente en cloudinaryConfig.js.</p>}
      </div>
      {/* --- FIN SECCIÓN DE PRUEBA --- */}


      {/* Formulario de Subida */}
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-3">Subir Nueva Imagen al Portfolio</h2>
        {uploadStatus.message && (
          <div className={`mb-4 p-3 rounded-md text-sm ${
            uploadStatus.type === 'success' ? 'bg-green-100 text-green-700' :
            uploadStatus.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {uploadStatus.message}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmitImage)} className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Título de la Imagen <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              {...register("title", { required: "El título es obligatorio." })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-script/50 focus:border-accent-script/80"
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              {...register("category", { required: "La categoría es obligatoria." })}
              className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-script/50 focus:border-accent-script/80"
            >
              <option value="">Selecciona una categoría...</option>
              {portfolioCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
          </div>
          <div>
            <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-1">
              Archivo de Imagen (4K recomendado) <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              id="imageFile"
              accept="image/jpeg, image/png, image/webp, image/heic, image/heif"
              {...register("imageFile", { required: "Debes seleccionar un archivo de imagen." })}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-beige-light file:text-accent-script hover:file:bg-accent-script/20 cursor-pointer"
            />
            {errors.imageFile && <p className="mt-1 text-xs text-red-500">{errors.imageFile.message}</p>}
          </div>
          {imagePreview && (
            <div className="mt-4 p-2 border border-gray-200 rounded-md inline-block">
              <p className="text-xs font-medium text-gray-600 mb-1">Vista Previa:</p>
              <img src={imagePreview} alt="Vista previa de la imagen" className="max-h-48 w-auto rounded shadow-sm" />
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white-off bg-accent-script hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-script disabled:opacity-60"
          >
            <UploadCloud size={18} className="mr-2"/>
            {isSubmitting ? "Subiendo..." : "Subir Imagen al Portfolio"}
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
            {portfolioImages.map(image => {
              const publicIdForThumbnail = image.assetFolder 
                                           ? `${image.assetFolder}/${image.publicId}` 
                                           : image.publicId;

              const imgThumb = cld.image(publicIdForThumbnail)
                                  .resize(thumbnail().width(200).height(150).gravity('auto'))
                                  .delivery(quality('auto')).delivery(format('auto'));
              
              console.log(`AdminPortfolioPage - Thumbnail para publicId completo '${publicIdForThumbnail}': URL -> ${imgThumb.toURL()}`);
              
              return (
                <div key={image.id} className="border border-gray-200 rounded-lg p-3 space-y-2 shadow-sm hover:shadow-md transition-shadow relative group">
                  <div className="aspect-[4/3] bg-gray-100 rounded overflow-hidden mb-2">
                    <AdvancedImage
                      cldImg={imgThumb}
                      // plugins={[]} // Sin plugins
                      className="w-full h-full object-cover"
                      alt={`Miniatura de ${image.title || 'imagen del portfolio'}`}
                      onError={(errorEvent) => console.error(`Error cargando thumbnail para ${publicIdForThumbnail}:`, errorEvent.target?.src, errorEvent)}
                    />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 truncate" title={image.title}>{image.title}</p>
                  <p className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block">{image.category}</p>
                  <p className="text-xs text-gray-400">Subida: {new Date(image.uploadedAt).toLocaleDateString()}</p>
                  
                  <div className="absolute top-2 right-2 flex flex-col space-y-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <a 
                      href={image.url}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      title="Ver imagen completa"
                      className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow"
                    >
                      <Eye size={14} />
                    </a>
                    <button 
                      onClick={() => handleDeleteImage(image.id)}
                      title="Eliminar del listado"
                      className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
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