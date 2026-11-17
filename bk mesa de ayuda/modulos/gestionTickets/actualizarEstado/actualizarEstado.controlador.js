const { cambiarEstado } = require('./actualizarEstado.servicio');
const { normalizarActualizacion } = require('../validaciones/gestionTickets.validacion');
const { registrarEvento } = require('../utilidades/auditoriaGestionTickets');

const actualizarEstado = async (req, res) => {
  const { datos, errores } = normalizarActualizacion(req.params, req.body);
  if (errores.length) {
    registrarEvento(req, 'ACTUALIZAR_ESTADO_TICKET', 'RECHAZADO', {
      idTicket: Number(req.params.ticketId) || null,
      motivos: errores
    });
    return res.status(400).json({ ok: false, mensaje: errores.join('. ') });
  }

  try {
    const ticket = await cambiarEstado({ contexto: req.contextoGestion, ...datos });
    if (!ticket) {
      registrarEvento(req, 'ACTUALIZAR_ESTADO_TICKET', 'NO_ENCONTRADO', {
        idTicket: datos.idTicket,
        estadoSolicitado: datos.estado,
        motivo: 'No asignado al soporte o estado no modificable'
      });
      return res.status(404).json({
        ok: false,
        mensaje: 'Ticket no encontrado, no asignado al soporte o en un estado no modificable'
      });
    }
    registrarEvento(req, 'ACTUALIZAR_ESTADO_TICKET', 'EXITOSO', {
      idTicket: datos.idTicket,
      estadoAnteriorModificable: true,
      estadoNuevo: datos.estado,
      longitudObservacion: datos.observacion.length
    });
    return res.json({ ok: true, mensaje: 'Ticket actualizado', data: ticket });
  } catch (error) {
    registrarEvento(req, 'ACTUALIZAR_ESTADO_TICKET', 'ERROR', {
      idTicket: datos.idTicket,
      estadoSolicitado: datos.estado,
      error: error.message
    });
    return res.status(500).json({ ok: false, mensaje: 'Error al actualizar el ticket' });
  }
};

module.exports = { actualizarEstado };
