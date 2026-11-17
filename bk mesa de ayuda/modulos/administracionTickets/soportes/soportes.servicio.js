const { listarSoportes } = require('./soportes.repositorio');
const consultarSoportes = (contexto) => listarSoportes(contexto.idMesa);
module.exports = { consultarSoportes };
