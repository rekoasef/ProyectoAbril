// src/pages/admin/AdminReviewsPage.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { PlusCircle, Edit3, Trash2, Save, XCircle, Star } from 'lucide-react';
import { db } from '../../firebase/firebaseConfig'; // Importar db de Firebase
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp, // Para la fecha de creación/actualización
  Timestamp // Para convertir fechas si es necesario
} from 'firebase/firestore';
// Ya no usaremos los helpers de localStorage para las reseñas aquí
// import { getStoredReviews, storeReviews } from '../../utils/localStorageHelpers';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null); // null para nueva, objeto para editar
  const [isLoading, setIsLoading] = useState(true); // Para estado de carga inicial

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      clientName: '',
      reviewText: '',
      rating: 5,
      date: new Date().toISOString().split('T')[0],
      approved: false, // Por defecto, las nuevas reseñas creadas por el admin podrían ser no aprobadas o aprobadas
    }
  });

  useEffect(() => {
    setIsLoading(true);
    // Escuchar cambios en la colección 'reviews' de Firestore, ordenadas por 'submittedAt' o 'date'
    // Usaremos 'submittedAt' si lo guardamos con serverTimestamp(), o 'date' si es el campo que el admin puede editar.
    // Si las reseñas de los usuarios usan 'submittedAt' y las del admin 'date', hay que unificar o manejar ambos.
    // Por ahora, asumamos que todas las reseñas tendrán un campo 'date' (string) o 'submittedAt' (Timestamp de Firebase).
    // Vamos a ordenar por 'submittedAt' si existe, sino por 'date' (más nuevas primero).
    // Firestore no permite ordenar por campos que no existen en todos los documentos de la consulta.
    // Es mejor tener un campo de fecha consistente, ej. 'createdAt' con serverTimestamp().
    
    // Para las reseñas enviadas por usuarios, guardamos 'submittedAt' (Timestamp)
    // Para las creadas por admin, guardamos 'date' (string YYYY-MM-DD)
    // Vamos a priorizar 'submittedAt' si existe, y si no, 'date'.
    // Firestore es más eficiente si ordenas por un campo que todos los documentos tienen.
    // Considera añadir 'createdAt: serverTimestamp()' a las reseñas que el admin crea.

    const reviewsCollectionRef = collection(db, "reviews");
    // Ordenar por 'submittedAt' descendente (más nuevas primero). Si algunas no tienen 'submittedAt', no aparecerán en este orden.
    // O puedes ordenar por 'date' si todas tienen ese campo como string y es consistente.
    // Para mejor ordenamiento, todas las reseñas deberían tener un campo de timestamp común.
    // Vamos a asumir que las reseñas de usuarios tienen 'submittedAt' y las del admin 'date'.
    // Esto puede ser problemático para ordenar. Lo ideal es unificar.
    // Por ahora, ordenaremos por 'date' que el admin puede controlar.
    const q = query(reviewsCollectionRef, orderBy("date", "desc"));


    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reviewsData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reviewsData.push({ 
          id: doc.id, 
          ...data,
          // Asegurar que 'date' sea un string YYYY-MM-DD para el input type="date"
          // y que 'approved' sea un booleano
          date: data.date ? (data.date.toDate ? new Date(data.date.toDate()).toISOString().split('T')[0] : data.date) : new Date().toISOString().split('T')[0],
          approved: data.approved === true, // Asegurar que sea booleano
        });
      });
      // Si las reseñas de usuarios tienen 'submittedAt' y las del admin 'date',
      // necesitaríamos una lógica de ordenamiento más compleja aquí después de obtener los datos,
      // o unificar el campo de fecha en Firestore.
      // Por ahora, el orderBy("date", "desc") de Firestore se aplicará.
      setReviews(reviewsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching reviews from Firestore: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe(); // Limpiar el listener al desmontar
  }, []);

  useEffect(() => {
    if (editingReview) {
      setValue("clientName", editingReview.clientName);
      setValue("reviewText", editingReview.reviewText);
      setValue("rating", editingReview.rating || 5);
      // Asegurar que la fecha esté en formato YYYY-MM-DD para el input
      const dateToSet = editingReview.date ? 
        (editingReview.date.toDate ? new Date(editingReview.date.toDate()).toISOString().split('T')[0] : editingReview.date) 
        : new Date().toISOString().split('T')[0];
      setValue("date", dateToSet);
      setValue("approved", editingReview.approved !== undefined ? editingReview.approved : false);
      setIsFormOpen(true);
    } else {
      reset({
        clientName: '',
        reviewText: '',
        rating: 5,
        date: new Date().toISOString().split('T')[0],
        approved: false, // Nuevas reseñas por defecto no aprobadas (o true si prefieres)
      });
    }
  }, [editingReview, setValue, reset]);

  const handleFormSubmit = async (data) => {
    console.log("AdminReviewsPage - handleFormSubmit - Datos recibidos:", data);
    const reviewDataToSave = {
      clientName: data.clientName,
      reviewText: data.reviewText,
      rating: parseInt(data.rating, 10),
      date: data.date, // Guardar como string YYYY-MM-DD
      approved: !!data.approved,
      // Si es una reseña nueva creada por el admin, podríamos añadir un serverTimestamp()
      // para un campo 'adminCreatedAt' o 'lastModifiedAt'
      lastModifiedAt: serverTimestamp()
    };

    if (editingReview) {
      console.log("AdminReviewsPage - Actualizando reseña ID:", editingReview.id);
      const reviewDocRef = doc(db, "reviews", editingReview.id);
      try {
        await updateDoc(reviewDocRef, reviewDataToSave);
        console.log("Reseña actualizada en Firestore");
      } catch (error) {
        console.error("Error actualizando reseña en Firestore: ", error);
        alert("Error al actualizar la reseña.");
        return;
      }
    } else {
      console.log("AdminReviewsPage - Creando nueva reseña");
      // Para nuevas reseñas, también añadir 'submittedAt' para consistencia con las de usuarios
      // o un campo 'createdAt' general.
      reviewDataToSave.createdAt = serverTimestamp(); 
      try {
        await addDoc(collection(db, "reviews"), reviewDataToSave);
        console.log("Nueva reseña añadida a Firestore");
      } catch (error) {
        console.error("Error añadiendo reseña a Firestore: ", error);
        alert("Error al guardar la nueva reseña.");
        return;
      }
    }
    
    setEditingReview(null);
    setIsFormOpen(false);
    reset();
  };

  const handleAddNewReview = () => {
    setEditingReview(null);
    // reset() ya se encarga de los valores por defecto en el useEffect
    setIsFormOpen(true);
  };

  const handleEditReview = (reviewToEdit) => {
    setEditingReview(reviewToEdit);
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("¿Estás segura de que quieres eliminar esta reseña permanentemente de la base de datos?")) {
      console.log("AdminReviewsPage - Eliminando reseña ID:", reviewId);
      const reviewDocRef = doc(db, "reviews", reviewId);
      try {
        await deleteDoc(reviewDocRef);
        console.log("Reseña eliminada de Firestore");
        // El listener onSnapshot actualizará la lista automáticamente
        if (editingReview && editingReview.id === reviewId) {
          setIsFormOpen(false);
          setEditingReview(null);
          reset();
        }
      } catch (error) {
        console.error("Error eliminando reseña de Firestore: ", error);
        alert("Error al eliminar la reseña.");
      }
    }
  };

  const handleToggleApproved = async (reviewId, currentApprovalStatus) => {
    console.log(`AdminReviewsPage - Cambiando estado de aprobación para reseña ID: ${reviewId} a ${!currentApprovalStatus}`);
    const reviewDocRef = doc(db, "reviews", reviewId);
    try {
      await updateDoc(reviewDocRef, {
        approved: !currentApprovalStatus,
        lastModifiedAt: serverTimestamp()
      });
      console.log("Estado de aprobación actualizado en Firestore.");
      // onSnapshot actualizará la UI
    } catch (error) {
      console.error("Error actualizando estado de aprobación: ", error);
      alert("Error al cambiar el estado de aprobación.");
    }
  };

  const handleCancelEdit = () => {
    setIsFormOpen(false);
    setEditingReview(null);
    reset();
  };

  if (isLoading) {
    return <div className="text-center p-10">Cargando reseñas...</div>;
  }

  return (
    <div className="space-y-8">
      {/* ... (JSX del título y botón "Añadir Nueva Reseña" sin cambios) ... */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-gray-800">Gestionar Reseñas</h1>
        {!isFormOpen && (
          <button
            onClick={handleAddNewReview}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-accent-script text-white-off text-sm font-medium rounded-md shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-script transition-colors duration-150"
          >
            <PlusCircle size={18} className="mr-2" />
            Añadir Nueva Reseña
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
          {/* ... (JSX del formulario sin cambios estructurales, pero ahora interactúa con Firestore) ... */}
          <div className="flex justify-between items-center mb-6 border-b pb-3">
            <h2 className="text-xl font-semibold text-gray-700">
              {editingReview ? "Editar Reseña" : "Añadir Nueva Reseña"}
            </h2>
            <button onClick={handleCancelEdit} className="p-1 text-gray-400 hover:text-red-600">
                <XCircle size={22}/>
            </button>
          </div>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
            <div>
              <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Cliente <span className="text-red-500">*</span></label>
              <input type="text" id="clientName" {...register("clientName", { required: "El nombre del cliente es obligatorio." })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-script/50 focus:border-accent-script/80" />
              {errors.clientName && <p className="text-xs text-red-500 mt-1">{errors.clientName.message}</p>}
            </div>
            <div>
              <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700 mb-1">Texto de la Reseña <span className="text-red-500">*</span></label>
              <textarea id="reviewText" rows="5" {...register("reviewText", { required: "El texto de la reseña es obligatorio." })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-script/50 focus:border-accent-script/80"></textarea>
              {errors.reviewText && <p className="text-xs text-red-500 mt-1">{errors.reviewText.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5 items-end">
                <div>
                    <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">Puntuación (1-5)</label>
                    <select id="rating" {...register("rating")}
                        className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-script/50 focus:border-accent-script/80">
                        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Estrella{n > 1 ? 's' : ''}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                    <input type="date" id="date" {...register("date")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-script/50 focus:border-accent-script/80" />
                </div>
                 <div>
                    <label htmlFor="approved" className="flex items-center space-x-2 cursor-pointer mt-2 md:mt-0 py-2">
                        <input type="checkbox" id="approved" {...register("approved")} 
                               className="h-4 w-4 text-accent-script border-gray-300 rounded focus:ring-accent-script" />
                        <span className="text-sm font-medium text-gray-700">Aprobada</span>
                    </label>
                </div>
            </div>
            <div className="flex justify-end space-x-3 pt-3">
              <button type="button" onClick={handleCancelEdit} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 border border-gray-300">
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white-off bg-accent-script rounded-md hover:bg-opacity-90 border border-transparent shadow-sm disabled:opacity-60">
                <Save size={16} className="mr-2"/>
                {isSubmitting ? "Guardando..." : (editingReview ? "Actualizar Reseña" : "Guardar Reseña")}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md mt-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-3">Listado de Reseñas ({reviews.length})</h2>
        {/* ... (JSX del listado de reseñas, pero ahora los botones llaman a las funciones de Firestore) ... */}
        {reviews.length === 0 && !isFormOpen ? (
          <p className="text-sm text-gray-500">No hay reseñas. Las que envíen los usuarios aparecerán aquí pendientes de aprobación.</p>
        ) : reviews.length === 0 && isFormOpen ? (
            <p className="text-sm text-gray-500">No hay reseñas aún.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className={`p-4 border rounded-md ${review.approved ? 'border-gray-200 bg-white' : 'border-yellow-400 bg-yellow-50'} hover:shadow-sm`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-1">
                        <h3 className="font-semibold text-gray-800 text-lg mr-3">{review.clientName}</h3>
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < review.rating ? 'fill-current' : 'stroke-current text-gray-300'} />)}
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">
                        {/* Mostrar la fecha de 'submittedAt' si existe (de usuarios) o 'date' (de admin) */}
                        {review.submittedAt?.toDate ? new Date(review.submittedAt.toDate()).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : (review.date ? new Date(review.date + 'T00:00:00').toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Fecha no disponible')}
                        <span className={`ml-3 px-2 py-0.5 text-xs rounded-full ${review.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {review.approved ? "Aprobada" : "Pendiente"}
                        </span>
                    </p>
                    <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap break-words">{review.reviewText}</p>
                  </div>
                  <div className="flex flex-col space-y-2 flex-shrink-0 ml-4 items-end">
                    <div className="flex space-x-2">
                        <button onClick={() => handleEditReview(review)} title="Editar" className="p-1.5 text-blue-600 hover:text-blue-800 rounded-md hover:bg-blue-100">
                        <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDeleteReview(review.id)} title="Eliminar" className="p-1.5 text-red-600 hover:text-red-800 rounded-md hover:bg-red-100">
                        <Trash2 size={16} />
                        </button>
                    </div>
                    <button 
                        onClick={() => handleToggleApproved(review.id, review.approved)}
                        title={review.approved ? "Marcar como Pendiente" : "Aprobar Reseña"}
                        className={`text-xs px-2 py-1 rounded-md ${review.approved ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "bg-green-500 hover:bg-green-600 text-white"}`}
                    >
                        {review.approved ? "Pendiente" : "Aprobar"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminReviewsPage;
