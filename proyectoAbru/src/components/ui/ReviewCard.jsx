// src/components/ui/ReviewCard.jsx
import React from 'react';
import { Star, MessageSquareText } from 'lucide-react'; // MessageSquareText como ícono de cita

const ReviewCard = ({ review }) => {
  const { clientName, reviewText, rating, date } = review;

  // Formatear la fecha para mostrarla de forma más amigable (opcional)
  const formattedDate = date ? new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : '';

  return (
    <div className="bg-white-off p-6 rounded-lg shadow-soft flex flex-col h-full">
      <div className="flex-shrink-0 mb-4">
        <div className="flex items-center">
          <span className="text-lg font-serif text-accent-script mr-3">{clientName}</span>
          {rating > 0 && (
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < rating ? 'fill-current' : 'stroke-current text-gray-300'}
                />
              ))}
            </div>
          )}
        </div>
        {formattedDate && <p className="text-xs text-text-secondary mt-0.5">{formattedDate}</p>}
      </div>
      
      <div className="flex-grow mb-4 relative">
        <MessageSquareText size={48} className="absolute -top-2 -left-2 text-beige-light opacity-50 z-0" strokeWidth={1.5} />
        <p className="text-sm text-text-secondary leading-relaxed italic relative z-10 whitespace-pre-wrap break-words">
          "{reviewText}"
        </p>
      </div>
      {/* Podríamos añadir un pequeño avatar o iniciales del cliente si tuviéramos esa info */}
    </div>
  );
};

export default ReviewCard;
