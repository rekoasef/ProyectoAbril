// src/components/common/Modal.jsx
import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4 transition-opacity duration-300"
      onClick={onClose} // Cierra el modal si se hace clic fuera del contenido
    >
      <div
        className="bg-white-off rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 relative transform transition-all duration-300 scale-95 opacity-0 animate-modalShow"
        onClick={e => e.stopPropagation()} // Evita que el clic dentro del modal lo cierre
      >
        <div className="flex justify-between items-center mb-4">
          {title && <h3 className="text-xl font-serif text-accent-script">{title}</h3>}
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-accent-script p-1 rounded-full absolute top-3 right-3"
            aria-label="Cerrar modal"
          >
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;