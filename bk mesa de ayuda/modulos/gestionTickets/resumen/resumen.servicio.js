const { obtenerResumen } = require('./resumen.repositorio');

const consultarResumen = (contexto) => obtenerResumen(contexto);

module.exports = { consultarResumen };
