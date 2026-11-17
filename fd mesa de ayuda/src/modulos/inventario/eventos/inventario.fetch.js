import { API_BASE_URL } from '../../../config/api.js';
export async function solicitarApi(token, ruta, opciones = {}) {
  const respuesta = await fetch(`${API_BASE_URL}${ruta}`, {
    ...opciones,
    headers: { Authorization: `Bearer ${token}`, ...(opciones.body ? { 'Content-Type': 'application/json' } : {}), ...opciones.headers }
  });
  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) throw new Error(datos?.mensaje || datos?.message || 'No fue posible completar la solicitud');
  return datos;
}
export const consultarInventario = (token, pagina, limite) => solicitarApi(token, `/inventario/datos?pagina=${pagina}&limite=${limite}`);
export const consultarTodosActivos = token => solicitarApi(token, '/inventario/datos');
export const consultarConteoInventario = token => solicitarApi(token, '/inventario/conteo');
export const consultarAreas = token => solicitarApi(token, '/inventario/areas');
export const consultarSedes = token => solicitarApi(token, '/sedes');
export const enviarActivo = (token, datos) => solicitarApi(token, '/inventario/insertar', {method: 'POST', body: JSON.stringify(datos)});
export const actualizarActivo = (token, id, datos) => solicitarApi(token, `/inventario/actualizar/${id}`, {method: 'PUT', body: JSON.stringify(datos)});
export const eliminarActivo = (token, id) => solicitarApi(token, `/inventario/eliminar/${id}`, {method: 'DELETE'});
