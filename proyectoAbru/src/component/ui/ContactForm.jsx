// src/components/ui/ContactForm.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { Send } from 'lucide-react';

// REEMPLAZA ESTO CON TU ENDPOINT DE FORMSPREE REAL
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mqaqrlnq";

const ContactForm = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful }, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json' // Importante para Formspree
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        reset(); // Limpia el formulario después de un envío exitoso
        // Puedes añadir un mensaje de éxito más visible si quieres
      } else {
        // Formspree podría devolver un error en formato JSON
        const errorData = await response.json();
        if (errorData.errors && errorData.errors.length > 0) {
          alert(`Error: ${errorData.errors.map(err => err.message).join(', ')}`);
        } else {
          alert("Hubo un error al enviar el mensaje. Intenta de nuevo.");
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Hubo un error al enviar el mensaje. Intenta de nuevo.");
    }
  };

  return (
    <div className="bg-beige-light p-8 md:p-10 rounded-lg shadow-soft">
      {isSubmitSuccessful && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 border border-green-300 rounded-md text-sm">
          ¡Mensaje enviado con éxito! Gracias por contactarme, te responderé a la brevedad.
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1">Nombre Completo</label>
          <input
            type="text"
            id="name"
            {...register("name", { required: "Tu nombre es obligatorio." })}
            className="w-full px-4 py-2.5 border border-sepia-gray-soft/50 rounded-md focus:ring-accent-script focus:border-accent-script transition-colors bg-white-off placeholder:text-text-secondary/70"
            placeholder="Ej: Ana Pérez"
            aria-invalid={errors.name ? "true" : "false"}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">Tu Email</label>
          <input
            type="email"
            id="email"
            {...register("email", {
              required: "Tu email es obligatorio para poder responderte.",
              pattern: { value: /^\S+@\S+\.\S+$/, message: "Por favor, ingresa un formato de email válido." }
            })}
            className="w-full px-4 py-2.5 border border-sepia-gray-soft/50 rounded-md focus:ring-accent-script focus:border-accent-script transition-colors bg-white-off placeholder:text-text-secondary/70"
            placeholder="Ej: ana.perez@ejemplo.com"
            aria-invalid={errors.email ? "true" : "false"}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-1">Tu Mensaje</label>
          <textarea
            id="message"
            rows="5"
            {...register("message", { required: "Por favor, escribe tu consulta o mensaje." })}
            className="w-full px-4 py-2.5 border border-sepia-gray-soft/50 rounded-md focus:ring-accent-script focus:border-accent-script transition-colors bg-white-off placeholder:text-text-secondary/70"
            placeholder="Hola SeVe, me gustaría consultarte sobre..."
            aria-invalid={errors.message ? "true" : "false"}
          ></textarea>
          {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent-script text-white-off font-sans rounded-md shadow-soft hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-script disabled:opacity-70 transition-all"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enviando...
            </>
          ) : (
            <> <Send size={18} /> Enviar Mensaje </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;