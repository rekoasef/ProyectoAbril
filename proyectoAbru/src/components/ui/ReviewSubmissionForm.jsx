// src/components/ui/ReviewSubmissionForm.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Send, Star } from 'lucide-react';
import { db } from '../../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const ReviewSubmissionForm = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    defaultValues: { clientName: '', reviewText: '' }
  });
  const [currentRating, setCurrentRating] = useState(0);
  const [formMessage, setFormMessage] = useState({ type: '', text: ''});

  const onSubmit = async (data) => {
    setFormMessage({ type: '', text: '' });
    const reviewData = {
      clientName: data.clientName,
      reviewText: data.reviewText,
      rating: currentRating,
      createdAt: serverTimestamp(), // <--- CAMBIO: de submittedAt a createdAt
      approved: false, 
      // El campo 'date' (string YYYY-MM-DD) lo puede añadir el admin si edita la reseña.
      // O podemos añadirlo aquí con la fecha actual si es necesario para el admin de inmediato.
      // Por ahora, solo createdAt para el ordenamiento inicial.
      date: new Date().toISOString().split('T')[0], // Añadir fecha actual como string YYYY-MM-DD
    };

    try {
      const docRef = await addDoc(collection(db, "reviews"), reviewData);
      console.log("ReviewSubmissionForm - Reseña enviada a Firestore con ID: ", docRef.id);
      setFormMessage({ type: 'success', text: '¡Gracias por tu reseña! Será revisada a la brevedad.' });
      reset();
      setCurrentRating(0);
    } catch (error) {
      console.error("Error submitting review to Firestore:", error);
      setFormMessage({ type: 'error', text: 'Hubo un error al enviar tu reseña. Por favor, intenta de nuevo más tarde.' });
    }
  };

  return (
    <div className="bg-beige-light p-6 md:p-8 rounded-lg shadow-soft max-w-lg mx-auto">
      {formMessage.text && (
        <div className={`mb-6 p-3 rounded-md text-sm text-center ${
          formMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {formMessage.text}
        </div>
      )}
      {formMessage.type !== 'success' && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium text-text-primary mb-1">Tu Nombre <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="clientName"
              {...register("clientName", { required: "Tu nombre es importante." })}
              className="w-full px-4 py-2.5 border border-sepia-gray-soft/50 rounded-md focus:ring-accent-script focus:border-accent-script transition-colors bg-white-off placeholder:text-text-secondary/70"
              placeholder="Ej: Laura M."
            />
            {errors.clientName && <p className="mt-1 text-xs text-red-500">{errors.clientName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Tu Puntuación (opcional)</label>
            <div className="flex space-x-1 mb-1">
                {[1, 2, 3, 4, 5].map((starValue) => (
                    <Star
                        key={starValue}
                        size={28}
                        className={`cursor-pointer transition-colors 
                            ${starValue <= currentRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
                        onClick={() => setCurrentRating(starValue)}
                    />
                ))}
            </div>
          </div>

          <div>
            <label htmlFor="reviewText" className="block text-sm font-medium text-text-primary mb-1">Tu Reseña <span className="text-red-500">*</span></label>
            <textarea
              id="reviewText"
              rows="5"
              {...register("reviewText", { required: "Por favor, comparte tu experiencia." })}
              className="w-full px-4 py-2.5 border border-sepia-gray-soft/50 rounded-md focus:ring-accent-script focus:border-accent-script transition-colors bg-white-off placeholder:text-text-secondary/70"
              placeholder="Mi experiencia con SeVe Photography fue..."
            ></textarea>
            {errors.reviewText && <p className="mt-1 text-xs text-red-500">{errors.reviewText.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent-script text-white-off font-sans rounded-md shadow-soft hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-script disabled:opacity-70 transition-all"
          >
            {isSubmitting ? (
              <>Enviando...</>
            ) : (
              <> <Send size={18} /> Enviar Mi Reseña </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default ReviewSubmissionForm;
