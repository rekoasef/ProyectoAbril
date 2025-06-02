// src/components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail, Phone } from 'lucide-react'; // Phone ya está aquí

const Footer = () => {
  const year = new Date().getFullYear();
  // Reemplaza con tus datos reales
  const instagramUser = "https://www.instagram.com/seve.photography___?igsh=OGl6OGk0dzU5eWFh";
  const whatsappNumber = "3471339026"; // Formato internacional sin + ni espacios para el link wa.me
  const emailAddress = "abrilsevedegaston@gmail.com";

  return (
    <footer className="bg-beige-light text-text-secondary py-10 mt-16 border-t border-sepia-gray-soft/30">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-6">
          <Link to="/" className="script-logo text-3xl text-accent-script">
            SeVe Photography
          </Link>
        </div>
        <div className="flex justify-center space-x-6 mb-6">
          <a
            href={`https://instagram.com/${instagramUser}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram de SeVe Photography"
            className="hover:text-accent-script transition-colors"
          >
            <Instagram size={24} />
          </a>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp de SeVe Photography"
            className="hover:text-accent-script transition-colors"
          >
            <Phone size={24} />
          </a>
          <a
            href={`mailto:${emailAddress}`}
            aria-label="Email de SeVe Photography"
            className="hover:text-accent-script transition-colors"
          >
            <Mail size={24} />
          </a>
        </div>
        <p className="text-sm mb-1">
          &copy; {year} SeVe Photography. Todos los derechos reservados.
        </p>
        <p className="text-xs">
          Diseño y desarrollo web por <a href="https://tuweb.com" target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-accent-script">Renzo Asef</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;