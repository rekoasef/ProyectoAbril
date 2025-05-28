// src/pages/admin/AdminServicesPage.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { PlusCircle, Edit3, Trash2, Save, XCircle } from 'lucide-react';
import { storage } from '../../firebase/firebaseConfig'; // Importar storage de Firebase
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { getStoredServices, storeServices } from '../../utils/localStorageHelpers';

// TU API KEY DE CLOUDINARY (YA NO ES NECESARIA AQUÍ SI TODO ES FIREBASE)
// const CLOUDINARY_API_KEY = '675717664235993'; 

const AdminServicesPage = () => {
  const [services, setServices] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  
  const [serviceImageFilePreview, setServiceImageFilePreview] = useState(null);
  const [serviceImageUploadStatus, setServiceImageUploadStatus] = useState({ message: '', type: '', progress: 0 });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting: isFormSubmitting } } = useForm({
    defaultValues: {
      name: '', description: '', price: '', equipment: '', payment: '', 
      imageUrl: '', // Usaremos imageUrl para la URL de Firebase
      serviceImageFile: null
    }
  });

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
      setValue("imageUrl", editingService.imageUrl || ''); // Campo para la URL de Firebase
      // Si hay una imageUrl existente, podríamos mostrarla como preview "actual"
      if (editingService.imageUrl) {
        setServiceImageFilePreview(editingService.imageUrl); 
      } else {
        setServiceImageFilePreview(null);
      }
      setIsFormOpen(true);
    } else {
      reset(); // Limpia todos los campos, incluyendo imageUrl y serviceImageFile
      setServiceImageFilePreview(null);
    }
  }, [editingService, setValue, reset]);

  useEffect(() => {
    if (serviceImageFileWatcher && serviceImageFileWatcher[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setServiceImageFilePreview(reader.result); // Vista previa del archivo nuevo
      };
      reader.readAsDataURL(serviceImageFileWatcher[0]);
    } else if (editingService && editingService.imageUrl) {
      // Si se deselecciona un archivo nuevo y estamos editando, volver a la imagen actual del servicio
      setServiceImageFilePreview(editingService.imageUrl);
    } else if (!editingService) {
      // Si no estamos editando y no hay archivo, limpiar preview
      setServiceImageFilePreview(null);
    }
  }, [serviceImageFileWatcher, editingService]);

  const handleFormSubmit = async (data) => {
    setServiceImageUploadStatus({ message: '', type: '', progress: 0 });
    let serviceData = { ...data };
    let newImageFirebasePath = editingService?.firebasePath || null; // Para borrado si se reemplaza
    let uploadedImageUrl = editingService?.imageUrl || null; // Mantener la URL existente si no se sube nueva

    // Si se seleccionó un nuevo archivo de imagen para el servicio
    if (data.serviceImageFile && data.serviceImageFile[0]) {
      const file = data.serviceImageFile[0];
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = `service_${Date.now()}.${fileExtension}`;
      const newStorageRefPath = `services_images/${uniqueFileName}`; // Carpeta para imágenes de servicios
      const storageRef = ref(storage, newStorageRefPath);
      
      setServiceImageUploadStatus({ message: 'Subiendo imagen del servicio...', type: 'info', progress: 0 });
      const uploadTask = uploadBytesResumable(storageRef, file);

      try {
        await new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setServiceImageUploadStatus(prev => ({ ...prev, message: `Subiendo: ${Math.round(progress)}%`, progress: Math.round(progress) }));
            },
            (error) => {
              console.error("AdminServicesPage - Error en listener de subida a Firebase:", error);
              setServiceImageUploadStatus({ message: `Error subiendo imagen: ${error.code}`, type: 'error', progress: 0 });
              reject(error);
            },
            async () => {
              try {
                uploadedImageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                // Si se está editando y había una imagen anterior, borrarla de Firebase
                if (editingService && editingService.firebasePath && editingService.firebasePath !== newStorageRefPath) {
                  const oldImageRef = ref(storage, editingService.firebasePath);
                  try {
                    await deleteObject(oldImageRef);
                    console.log("Imagen anterior del servicio eliminada de Firebase:", editingService.firebasePath);
                  } catch (deleteError) {
                    console.error("Error eliminando imagen anterior del servicio de Firebase:", deleteError);
                    // No bloquear el proceso si falla el borrado de la antigua, pero loguearlo.
                  }
                }
                serviceData.firebasePath = newStorageRefPath; // Guardar el nuevo path para futuro borrado
                setServiceImageUploadStatus({ message: 'Imagen del servicio subida con éxito.', type: 'success', progress: 100 });
                resolve();
              } catch (getUrlError) {
                console.error("AdminServicesPage - Error obteniendo downloadURL para servicio:", getUrlError);
                setServiceImageUploadStatus({ message: `Error obteniendo URL: ${getUrlError.code}`, type: 'error', progress: 0 });
                reject(getUrlError);
              }
            }
          );
        });
      } catch (uploadError) {
        // El error ya se manejó en el listener, solo retornamos para no continuar.
        return;
      }
    }
    
    serviceData.imageUrl = uploadedImageUrl; // Asignar la URL de la imagen (nueva o existente)
    if (!serviceData.firebasePath && editingService) { // Si no se subió nueva imagen, mantener el path anterior
        serviceData.firebasePath = editingService.firebasePath;
    }
    delete serviceData.serviceImageFile; 

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
    reset();
    setServiceImageFilePreview(null);
    if(serviceImageUploadStatus.type === 'success' || (!data.serviceImageFile || !data.serviceImageFile[0])){
        setTimeout(() => setServiceImageUploadStatus({ message: '', type: '' }), 3000);
    }
  };

  const handleAddNewService = () => { 
    setEditingService(null);
    reset({ name: '', description: '', price: '', equipment: '', payment: '', imageUrl: '', serviceImageFile: null }); 
    setServiceImageFilePreview(null);
    setServiceImageUploadStatus({ message: '', type: '' });
    setIsFormOpen(true);
  };

  const handleEditService = (serviceToEdit) => { 
    setServiceImageUploadStatus({ message: '', type: '' });
    setEditingService(serviceToEdit);
    // El useEffect se encargará de llenar el form y abrirlo
  };

  const handleDeleteService = async (serviceToDelete) => {
    if (window.confirm(`¿Estás segura de que quieres eliminar el servicio "${serviceToDelete.name}"?`)) {
      // Si el servicio tiene una imagen en Firebase, intentar borrarla
      if (serviceToDelete.firebasePath) {
        const imageRef = ref(storage, serviceToDelete.firebasePath);
        try {
          await deleteObject(imageRef);
          console.log(`Imagen del servicio ${serviceToDelete.firebasePath} eliminada de Firebase Storage.`);
        } catch (error) {
          console.error("Error eliminando imagen del servicio de Firebase:", error);
          alert(`Error al eliminar la imagen del servicio de Firebase: ${error.message}. Es posible que necesites borrarla manualmente. El servicio se eliminará del listado local.`);
        }
      }

      const updatedServices = services.filter(s => s.id !== serviceToDelete.id);
      setServices(updatedServices);
      storeServices(updatedServices);
      if (editingService && editingService.id === serviceToDelete.id) {
        setIsFormOpen(false);
        setEditingService(null);
        reset();
      }
    }
  };
  
  const handleCancelEdit = () => { 
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
            <div>
                <div className={`p-3 rounded-md text-sm mb-2 ${
                serviceImageUploadStatus.type === 'success' ? 'bg-green-100 text-green-700' :
                serviceImageUploadStatus.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                {serviceImageUploadStatus.message}
                </div>
                {serviceImageUploadStatus.type === 'info' && serviceImageUploadStatus.progress > 0 && serviceImageUploadStatus.progress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-150" 
                    style={{ width: `${serviceImageUploadStatus.progress}%` }}
                    ></div>
                </div>
                )}
            </div>
          )}

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
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
                {/* Campo oculto para imageUrl, se llena programáticamente */}
                <input type="hidden" {...register("imageUrl")} />
                {/* Campo oculto para firebasePath, se llena programáticamente */}
                <input type="hidden" {...register("firebasePath")} />
            </div>

            <div>
              <label htmlFor="serviceImageFile" className="block text-sm font-medium text-gray-700 mb-1">
                {editingService && editingService.imageUrl ? "Reemplazar Imagen Representativa" : "Subir Imagen Representativa"} (Opcional)
              </label>
              <input
                type="file"
                id="serviceImageFile"
                accept="image/jpeg, image/png, image/webp"
                {...register("serviceImageFile")}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-beige-light file:text-accent-script hover:file:bg-accent-script/20 cursor-pointer"
              />
            </div>

            {(serviceImageFilePreview || (editingService && editingService.imageUrl && !serviceImageFileWatcher?.[0])) && (
              <div className="mt-3 p-2 border border-gray-200 rounded-md inline-block">
                <p className="text-xs font-medium text-gray-600 mb-1">
                  {serviceImageFileWatcher?.[0] ? "Vista Previa (nueva imagen):" : (editingService?.imageUrl ? "Imagen Actual:" : "Vista Previa:")}
                </p>
                <img 
                    src={serviceImageFilePreview || editingService?.imageUrl} 
                    alt="Imagen del servicio" 
                    className="max-h-40 w-auto rounded shadow-sm" 
                />
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-3">
              <button type="button" onClick={handleCancelEdit} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 border border-gray-300">
                Cancelar
              </button>
              <button type="submit" disabled={isFormSubmitting || (serviceImageUploadStatus.type === 'info' && serviceImageUploadStatus.progress < 100)} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white-off bg-accent-script rounded-md hover:bg-opacity-90 border border-transparent shadow-sm disabled:opacity-60">
                <Save size={16} className="mr-2"/>
                {isFormSubmitting ? "Guardando..." : (editingService ? "Actualizar Servicio" : "Guardar Servicio")}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md mt-10">
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
                  <div className="flex-1 min-w-0"> {/* Para que el texto se ajuste */}
                    <h3 className="font-semibold text-gray-800 text-lg">{service.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">ID: {service.id}</p>
                    <p className="text-sm text-gray-600 mt-1 max-w-prose whitespace-pre-wrap break-words">{service.description}</p>
                    {service.price && <p className="text-xs text-gray-500 mt-1"><strong>Precio:</strong> {service.price}</p>}
                    {service.imageUrl && ( // Mostrar miniatura si existe imageUrl
                        <div className="mt-2">
                            <img src={service.imageUrl} alt={`Imagen de ${service.name}`} className="max-h-20 rounded border"/>
                        </div>
                    )}
                  </div>
                  <div className="flex space-x-2 flex-shrink-0 ml-4">
                    <button onClick={() => handleEditService(service)} title="Editar" className="p-1.5 text-blue-600 hover:text-blue-800 rounded-md hover:bg-blue-100">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => handleDeleteService(service)} title="Eliminar" className="p-1.5 text-red-600 hover:text-red-800 rounded-md hover:bg-red-100">
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
