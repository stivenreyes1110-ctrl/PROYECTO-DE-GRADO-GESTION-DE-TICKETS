const { consultarResumen } = require('./resumen.servicio');
const { registrarEvento } = require('../utilidades/auditoriaGestionTickets');

const obtenerResumen = async (req, res) => {
  try {
    const datos = await consultarResumen(req.contextoGestion);
    registrarEvento(req, 'RESUMEN_TICKETS_GESTION', 'EXITOSO', {
      alcance: req.contextoGestion.alcance,
      categorias: datos.length
    });
    return res.json({ ok: true, datos });
  } catch (error) {
    registrarEvento(req, 'RESUMEN_TICKETS_GESTION', 'ERROR', { error: error.message });
    return res.status(500).json({ ok: false, mensaje: 'Error al consultar el resumen de tickets' });
  }
};

module.exports = { obtenerResumen };
