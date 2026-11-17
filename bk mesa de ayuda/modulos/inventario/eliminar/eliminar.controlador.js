const { borrarActivo } = require('./eliminar.servicio');

const eliminarActivo = async (peticion, respuesta) => {
  try {
    const eliminado = await borrarActivo(peticion.params.id, Number(peticion.usuario.idMesa));
    if (!eliminado) return respuesta.status(404).json({ mensaje: 'Activo no encontrado' });
    respuesta.json({ mensaje: 'Activo eliminado correctamente' });
  } catch (error) {
    respuesta.status(500).json({ mensaje: 'Error al eliminar el activo', error: error.message });
  }
};

module.exports = { eliminarActivo };
