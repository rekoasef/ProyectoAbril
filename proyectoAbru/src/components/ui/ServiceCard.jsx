// src/components/ui/ServiceCard.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Para un posible botón de "Más Info" o "Contactar"
import { AdvancedImage, responsive, placeholder } from '@cloudinary/react';
import { Cloudinary } from "@cloudinary/url-gen";
import { fill } from "@cloudinary/url-gen/actions/resize";
import { quality, format } from "@cloudinary/url-gen/actions/delivery";
import { CLOUDINARY_CLOUD_NAME } from '../../utils/cloudinaryConfig';

const cld = new Cloudinary({ cloud: { cloudName: CLOUDINARY_CLOUD_NAME } });

const ServiceCard = ({ service }) => {
  const { name, description, price, equipment, payment, imagePublicId, contactLink = "/contacto" } = service;

  let serviceImage = null;
  if (imagePublicId) {
    serviceImage = cld.image(imagePublicId)
      .resize(fill().width(600).height(400).gravity('auto')) // Imagen para la tarjeta
      .delivery(quality('auto'))
      .delivery(format('auto'));
  }

  return (
    <div className="bg-white-off rounded-lg shadow-soft overflow-hidden flex flex-col md:flex-row group transition-all duration-300 hover:shadow-soft-md">
      {serviceImage && (
        <div className="md:w-2/5 h-64 md:h-auto overflow-hidden">
          <AdvancedImage
            cldImg={serviceImage}
            plugins={[responsive([400, 600]), placeholder({ mode: 'blur' })]}
            className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
            alt={`Imagen representativa de ${name}`}
          />
        </div>
      )}
      <div className={`p-6 md:p-8 flex flex-col ${serviceImage ? 'md:w-3/5' : 'w-full'}`}>
        <h3 className="font-serif text-2xl text-accent-script mb-3">{name}</h3>
        <p className="text-text-secondary text-sm mb-4 flex-grow leading-relaxed">{description}</p>
        <div className="text-xs space-y-2 mt-auto text-text-primary">
          {price && <p><strong>Precio:</strong> {price}</p>}
          {equipment && <p><strong>Equipo Principal:</strong> {equipment}</p>}
          {payment && <p><strong>Formas de Pago:</strong> {payment}</p>}
        </div>
        <div className="mt-6">
          <Link
            to={contactLink}
            className="inline-block px-6 py-2.5 bg-accent-script text-white-off font-sans text-sm rounded-md shadow-soft hover:bg-opacity-80 transition-colors"
          >
            Consultar / Contratar
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;