// src/pages/public/AboutPage.jsx
import React from 'react';
import { Instagram, Mail, Phone, Camera, Heart, Aperture } from 'lucide-react'; // Iconos
import { AdvancedImage, responsive, placeholder } from '@cloudinary/react';
import { Cloudinary } from "@cloudinary/url-gen";
import { fill } from "@cloudinary/url-gen/actions/resize";
import { quality, format } from "@cloudinary/url-gen/actions/delivery";
import { CLOUDINARY_CLOUD_NAME } from '../../utils/cloudinaryConfig';

const cld = new Cloudinary({ cloud: { cloudName: CLOUDINARY_CLOUD_NAME } });

// --- DATOS DE LA FOTÓGRAFA ---
const photographerInfo = {
  name: "SeVe",
  imagePublicId: 'IMG_5473_o7vnct', // <<<--- NUEVO PUBLIC ID AQUÍ
  tagline: "Fotógrafa apasionada por capturar la belleza en lo auténtico.",
  bio: [
    "¡Hola! Soy SeVe, y la fotografía es más que mi profesión, es mi manera de ver y sentir el mundo. Desde que descubrí el poder de una imagen para contar historias y preservar emociones, supe que quería dedicarme a ello.",
    "Mi enfoque se centra en la fotografía documental y artística, buscando siempre la naturalidad, la luz perfecta y esos pequeños gestos que revelan grandes sentimientos. Me encanta conectar con las personas, entender sus anhelos y traducirlos en recuerdos visuales que atesorarán para siempre.",
    "Creo firmemente que cada persona, cada pareja y cada evento tiene una magia particular, y mi objetivo es revelarla a través de mi lente."
  ],
  equipmentHighlights: "Utilizo equipo profesional Canon Full-Frame y una selección de lentes prime luminosos para asegurar la máxima calidad y versatilidad en diferentes condiciones de luz. Siempre estoy explorando nuevas técnicas y herramientas para ofrecer lo mejor.",
  artisticFocus: "Me especializo en capturar la espontaneidad y la emoción real. Busco composiciones limpias, con un estilo editorial y atemporal, donde la luz y la conexión humana son protagonistas. Mi edición es cuidada para realzar la belleza natural sin perder autenticidad.",
  instagramUser: "tuUsuarioInstagram", // REEMPLAZA con tu usuario real
  whatsappNumber: "549XXXXXXXXXX",    // REEMPLAZA con tu número real (ej. 5493411234567)
  emailAddress: "tuemail@example.com", // REEMPLAZA con tu email real
};
// --- FIN DE DATOS ---

const AboutPage = () => {
  console.log("AboutPage - CLOUDINARY_CLOUD_NAME:", CLOUDINARY_CLOUD_NAME);
  console.log("AboutPage - photographerInfo.imagePublicId:", photographerInfo.imagePublicId);

  let profileImage = null;
  const canDisplayCloudinaryImage = photographerInfo.imagePublicId &&
                                   CLOUDINARY_CLOUD_NAME &&
                                   CLOUDINARY_CLOUD_NAME !== 'TU_CLOUD_NAME_AQUI';

  if (canDisplayCloudinaryImage) {
    console.log("AboutPage - Se cumplen condiciones, intentando generar imagen Cloudinary.");
    profileImage = cld.image(photographerInfo.imagePublicId)
      .resize(fill().width(400).height(400).gravity('face'))
      .delivery(quality('auto'))
      .delivery(format('auto'));
    console.log("AboutPage - Objeto profileImage:", profileImage);
    if (profileImage) {
      console.log("AboutPage - URL generada:", profileImage.toURL());
    }
  } else {
    console.log("AboutPage - No se cumplen condiciones para generar imagen Cloudinary.");
    if (!photographerInfo.imagePublicId) console.log("- Causa: photographerInfo.imagePublicId está vacío.");
    if (!CLOUDINARY_CLOUD_NAME) console.log("- Causa: CLOUDINARY_CLOUD_NAME es undefined o null.");
    if (CLOUDINARY_CLOUD_NAME === 'TU_CLOUD_NAME_AQUI') console.log("- Causa: CLOUDINARY_CLOUD_NAME sigue siendo el placeholder 'TU_CLOUD_NAME_AQUI'.");
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-16 md:space-y-20 min-h-[calc(100vh-20rem)]">
      <div className="text-center">
        <h1 className="editorial-title">Conóceme un Poco Más</h1>
        {photographerInfo.tagline && <p className="text-text-secondary text-lg">{photographerInfo.tagline}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 items-start">
        <div className="md:col-span-2 flex justify-center md:justify-start">
          {profileImage ? (
            <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full overflow-hidden shadow-soft-md border-4 border-white-off mx-auto md:mx-0">
              <AdvancedImage
                cldImg={profileImage}
                plugins={[responsive(), placeholder({ mode: 'blur' })]}
                className="w-full h-full object-cover"
                alt={`Retrato de ${photographerInfo.name}`}
              />
            </div>
          ) : (
            <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full bg-beige-light flex items-center justify-center shadow-soft-md border-4 border-white-off mx-auto md:mx-0">
              <Camera size={80} className="text-sepia-gray-soft" strokeWidth={1}/>
              {CLOUDINARY_CLOUD_NAME === 'TU_CLOUD_NAME_AQUI' && ( // Solo mostrar si el cloud name es el placeholder
                 <p className="text-xs text-red-500 mt-2 absolute bottom-2 left-1/2 -translate-x-1/2">Cloudinary no configurado</p>
              )}
            </div>
          )}
        </div>

        <div className="md:col-span-3 space-y-6 text-text-primary">
          <h2 className="script-logo text-5xl md:text-6xl text-accent-script">{photographerInfo.name}</h2>
          {photographerInfo.bio.map((paragraph, index) => (
            <p key={index} className="text-sm md:text-base leading-relaxed text-text-secondary">
              {paragraph}
            </p>
          ))}
          <div className="pt-4 space-y-4">
            {photographerInfo.equipmentHighlights && (
              <div className="flex items-start">
                <Aperture size={28} className="text-accent-script mr-3 mt-1 flex-shrink-0" strokeWidth={1.5}/>
                <div>
                  <h3 className="font-serif text-lg text-text-primary mb-1">Mi Equipo</h3>
                  <p className="text-xs md:text-sm text-text-secondary leading-relaxed">{photographerInfo.equipmentHighlights}</p>
                </div>
              </div>
            )}
            {photographerInfo.artisticFocus && (
               <div className="flex items-start">
                <Heart size={28} className="text-accent-script mr-3 mt-1 flex-shrink-0" strokeWidth={1.5}/>
                <div>
                  <h3 className="font-serif text-lg text-text-primary mb-1">Mi Enfoque Artístico</h3>
                  <p className="text-xs md:text-sm text-text-secondary leading-relaxed">{photographerInfo.artisticFocus}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-center pt-10 border-t border-sepia-gray-soft/20">
        <h3 className="font-serif text-xl text-text-primary mb-6">Sígueme y Contacta</h3>
        <div className="flex justify-center space-x-6 md:space-x-8">
          <a href={`https://instagram.com/${photographerInfo.instagramUser}`} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-text-secondary hover:text-accent-script transition-colors transform hover:scale-110">
            <Instagram size={28} />
          </a>
          <a href={`https://wa.me/${photographerInfo.whatsappNumber}?text=Hola%20${photographerInfo.name},%20te%20contacto%20desde%20tu%20página%20web.`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-text-secondary hover:text-accent-script transition-colors transform hover:scale-110">
            <Phone size={28} />
          </a>
          <a href={`mailto:${photographerInfo.emailAddress}`} aria-label="Email" className="text-text-secondary hover:text-accent-script transition-colors transform hover:scale-110">
            <Mail size={28} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;