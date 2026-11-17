const { obtenerResumen } = require('./resumen.repositorio');
const consultarResumen = (contexto) => obtenerResumen(contexto.idMesa);
module.exports = { consultarResumen };
