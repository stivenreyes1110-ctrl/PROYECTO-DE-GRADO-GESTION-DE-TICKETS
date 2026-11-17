const { asignar } = require('./asignacion.repositorio');
const asignarTicket = ({ contexto, ...datos }) => asignar({ idMesa: contexto.idMesa, ...datos });
module.exports = { asignarTicket };
