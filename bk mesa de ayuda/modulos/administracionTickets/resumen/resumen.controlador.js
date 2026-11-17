const { consultarResumen } = require('./resumen.servicio');
const { registrarEvento } = require('../utilidades/auditoriaAdministracionTickets');

const obtenerResumen = async (req, res) => {
  try {
    const datos = await consultarResumen(req.contextoAdministracion);
    registrarEvento(req, 'RESUMEN_TICKETS_MESA', 'EXITOSO', { categorias: datos.length });
    return res.json({ ok: true, datos });
  } catch (error) {
    registrarEvento(req, 'RESUMEN_TICKETS_MESA', 'ERROR', { error: error.message });
    return res.status(500).json({ ok: false, mensaje: 'Error al consultar el resumen administrativo' });
  }
};
module.exports = { obtenerResumen };
