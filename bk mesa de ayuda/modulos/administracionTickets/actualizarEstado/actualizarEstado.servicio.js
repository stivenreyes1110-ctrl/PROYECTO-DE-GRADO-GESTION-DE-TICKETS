const { actualizarEstado } = require('./actualizarEstado.repositorio');
const cambiarEstado = ({ contexto, ...datos }) => actualizarEstado({ idMesa: contexto.idMesa, ...datos });
module.exports = { cambiarEstado };
