// src/pages/admin/AdminReviewsPage.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { PlusCircle, Edit3, Trash2, Save, XCircle, Star } from 'lucide-react';
import { getStoredReviews, storeReviews } from '../../utils/localStorageHelpers';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      clientName: '',
      reviewText: '',
      rating: 5,
      date: new Date().toISOString().split('T')[0],
      approved: true,
    }
  });

  useEffect(() => {
    setReviews(getStoredReviews().sort((a, b) => new Date(b.date) - new Date(a.date)));
  }, []);

  useEffect(() => {
    if (editingReview) {
      setValue("clientName", editingReview.clientName);
      setValue("reviewText", editingReview.reviewText);
      setValue("rating", editingReview.rating || 5);
      setValue("date", editingReview.date ? new Date(editingReview.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setValue("approved", editingReview.approved !== undefined ? editingReview.approved : true);
      setIsFormOpen(true);
    } else {
      reset({
        clientName: '',
        reviewText: '',
        rating: 5,
        date: new Date().toISOString().split('T')[0],
        approved: true,
      });
    }
  }, [editingReview, setValue, reset]);

  const handleFormSubmit = (data) => {
    console.log("AdminReviewsPage - handleFormSubmit - Datos recibidos del formulario:", data);

    let updatedReviews;
    // Asegurarse de que 'approved' sea un booleano y 'rating' un número
    const reviewData = {
        ...data,
        rating: parseInt(data.rating, 10),
        // El checkbox devuelve un booleano directamente si se registra bien.
        // Si viniera como string 'true'/'false' de alguna forma, necesitaríamos:
        // approved: data.approved === true || data.approved === 'true', 
        approved: !!data.approved, // Simple coerción a booleano
    };
    console.log("AdminReviewsPage - handleFormSubmit - Datos procesados (reviewData):", reviewData);


    if (editingReview) {
      console.log("AdminReviewsPage - Editando reseña ID:", editingReview.id);
      updatedReviews = reviews.map(r =>
        r.id === editingReview.id ? { ...editingReview, ...reviewData } : r
      );
    } else {
      const newReviewId = `review-${Date.now()}`;
      console.log("AdminReviewsPage - Creando nueva reseña ID:", newReviewId);
      const newReview = { ...reviewData, id: newReviewId };
      updatedReviews = [newReview, ...reviews]; // Añadir nueva reseña al principio para verla fácilmente
    }
    
    updatedReviews.sort((a,b) => new Date(b.date) - new Date(a.date)); // Reordenar por fecha
    console.log("AdminReviewsPage - handleFormSubmit - Reviews actualizadas (antes de guardar):", updatedReviews);

    setReviews(updatedReviews);
    storeReviews(updatedReviews); // Guardar en localStorage
    console.log("AdminReviewsPage - handleFormSubmit - Reviews guardadas en localStorage y estado actualizado.");
    
    setEditingReview(null);
    setIsFormOpen(false);
    reset(); // Limpia el formulario a los valores por defecto
  };

  const handleAddNewReview = () => { /* ... (sin cambios, pero asegúrate que reset() ponga bien los defaults) ... */ 
    setEditingReview(null);
    reset({ clientName: '', reviewText: '', rating: 5, date: new Date().toISOString().split('T')[0], approved: true });
    setIsFormOpen(true);
  };
  const handleEditReview = (reviewToEdit) => { /* ... (sin cambios) ... */ 
    setEditingReview(reviewToEdit);
  };
  const handleDeleteReview = (reviewId) => { /* ... (sin cambios) ... */ 
    if (window.confirm("¿Estás segura de que quieres eliminar esta reseña?")) {
      const updatedReviews = reviews.filter(r => r.id !== reviewId);
      setReviews(updatedReviews);
      storeReviews(updatedReviews);
      if (editingReview && editingReview.id === reviewId) {
        setIsFormOpen(false);
        setEditingReview(null);
        reset();
      }
    }
  };
  const handleToggleApproved = (reviewId) => { /* ... (sin cambios) ... */ 
    const updatedReviews = reviews.map(r => 
      r.id === reviewId ? { ...r, approved: !r.approved } : r
    );
    updatedReviews.sort((a,b) => new Date(b.date) - new Date(a.date));
    setReviews(updatedReviews);
    storeReviews(updatedReviews);
  };
  const handleCancelEdit = () => { /* ... (sin cambios) ... */ 
    setIsFormOpen(false);
    setEditingReview(null);
    reset();
  };

  // --- JSX del Formulario y Listado (sin cambios estructurales importantes, solo los que ya tenías) ---
  return (
    <div className="space-y-8">
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
                    <label htmlFor="approved" className="flex items-center space-x-2 cursor-pointer mt-2 md:mt-0 py-2"> {/* Ajuste de padding y margen para alineación */}
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
        {reviews.length === 0 && !isFormOpen ? (
          <p className="text-sm text-gray-500">No hay reseñas creadas. Haz clic en "Añadir Nueva Reseña" para empezar.</p>
        ) : reviews.length === 0 && isFormOpen ? (
            <p className="text-sm text-gray-500">No hay reseñas creadas aún.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className={`p-4 border rounded-md ${review.approved ? 'border-gray-200 hover:shadow-sm' : 'border-yellow-400 bg-yellow-50 hover:shadow-sm'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-1">
                        <h3 className="font-semibold text-gray-800 text-lg mr-3">{review.clientName}</h3>
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < review.rating ? 'fill-current' : 'stroke-current text-gray-300'} />)}
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">
                        {new Date(review.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
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
                        onClick={() => handleToggleApproved(review.id)}
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
