// src/pages/public/ContactPage.jsx
import React from 'react';
import ContactForm from '../../components/ui/ContactForm'; // Importa el componente
import { Mail, Phone, Instagram } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="editorial-title">Hablemos</h1>
        <p className="text-text-secondary max-w-xl mx-auto">
          ¿Tienes una idea o quieres consultar sobre mis servicios? Completa el formulario o contáctame a través de mis redes. ¡Estoy aquí para ayudarte!
        </p>
      </div>
      <div className="max-w-lg mx-auto">
        <ContactForm />
      </div>
      {/* Puedes añadir información de contacto adicional aquí si lo deseas */}
    </div>
  );
};

export default ContactPage;