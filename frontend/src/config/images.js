const IMAGE_BASE_PATH = '/images';

// Hero images
export const Hero = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80';
export const HeroMobile = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80';
export const heroSlides = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&q=80',
];

// Property type images
export const house = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80';
export const apartment = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80';
export const villa = 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&q=80';
export const commercial = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80';
export const condo = 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=400&q=80';
export const land = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80';

// Property showcase / placeholder images
export const propertyShowcase = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80';
export const propertyBanner = 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80';
export const propertyPlaceholder = 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80';

// General icons & images
export const sell = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80';
export const calc = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80';
export const ctaBg = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80';
export const date = `${IMAGE_BASE_PATH}/date.png`;
export const price = `${IMAGE_BASE_PATH}/price.png`;
export const discount = `${IMAGE_BASE_PATH}/discount.png`;
export const service = `${IMAGE_BASE_PATH}/service.png`;
export const trusted = `${IMAGE_BASE_PATH}/trusted.png`;
export const ceo = `${IMAGE_BASE_PATH}/ceo.jpg`;
export const logo = `${IMAGE_BASE_PATH}/logo.png`;
export const whatsapp = `${IMAGE_BASE_PATH}/whatsapp.png`;

export const imagePath = (fileName = '') => `${IMAGE_BASE_PATH}/${fileName}`;
