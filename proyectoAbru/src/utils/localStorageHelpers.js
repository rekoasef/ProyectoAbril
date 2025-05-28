// src/utils/localStorageHelpers.js

// Para Imágenes del Portfolio (Firebase)
export const getStoredPortfolioImagesFS = () => {
  const images = localStorage.getItem('sevePhotographyFirebasePortfolio');
  return images ? JSON.parse(images) : [];
};

export const storePortfolioImagesFS = (images) => {
  localStorage.setItem('sevePhotographyFirebasePortfolio', JSON.stringify(images));
};

// Para Servicios
export const getStoredServices = () => {
  const servicesData = localStorage.getItem('sevePhotographyServices');
  try {
    const parsed = JSON.parse(servicesData);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

export const storeServices = (services) => {
  localStorage.setItem('sevePhotographyServices', JSON.stringify(services));
};