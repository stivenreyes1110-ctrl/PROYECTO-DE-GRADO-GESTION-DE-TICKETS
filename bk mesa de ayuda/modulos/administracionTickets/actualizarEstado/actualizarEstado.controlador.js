const { cambiarEstado } = require('./actualizarEstado.servicio');
const { validarEstado } = require('../validaciones/administracionTickets.validacion');
const { registrarEvento } = require('../utilidades/auditoriaAdministracionTickets');

const actualizarEstado = async (req, res) => {
  const { datos, errores } = validarEstado(req.params, req.body);
  if (errores.length) {
    registrarEvento(req, 'ACTUALIZAR_ESTADO_TICKET', 'RECHAZADO', {
      idTicket: Number(req.params.ticketId) || null,
      estadoSolicitado: Number(req.body?.estado) || null,
      motivos: errores
    });
    return res.status(400).json({ ok: false, mensaje: errores.join('. ') });
  }
  try {
    const ticket = await cambiarEstado({ contexto: req.contextoAdministracion, ...datos });
    if (!ticket) {
      registrarEvento(req, 'ACTUALIZAR_ESTADO_TICKET', 'NO_ENCONTRADO', {
        idTicket: datos.idTicket, estadoSolicitado: datos.estado,
        motivo: 'Ticket fuera de la mesa autenticada'
      });
      return res.status(404).json({ ok: false, mensaje: 'Ticket no encontrado en la mesa' });
    }
    registrarEvento(req, 'ACTUALIZAR_ESTADO_TICKET', 'EXITOSO', {
      idTicket: datos.idTicket,
      estadoNuevo: datos.estado,
      longitudObservacion: datos.observacion.length
    });
    return res.json({ ok: true, mensaje: 'Ticket actualizado', datos: ticket });
  } catch (error) {
    registrarEvento(req, 'ACTUALIZAR_ESTADO_TICKET', 'ERROR', {
      idTicket: datos.idTicket, error: error.message
    });
    return res.status(500).json({ ok: false, mensaje: 'Error al actualizar el ticket' });
  }
};
module.exports = { actualizarEstado };
