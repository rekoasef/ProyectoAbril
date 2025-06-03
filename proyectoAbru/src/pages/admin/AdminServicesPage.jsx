// src/pages/admin/AdminServicesPage.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { PlusCircle, Edit3, Trash2, Save, XCircle } from 'lucide-react';
// Importaciones de Firebase: db (Firestore) y storage
import { storage, db } from '../../firebase/firebaseConfig';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

// Las funciones de localStorage ya no son necesarias aquí
// import { getStoredServices, storeServices } from '../../utils/localStorageHelpers';

const AdminServicesPage = () => {
  const [services, setServices] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState(null); // null para nuevo, objeto para editar
  
  const [serviceImageFilePreview, setServiceImageFilePreview] = useState(null);
  const [serviceImageUploadStatus, setServiceImageUploadStatus] = useState({ message: '', type: '', progress: 0 });
  const [isLoading, setIsLoading] = useState(true); // Estado para carga inicial

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting: isFormSubmitting } } = useForm({
    defaultValues: {
      name: '', 
      description: '', 
      price: '', 
      equipment: '', 
      payment: '', 
      imageUrl: '', // Para la URL de la imagen de Firebase
      firebasePath: '', // Para la ruta de la imagen en Storage
      serviceImageFile: null
    }
  });

  const serviceImageFileWatcher = watch("serviceImageFile");

  // Efecto para cargar servicios desde Firestore
  useEffect(() => {
    setIsLoading(true);
    const servicesCollectionRef = collection(db, "services_items");
    // Ordenar por nombre o por fecha de creación, ej: orderBy("createdAt", "desc") o orderBy("name")
    const q = query(servicesCollectionRef, orderBy("name", "asc")); 

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const servicesData = [];
      querySnapshot.forEach((document) => {
        servicesData.push({ id: document.id, ...document.data() });
      });
      setServices(servicesData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error cargando servicios desde Firestore: ", error);
      setServiceImageUploadStatus({ message: `Error al cargar servicios: ${error.message}`, type: 'error' });
      setIsLoading(false);
    });

    return () => unsubscribe(); // Limpiar listener al desmontar
  }, []);

  // Efecto para popular el formulario cuando se edita un servicio
  useEffect(() => {
    if (editingService) {
      setValue("name", editingService.name);
      setValue("description", editingService.description);
      setValue("price", editingService.price);
      setValue("equipment", editingService.equipment || '');
      setValue("payment", editingService.payment || '');
      setValue("imageUrl", editingService.imageUrl || ''); 
      setValue("firebasePath", editingService.firebasePath || '');
      
      if (editingService.imageUrl) {
        setServiceImageFilePreview(editingService.imageUrl); 
      } else {
        setServiceImageFilePreview(null);
      }
      setIsFormOpen(true);
    } else {
      // Resetear formulario a valores por defecto, incluyendo imageUrl y firebasePath
      reset({
        name: '', description: '', price: '', equipment: '', payment: '', 
        imageUrl: '', firebasePath: '', serviceImageFile: null
      });
      setServiceImageFilePreview(null);
    }
  }, [editingService, setValue, reset]);

  // Efecto para la vista previa de la imagen del servicio
  useEffect(() => {
    if (serviceImageFileWatcher && serviceImageFileWatcher[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setServiceImageFilePreview(reader.result);
      };
      reader.readAsDataURL(serviceImageFileWatcher[0]);
    } else if (editingService && editingService.imageUrl) {
      setServiceImageFilePreview(editingService.imageUrl);
    } else if (!editingService) {
      setServiceImageFilePreview(null);
    }
  }, [serviceImageFileWatcher, editingService]);

  // Manejar submit del formulario (crear o actualizar servicio)
  const handleFormSubmit = async (data) => {
    setServiceImageUploadStatus({ message: '', type: '', progress: 0 });
    let serviceDataToSave = { // Usar una nueva variable para los datos a guardar
      name: data.name,
      description: data.description,
      price: data.price,
      equipment: data.equipment || '',
      payment: data.payment || '',
      imageUrl: editingService?.imageUrl || '', // Mantener URL existente si no se sube nueva
      firebasePath: editingService?.firebasePath || '', // Mantener path existente
      // Añadir o actualizar timestamp
      createdAt: editingService?.createdAt || serverTimestamp(), // Mantener si existe, sino nuevo
      lastModifiedAt: serverTimestamp()
    };

    // Si se seleccionó un nuevo archivo de imagen para el servicio
    if (data.serviceImageFile && data.serviceImageFile[0]) {
      const file = data.serviceImageFile[0];
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = `service_${data.name.replace(/\s+/g, '_') || 'item'}_${Date.now()}.${fileExtension}`;
      const newStorageRefPath = `services_images/${uniqueFileName}`;
      const storageRefInstance = ref(storage, newStorageRefPath);
      
      setServiceImageUploadStatus({ message: 'Subiendo imagen del servicio...', type: 'info', progress: 0 });
      const uploadTask = uploadBytesResumable(storageRefInstance, file);

      try {
        // Esperar a que la subida se complete
        await new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setServiceImageUploadStatus(prev => ({ ...prev, message: `Subiendo: ${Math.round(progress)}%`, progress: Math.round(progress) }));
            },
            (error) => {
              console.error("AdminServicesPage - Error en subida a Firebase Storage:", error);
              setServiceImageUploadStatus({ message: `Error subiendo imagen: ${error.code}`, type: 'error', progress: 0 });
              reject(error); // Rechazar la promesa para detener el proceso
            },
            async () => { // Cuando la subida se completa
              try {
                const uploadedImageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                serviceDataToSave.imageUrl = uploadedImageUrl;
                serviceDataToSave.firebasePath = newStorageRefPath;

                // Si se está editando y había una imagen anterior, borrarla de Firebase Storage
                if (editingService && editingService.firebasePath && editingService.firebasePath !== newStorageRefPath) {
                  const oldImageRef = ref(storage, editingService.firebasePath);
                  await deleteObject(oldImageRef).catch(delError => console.warn("No se pudo borrar imagen anterior de Storage:", delError));
                }
                setServiceImageUploadStatus({ message: 'Imagen del servicio subida con éxito.', type: 'success', progress: 100 });
                resolve(); // Resolver la promesa
              } catch (getUrlError) {
                console.error("AdminServicesPage - Error obteniendo downloadURL:", getUrlError);
                setServiceImageUploadStatus({ message: `Error obteniendo URL: ${getUrlError.code}`, type: 'error', progress: 0 });
                reject(getUrlError); // Rechazar la promesa
              }
            }
          );
        });
      } catch (uploadError) {
        // El error ya se manejó y mostró, simplemente no continuar con el guardado en Firestore.
        return; 
      }
    }
    
    // Guardar o actualizar en Firestore
    try {
      if (editingService) {
        // Actualizar documento existente
        const serviceDocRef = doc(db, "services_items", editingService.id);
        await updateDoc(serviceDocRef, serviceDataToSave);
        setServiceImageUploadStatus(prev => ({ ...prev, message: prev.message || 'Servicio actualizado con éxito.', type: prev.type === 'error' ? 'error' : 'success'}));
      } else {
        // Crear nuevo documento
        await addDoc(collection(db, "services_items"), serviceDataToSave);
        setServiceImageUploadStatus(prev => ({ ...prev, message: prev.message || 'Servicio creado con éxito.', type: prev.type === 'error' ? 'error' : 'success'}));
      }
      
      setEditingService(null);
      setIsFormOpen(false);
      reset(); // Limpia el formulario completo
      setServiceImageFilePreview(null);
      // Limpiar mensaje de éxito después de un tiempo si no hubo error de subida
      if(serviceImageUploadStatus.type !== 'error' && (!data.serviceImageFile || !data.serviceImageFile[0])){
          setTimeout(() => setServiceImageUploadStatus({ message: '', type: '' }), 3000);
      } else if (serviceImageUploadStatus.type === 'success') {
          setTimeout(() => setServiceImageUploadStatus({ message: '', type: '' }), 3000);
      }

    } catch (firestoreError) {
        console.error("Error guardando servicio en Firestore:", firestoreError);
        setServiceImageUploadStatus({ message: `Error guardando servicio: ${firestoreError.message}`, type: 'error' });
    }
  };

  const handleAddNewService = () => { 
    setEditingService(null); // Asegura que se está creando uno nuevo
    // El useEffect [editingService] se encargará de resetear el formulario
    setServiceImageUploadStatus({ message: '', type: '' });
    setIsFormOpen(true);
  };

  const handleEditService = (serviceToEdit) => { 
    setServiceImageUploadStatus({ message: '', type: '' });
    setEditingService(serviceToEdit);
    // El useEffect [editingService] se encargará de llenar el form y abrirlo
  };

  const handleDeleteService = async (serviceToDelete) => {
    if (!serviceToDelete || !serviceToDelete.id) {
        alert("Error: No se puede eliminar el servicio. Información incompleta.");
        return;
    }
    if (window.confirm(`¿Estás segura de que quieres eliminar el servicio "${serviceToDelete.name}"?`)) {
      try {
        // Si el servicio tiene una imagen en Firebase Storage, intentar borrarla
        if (serviceToDelete.firebasePath) {
          const imageRef = ref(storage, serviceToDelete.firebasePath);
          await deleteObject(imageRef);
          console.log(`Imagen del servicio ${serviceToDelete.firebasePath} eliminada de Firebase Storage.`);
        }

        // Eliminar el documento del servicio de Firestore
        await deleteDoc(doc(db, "services_items", serviceToDelete.id));
        console.log(`Servicio ${serviceToDelete.id} eliminado de Firestore.`);
        
        // La UI se actualizará automáticamente por el listener onSnapshot
        alert(`Servicio "${serviceToDelete.name}" eliminado con éxito.`);
        if (editingService && editingService.id === serviceToDelete.id) {
          setIsFormOpen(false);
          setEditingService(null);
          reset();
        }
      } catch (error) {
        console.error("Error eliminando servicio:", error);
        alert(`Error al eliminar el servicio: ${error.message}. Es posible que necesites borrar la imagen manualmente si el servicio ya fue eliminado de la lista.`);
      }
    }
  };
  
  const handleCancelEdit = () => { 
    setIsFormOpen(false);
    setEditingService(null);
    // reset() es llamado por el useEffect de editingService
    setServiceImageUploadStatus({ message: '', type: '' });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-gray-800">Gestionar Servicios (Firestore)</h1>
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

          {/* Mensaje de estado y barra de progreso de subida de imagen */}
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

          {/* Formulario */}
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
                {/* Campos ocultos para imageUrl y firebasePath, se llenan programáticamente */}
                <input type="hidden" {...register("imageUrl")} />
                <input type="hidden" {...register("firebasePath")} />
            </div>

            {/* Input para subir imagen del servicio */}
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

            {/* Vista previa de la imagen del servicio */}
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
            
            {/* Botones de acción del formulario */}
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

      {/* Listado de Servicios */}
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md mt-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-3">Listado de Servicios ({services.length})</h2>
        {isLoading ? (
            <p className="text-sm text-gray-500">Cargando servicios...</p>
        ) : services.length === 0 && !isFormOpen ? (
          <p className="text-sm text-gray-500">No hay servicios creados. Haz clic en "Añadir Nuevo Servicio" para empezar.</p>
        ) : services.length === 0 && isFormOpen ? (
            <p className="text-sm text-gray-500">No hay servicios creados aún.</p>
        ) : (
          <ul className="space-y-4">
            {services.map(service => (
              <li key={service.id} className="p-4 border border-gray-200 rounded-md hover:shadow-sm transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start">
                  <div className="flex-1 min-w-0 mb-3 sm:mb-0">
                    <h3 className="font-semibold text-gray-800 text-lg">{service.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">ID: {service.id}</p>
                    <p className="text-sm text-gray-600 mt-1 max-w-prose whitespace-pre-wrap break-words">{service.description}</p>
                    {service.price && <p className="text-xs text-gray-500 mt-1"><strong>Precio:</strong> {service.price}</p>}
                    {service.imageUrl && (
                        <div className="mt-2">
                            <img src={service.imageUrl} alt={`Imagen de ${service.name}`} className="max-h-20 w-auto rounded border"/>
                        </div>
                    )}
                  </div>
                  <div className="flex space-x-2 flex-shrink-0 self-start sm:self-center sm:ml-4">
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
