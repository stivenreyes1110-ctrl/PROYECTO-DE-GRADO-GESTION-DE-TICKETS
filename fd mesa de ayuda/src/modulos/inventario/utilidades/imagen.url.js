import { API_BASE_URL } from '../../../config/api.js';

const SERVIDOR_ARCHIVOS = new URL(API_BASE_URL).origin;
export function obtenerUrlImagen(valor) {
  if (!valor || typeof valor !== 'string') return '';
  // Mantiene las vistas previas y las fotos anteriores en base64.
  if (/^data:image\/(jpeg|png|webp);base64,/.test(valor)) return valor;
  if (/^\/uploads\/activos\/[0-9a-f-]+\.(jpg|png|webp)$/.test(valor)) return `${SERVIDOR_ARCHIVOS}${valor}`;
  return '';
}
