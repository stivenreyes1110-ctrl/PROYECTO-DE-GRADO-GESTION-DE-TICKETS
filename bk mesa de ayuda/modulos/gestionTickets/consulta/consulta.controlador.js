const { consultarTicketsAsignados } = require('./consulta.servicio');
const { normalizarListado } = require('../validaciones/gestionTickets.validacion');
const { registrarEvento } = require('../utilidades/auditoriaGestionTickets');

const listarAsignados = async (req, res) => {
  try {
    const parametros = normalizarListado(req.query);
    const resultado = await consultarTicketsAsignados({
      contexto: req.contextoGestion,
      ...parametros
    });
    registrarEvento(req, 'LISTAR_TICKETS_ASIGNADOS', 'EXITOSO', {
      pagina: resultado.paginacion.pagina,
      limite: resultado.paginacion.limite,
      registrosDevueltos: resultado.datos.length,
      totalRegistros: resultado.paginacion.total,
      estado: parametros.estado || 'TODOS'
    });
    return res.json({ ok: true, ...resultado });
  } catch (error) {
    registrarEvento(req, 'LISTAR_TICKETS_ASIGNADOS', 'ERROR', { error: error.message });
    return res.status(500).json({ ok: false, mensaje: 'Error al consultar los tickets asignados' });
  }
};

module.exports = { listarAsignados };
