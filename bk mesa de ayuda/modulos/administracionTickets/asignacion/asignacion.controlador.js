const { asignarTicket } = require('./asignacion.servicio');
const { validarAsignacion } = require('../validaciones/administracionTickets.validacion');
const { registrarEvento } = require('../utilidades/auditoriaAdministracionTickets');

const asignar = async (req, res) => {
  const { datos, errores } = validarAsignacion(req.params, req.body);
  if (errores.length) {
    registrarEvento(req, 'ASIGNAR_TICKET', 'RECHAZADO', {
      idTicket: Number(req.params.ticketId) || null,
      idSoporte: Number(req.body?.idSoporte ?? req.body?.usuario_id) || null,
      motivos: errores
    });
    return res.status(400).json({ ok: false, mensaje: errores.join('. ') });
  }
  try {
    const ticket = await asignarTicket({ contexto: req.contextoAdministracion, ...datos });
    if (!ticket) {
      registrarEvento(req, 'ASIGNAR_TICKET', 'NO_ENCONTRADO', {
        idTicket: datos.idTicket, idSoporte: datos.idSoporte,
        motivo: 'Ticket o soporte fuera de la mesa autenticada'
      });
      return res.status(404).json({ ok: false, mensaje: 'Ticket o soporte no encontrado en la mesa' });
    }
    registrarEvento(req, 'ASIGNAR_TICKET', 'EXITOSO', {
      idTicket: datos.idTicket, idSoporteAsignado: datos.idSoporte
    });
    return res.json({ ok: true, mensaje: 'Ticket asignado', datos: ticket });
  } catch (error) {
    registrarEvento(req, 'ASIGNAR_TICKET', 'ERROR', { idTicket: datos.idTicket, error: error.message });
    return res.status(500).json({ ok: false, mensaje: 'Error al asignar el ticket' });
  }
};
module.exports = { asignar };
