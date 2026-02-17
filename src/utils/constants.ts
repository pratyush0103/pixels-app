// Application constants

// File validation
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

// Upload configuration
export const MAX_CONCURRENT_UPLOADS = 3;
export const THUMBNAIL_WIDTH = 400;
export const THUMBNAIL_HEIGHT = 400;

// UI
export const MASONRY_COLUMNS = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
};
