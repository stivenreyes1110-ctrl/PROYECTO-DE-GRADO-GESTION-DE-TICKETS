export const normalizarTipo = (tipo = '') => String(tipo).trim().toUpperCase();

export const formatearFecha = (fecha) => {
  if (!fecha) return 'Sin fecha';

  const fechaConvertida = new Date(fecha);
  if (Number.isNaN(fechaConvertida.getTime())) return 'Sin fecha';

  return fechaConvertida.toLocaleString('es-ES');
};

export const obtenerTexto = (valor, respaldo = 'Sin registro') => valor || respaldo;

export const escaparHtml = (valor) => {
  return String(valor || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
};

