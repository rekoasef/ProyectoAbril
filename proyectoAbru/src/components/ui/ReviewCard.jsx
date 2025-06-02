// src/components/ui/ReviewCard.jsx
import React from 'react';
import { Star, MessageSquareText } from 'lucide-react';

const ReviewCard = ({ review }) => {
  // console.log("ReviewCard - Renderizando reseña para:", review?.clientName); // Puedes activar esto

  if (!review) return <div className="p-4 text-red-500">Error: Faltan datos de la reseña.</div>;

  const { clientName = "Cliente Anónimo", reviewText = "Sin comentario.", rating = 0, date } = review;

  const formattedDate = date ? new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric',
  }) : '';

  return (
    <div className="bg-white-off p-6 rounded-lg shadow-soft flex flex-col h-full border border-gray-300"> {/* Añadido borde para verla */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex items-center">
          <span className="text-lg font-serif text-accent-script mr-3">{clientName}</span>
          {typeof rating === 'number' && rating > 0 && (
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className={i < rating ? 'fill-current' : 'stroke-current text-gray-300'} />
              ))}
            </div>
          )}
        </div>
        {formattedDate && <p className="text-xs text-text-secondary mt-0.5">{formattedDate}</p>}
      </div>
      <div className="flex-grow mb-4 relative">
        <MessageSquareText size={38} className="absolute -top-1 -left-1 text-beige-light opacity-30 z-0" strokeWidth={1.5} />
        <p className="text-sm text-text-secondary leading-relaxed italic relative z-10 whitespace-pre-wrap break-words">
          "{reviewText}"
        </p>
      </div>
    </div>
  );
};
export default ReviewCard;