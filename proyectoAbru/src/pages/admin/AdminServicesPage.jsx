// src/pages/admin/AdminServicesPage.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { PlusCircle, Edit3, Trash2, Save, XCircle, UploadCloud } from 'lucide-react'; // Añadido UploadCloud
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../../utils/cloudinaryConfig'; // Para la subida

// TU API KEY DE CLOUDINARY (necesaria para la subida)
const CLOUDINARY_API_KEY = '675717664235993'; // Reemplaza si es diferente

const getStoredServices = () => {
  const servicesData = localStorage.getItem('sevePhotographyServices');
  // Devolver un array vacío si no hay nada o si lo que hay no es un array válido
  try {
    const parsed = JSON.parse(servicesData);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

const storeServices = (services) => {
  localStorage.setItem('sevePhotographyServices', JSON.stringify(services));
};

const AdminServicesPage = () => {
  const [services, setServices] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  
  // Estados para la subida de imagen del servicio
  const [serviceImageFilePreview, setServiceImageFilePreview] = useState(null);
  const [serviceImageUploadStatus, setServiceImageUploadStatus] = useState({ message: '', type: '' });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: '', description: '', price: '', equipment: '', payment: '', imagePublicId: '', serviceImageFile: null
    }
  });

  // Observar el campo de archivo para la vista previa
  const serviceImageFileWatcher = watch("serviceImageFile");

  useEffect(() => {
    setServices(getStoredServices().sort((a, b) => a.name.localeCompare(b.name)));
  }, []);

  useEffect(() => {
    if (editingService) {
      setValue("name", editingService.name);
      setValue("description", editingService.description);
      setValue("price", editingService.price);
      setValue("equipment", editingService.equipment || '');
      setValue("payment", editingService.payment || '');
      setValue("imagePublicId", editingService.imagePublicId || ''); // Esto se mantendrá si no se sube nueva imagen
      // No pre-llenamos serviceImageFile, pero sí la preview si existe un imagePublicId
      if (editingService.imagePublicId) {
        // Podríamos intentar mostrar la imagen actual de Cloudinary aquí si quisiéramos
        // Por ahora, la preview solo será para archivos nuevos.
        setServiceImageFilePreview(null); // Limpiar preview de archivo anterior
      }
      setIsFormOpen(true);
    } else {
      reset();
      setServiceImageFilePreview(null);
    }
  }, [editingService, setValue, reset]);

  useEffect(() => {
    if (serviceImageFileWatcher && serviceImageFileWatcher[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setServiceImageFilePreview(reader.result);
      };
      reader.readAsDataURL(serviceImageFileWatcher[0]);
    } else if (!editingService?.imagePublicId) { // Si no estamos editando o el editado no tiene imagen, limpiar preview
      setServiceImageFilePreview(null);
    }
  }, [serviceImageFileWatcher, editingService]);

  const handleFormSubmit = async (data) => {
    setServiceImageUploadStatus({ message: '', type: '' });
    let serviceData = { ...data }; // Copia los datos del formulario
    let uploadedImagePublicId = editingService?.imagePublicId || null; // Mantener el ID existente si se edita y no se sube nuevo

    // Si se seleccionó un nuevo archivo de imagen para el servicio
    if (data.serviceImageFile && data.serviceImageFile[0]) {
      setServiceImageUploadStatus({ message: 'Subiendo imagen del servicio...', type: 'info' });
      const file = data.serviceImageFile[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET); // Usar el mismo preset del portfolio
      // El preset ya debería definir la carpeta (ej. 'portfolio_uploads' o una específica para servicios)
      // Si quieres una carpeta específica para imágenes de servicios, ej. 'servicios_seve':
      // formData.append('folder', 'servicios_seve'); // Opcional, si el preset no lo hace o quieres anular
      formData.append('api_key', CLOUDINARY_API_KEY);

      try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();
        console.log("AdminServicesPage - Respuesta Cloudinary para imagen de servicio:", JSON.stringify(result, null, 2));

        if (response.ok && result.public_id) {
          // Construir el publicId completo si Cloudinary devuelve asset_folder
          uploadedImagePublicId = result.asset_folder 
                                  ? `${result.asset_folder}/${result.public_id}` 
                                  : result.public_id;
          setServiceImageUploadStatus({ message: 'Imagen del servicio subida con éxito.', type: 'success' });
        } else {
          const errorMessage = result.error?.message || `Error HTTP ${response.status}: ${response.statusText || 'Error al subir imagen de servicio'}`;
          setServiceImageUploadStatus({ message: `Error subiendo imagen: ${errorMessage}`, type: 'error' });
          // No continuar si la subida de imagen falla
          return; 
        }
      } catch (error) {
        console.error("AdminServicesPage - Error al subir imagen de servicio:", error);
        setServiceImageUploadStatus({ message: `Error al subir imagen: ${error.message}`, type: 'error' });
        return;
      }
    }
    
    serviceData.imagePublicId = uploadedImagePublicId; // Asignar el publicId de la imagen (nueva o existente)
    delete serviceData.serviceImageFile; // No queremos guardar el objeto File en localStorage

    let updatedServices;
    if (editingService) {
      updatedServices = services.map(s =>
        s.id === editingService.id ? { ...editingService, ...serviceData } : s
      );
    } else {
      const newService = { ...serviceData, id: `service-${Date.now()}` };
      updatedServices = [...services, newService];
    }
    updatedServices.sort((a, b) => a.name.localeCompare(b.name));
    setServices(updatedServices);
    storeServices(updatedServices);
    
    setEditingService(null);
    setIsFormOpen(false);
    reset(); // Esto limpiará serviceImageFile también
    setServiceImageFilePreview(null);
    // Limpiar el mensaje de estado de subida después de un pequeño delay si fue exitoso
    if(serviceImageUploadStatus.type === 'success' || !data.serviceImageFile || !data.serviceImageFile[0]){
        setTimeout(() => setServiceImageUploadStatus({ message: '', type: '' }), 3000);
    }
  };

  const handleAddNewService = () => { /* ... (sin cambios) ... */ 
    setEditingService(null);
    reset(); 
    setServiceImageFilePreview(null);
    setServiceImageUploadStatus({ message: '', type: '' });
    setIsFormOpen(true);
  };
  const handleEditService = (serviceToEdit) => { /* ... (sin cambios) ... */ 
    setServiceImageUploadStatus({ message: '', type: '' });
    setEditingService(serviceToEdit);
  };
  const handleDeleteService = (serviceId) => { /* ... (sin cambios) ... */ 
    if (window.confirm("¿Estás segura de que quieres eliminar este servicio?")) {
      const updatedServices = services.filter(s => s.id !== serviceId);
      setServices(updatedServices);
      storeServices(updatedServices);
      if (editingService && editingService.id === serviceId) {
        setIsFormOpen(false);
        setEditingService(null);
        reset();
      }
    }
  };
  const handleCancelEdit = () => { /* ... (sin cambios) ... */ 
    setIsFormOpen(false);
    setEditingService(null);
    reset();
    setServiceImageFilePreview(null);
    setServiceImageUploadStatus({ message: '', type: '' });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-gray-800">Gestionar Servicios</h1>
          {!isFormOpen && (
            <button
              onClick={handleAddNewService}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-accent-script text-white-off text-sm font-medium rounded-md shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-script transition-colors duration-150"
              // Clases ajustadas:
              // - bg-accent-script text-white-off (colores principales)
              // - px-5 py-2.5 (un poco más de padding para un botón principal)
              // - shadow-sm (sombra sutil)
              // - hover:bg-opacity-90 (efecto hover sutil sobre el mismo color)
              // - focus:ring-accent-script (anillo de foco)
              // - transition-colors duration-150 (transición suave)
            >
              <PlusCircle size={18} className="mr-2" />
              Añadir Nuevo Servicio
            </button>
          )}
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6 border-b pb-3">
            <h2 className="text-xl font-semibold text-gray-700">
              {editingService ? "Editar Servicio" : "Añadir Nuevo Servicio"}
            </h2>
            <button onClick={handleCancelEdit} className="p-1 text-gray-400 hover:text-red-600">
              <XCircle size={22}/>
            </button>
          </div>

          {serviceImageUploadStatus.message && (
            <div className={`mb-4 p-3 rounded-md text-sm ${
              serviceImageUploadStatus.type === 'success' ? 'bg-green-100 text-green-700' :
              serviceImageUploadStatus.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {serviceImageUploadStatus.message}
            </div>
          )}

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
            {/* ... Campos name, description, price, equipment, payment sin cambios ... */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Servicio <span className="text-red-500">*</span></label>
              <input type="text" id="name" {...register("name", { required: "El nombre es obligatorio" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-script/50 focus:border-accent-script/80" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
              <textarea id="description" rows="4" {...register("description", { required: "La descripción es obligatoria" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-script/50 focus:border-accent-script/80"></textarea>
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Precio (ej: $XXX o Consultar) <span className="text-red-500">*</span></label>
                    <input type="text" id="price" {...register("price", { required: "El precio es obligatorio" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-script/50 focus:border-accent-script/80" />
                    {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
                </div>
                <div>
                    <label htmlFor="equipment" className="block text-sm font-medium text-gray-700 mb-1">Equipo Usado (resumen)</label>
                    <input type="text" id="equipment" {...register("equipment")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-script/50 focus:border-accent-script/80" />
                </div>
                <div>
                    <label htmlFor="payment" className="block text-sm font-medium text-gray-700 mb-1">Formas de Pago</label>
                    <input type="text" id="payment" {...register("payment")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-script/50 focus:border-accent-script/80" />
                </div>
                {/* Campo para el Public ID (ya no es para input manual si siempre se sube) */}
                {/* Podríamos ocultarlo y solo llenarlo programáticamente, o mostrar el actual si se edita */}
                {editingService && editingService.imagePublicId && (
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Imagen Actual (Public ID)</label>
                        <input 
                            type="text" 
                            {...register("imagePublicId")} // Registrado para que se incluya en 'data' si no se sube nueva
                            readOnly 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 text-xs" 
                        />
                        {/* Aquí podríamos mostrar una miniatura de la imagen actual si quisiéramos */}
                    </div>
                )}
            </div>

            {/* Nuevo Input para subir imagen del servicio */}
            <div>
              <label htmlFor="serviceImageFile" className="block text-sm font-medium text-gray-700 mb-1">
                {editingService && editingService.imagePublicId ? "Reemplazar Imagen Representativa" : "Subir Imagen Representativa"} (Opcional)
              </label>
              <input
                type="file"
                id="serviceImageFile"
                accept="image/jpeg, image/png, image/webp"
                {...register("serviceImageFile")} // No es requerido
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-beige-light file:text-accent-script hover:file:bg-accent-script/20 cursor-pointer"
              />
            </div>

            {serviceImageFilePreview && (
              <div className="mt-3 p-2 border border-gray-200 rounded-md inline-block">
                <p className="text-xs font-medium text-gray-600 mb-1">Vista Previa (nueva imagen):</p>
                <img src={serviceImageFilePreview} alt="Vista previa" className="max-h-40 w-auto rounded shadow-sm" />
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-3">
              {/* ... botones Cancelar y Guardar ... */}
              <button type="button" onClick={handleCancelEdit} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 border border-gray-300">
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white-off bg-accent-script rounded-md hover:bg-opacity-90 border border-transparent shadow-sm disabled:opacity-60">
                <Save size={16} className="mr-2"/>
                {isSubmitting ? "Guardando..." : (editingService ? "Actualizar Servicio" : "Guardar Servicio")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Listado de Servicios Existentes (sin cambios en su JSX interno) */}
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md mt-10">
        {/* ... (JSX del listado de servicios) ... */}
        <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-3">Listado de Servicios ({services.length})</h2>
        {services.length === 0 && !isFormOpen ? (
          <p className="text-sm text-gray-500">No hay servicios creados. Haz clic en "Añadir Nuevo Servicio" para empezar.</p>
        ) : services.length === 0 && isFormOpen ? (
            <p className="text-sm text-gray-500">No hay servicios creados aún.</p>
        ) : (
          <ul className="space-y-4">
            {services.map(service => (
              <li key={service.id} className="p-4 border border-gray-200 rounded-md hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">{service.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">ID: {service.id}</p>
                    <p className="text-sm text-gray-600 mt-1 max-w-prose whitespace-pre-wrap">{service.description}</p>
                    {service.price && <p className="text-xs text-gray-500 mt-1"><strong>Precio:</strong> {service.price}</p>}
                    {service.imagePublicId && <p className="text-xs text-gray-500 mt-1"><strong>Img ID:</strong> {service.imagePublicId}</p>}
                  </div>
                  <div className="flex space-x-2 flex-shrink-0 ml-4">
                    <button onClick={() => handleEditService(service)} title="Editar" className="p-1.5 text-blue-600 hover:text-blue-800 rounded-md hover:bg-blue-100">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => handleDeleteService(service.id)} title="Eliminar" className="p-1.5 text-red-600 hover:text-red-800 rounded-md hover:bg-red-100">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
export default AdminServicesPage;