import { API_BASE_URL } from '../../../config/api.js';

export async function solicitarConfiguracion(token, ruta, opciones = {}) {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, {...opciones, headers: {Authorization: `Bearer ${token}`, ...(opciones.body ? {'Content-Type': 'application/json'} : {}), ...opciones.headers}});
  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) throw Object.assign(new Error(datos?.mensaje || datos?.error || 'No fue posible completar la operación.'), {status: respuesta.status});
  return datos;
}
export const consultarCatalogo = (token, recurso, signal) => solicitarConfiguracion(token, `/configuracion/${recurso}`, {signal});
export const guardarCatalogo = (token, recurso, datos, id) => solicitarConfiguracion(token, `/configuracion/${recurso}${id ? `/${id}` : ''}`, {method: id ? 'PUT' : 'POST', body: JSON.stringify(datos)});
export const eliminarCatalogo = (token, recurso, id) => solicitarConfiguracion(token, `/configuracion/${recurso}/${id}`, {method: 'DELETE'});
export const consultarPrioridades = (token, signal) => solicitarConfiguracion(token, '/prioridades', {signal});
