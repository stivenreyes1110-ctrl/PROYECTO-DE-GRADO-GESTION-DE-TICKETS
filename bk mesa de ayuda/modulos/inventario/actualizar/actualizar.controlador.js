const { editarActivo } = require('./actualizar.servicio');
const { validarActivo } = require('../validaciones/inventario.validacion');

const actualizarActivo = async (peticion, respuesta) => {
  if (!validarActivo(peticion.body)) {
    return respuesta.status(400).json({
      mensaje: 'CATEGORIA, IDAREA e IDSEDE son obligatorios'
    });
  }

  try {
    const activo = await editarActivo(peticion.params.id, {
      ...peticion.body,
      IDMESA: Number(peticion.usuario.idMesa)
    });
    if (!activo) return respuesta.status(404).json({ mensaje: 'Activo no encontrado' });
    respuesta.json(activo);
  } catch (error) {
    respuesta.status(500).json({ mensaje: 'Error al editar el activo', error: error.message });
  }
};

module.exports = { actualizarActivo };
