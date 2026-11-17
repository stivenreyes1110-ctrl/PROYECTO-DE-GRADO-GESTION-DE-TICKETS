const { consultarTickets } = require('./consulta.servicio');
const { normalizarListado } = require('../validaciones/administracionTickets.validacion');
const { registrarEvento } = require('../utilidades/auditoriaAdministracionTickets');

const listar = async (req, res) => {
  try {
    const parametros = normalizarListado(req.query);
    const resultado = await consultarTickets({ contexto: req.contextoAdministracion, ...parametros });
    registrarEvento(req, 'LISTAR_TICKETS_MESA', 'EXITOSO', {
      pagina: resultado.paginacion.pagina,
      limite: resultado.paginacion.limite,
      registrosDevueltos: resultado.datos.length,
      totalRegistros: resultado.paginacion.total,
      totalPaginas: resultado.paginacion.totalPaginas,
      estado: parametros.estado || 'TODOS'
    });
    return res.json({ ok: true, ...resultado });
  } catch (error) {
    registrarEvento(req, 'LISTAR_TICKETS_MESA', 'ERROR', { error: error.message });
    return res.status(500).json({ ok: false, mensaje: 'Error al consultar los tickets de la mesa' });
  }
};
module.exports = { listar };
