import {solicitarApi} from './inventario.fetch';
export const consultarFirmas = (token, id, signal) => solicitarApi(token, `/inventario/${id}/firmas`, {signal});
export const guardarFirma = (token, id, tipo, datos) => solicitarApi(token, `/inventario/${id}/firmas/${tipo}`, {method: 'PUT', body: JSON.stringify(datos)});

export const consultarFirmantes = (token, id, signal) => solicitarApi(token, `/inventario/${id}/firmantes`, {signal});
