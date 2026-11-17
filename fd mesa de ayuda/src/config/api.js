// URL base de todos los endpoints del backend (incluye /api).
// Puede sobrescribirse con VITE_API_BASE_URL en el archivo .env de Vite.
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://128.0.18.50:3020/api').replace(/\/+$/, '');
