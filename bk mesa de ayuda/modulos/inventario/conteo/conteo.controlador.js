const { contarInventario } = require('./conteo.servicio');

const obtenerConteoInventario = async (peticion, respuesta) => {
  try {
    const conteo = await contarInventario(Number(peticion.usuario.idMesa));
    respuesta.json({
      total: conteo.TOTAL || 0,
      categorias: conteo.CATEGORIAS || 0,
      areas: conteo.AREAS || 0,
      sedes: conteo.SEDES || 0
    });
  } catch (error) {
    respuesta.status(500).json({
      mensaje: 'Error al consultar el conteo del inventario',
      error: error.message
    });
  }
};

module.exports = { obtenerConteoInventario };
