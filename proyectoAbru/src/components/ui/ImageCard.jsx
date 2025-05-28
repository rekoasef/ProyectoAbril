// src/components/ui/ImageCard.jsx
import React from 'react';
import { AdvancedImage, responsive, placeholder } from '@cloudinary/react';
import { Cloudinary } from "@cloudinary/url-gen";
import { fill } from "@cloudinary/url-gen/actions/resize";
import { quality, format } from "@cloudinary/url-gen/actions/delivery"; // Corregido: quality en minúscula
import { CLOUDINARY_CLOUD_NAME } from '../../utils/cloudinaryConfig';

// Inicializa Cloudinary con tu cloud name
const cld = new Cloudinary({
  cloud: {
    cloudName: CLOUDINARY_CLOUD_NAME
  }
});

const ImageCard = ({ publicId, alt, onClick }) => {
  // Crea la transformación para el thumbnail del grid
  const imageToShow = cld.image(publicId)
    .resize(fill().width(400).height(300).gravity('auto')) // Ajusta dimensiones según tu grid
    .delivery(quality('auto'))
    .delivery(format('auto'));

  return (
    <div
      className="aspect-[4/3] bg-beige-light rounded-lg overflow-hidden shadow-soft hover:shadow-soft-md transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <AdvancedImage
        cldImg={imageToShow}
        plugins={[responsive([400, 800]), placeholder({ mode: 'blur' })]} // Medidas para responsive, placeholder mientras carga
        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
        alt={alt || 'Fotografía del portfolio'}
      />
    </div>
  );
};

export default ImageCard;