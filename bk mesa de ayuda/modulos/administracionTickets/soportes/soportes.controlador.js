const { consultarSoportes } = require('./soportes.servicio');
const { registrarEvento } = require('../utilidades/auditoriaAdministracionTickets');

const listarSoportes = async (req, res) => {
  try {
    const datos = await consultarSoportes(req.contextoAdministracion);
    registrarEvento(req, 'LISTAR_SOPORTES_MESA', 'EXITOSO', { soportesDevueltos: datos.length });
    return res.json({ ok: true, datos });
  } catch (error) {
    registrarEvento(req, 'LISTAR_SOPORTES_MESA', 'ERROR', { error: error.message });
    return res.status(500).json({ ok: false, mensaje: 'Error al consultar el personal de soporte' });
  }
};
module.exports = { listarSoportes };
