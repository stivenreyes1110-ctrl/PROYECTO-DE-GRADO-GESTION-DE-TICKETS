const {
  contarMantenimientos,
  contarMantenimientosPorEstado
} = require('./conteo.servicio');

const obtenerConteoMantenimientos = async (peticion, respuesta) => {
  try {
    const idMesa = Number(peticion.usuario.idMesa);
    const total = await contarMantenimientos(idMesa);
    const estados = await contarMantenimientosPorEstado(idMesa);

    respuesta.json({
      total,
      estados
    });
  } catch (error) {
    respuesta.status(500).json({
      mensaje: 'Error al consultar el conteo de mantenimientos',
      error: error.message
    });
  }
};

module.exports = {
  obtenerConteoMantenimientos
};
