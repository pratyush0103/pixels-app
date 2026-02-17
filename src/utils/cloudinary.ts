// Cloudinary configuration for unsigned uploads
// You need to create an unsigned upload preset in your Cloudinary dashboard:
// Settings > Upload > Upload Presets > Add Upload Preset > Signing Mode: Unsigned

export const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'YOUR_CLOUD_NAME',
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'YOUR_UPLOAD_PRESET',
};

export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
