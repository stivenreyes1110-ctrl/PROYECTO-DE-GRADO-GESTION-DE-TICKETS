const { actualizarEstadoAsignado } = require('./actualizarEstado.repositorio');

const cambiarEstado = (datos) => actualizarEstadoAsignado(datos);

module.exports = { cambiarEstado };
