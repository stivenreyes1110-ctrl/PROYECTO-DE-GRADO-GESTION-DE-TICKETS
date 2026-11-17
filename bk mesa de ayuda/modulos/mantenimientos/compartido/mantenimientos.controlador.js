const {
  cambiarEstadoMantenimiento,
  consultarMantenimientos,
  crearMantenimiento,
  editarMantenimiento,
  eliminarMantenimiento
} = require('../compartido/mantenimientos.datos');

const validarMantenimiento = (mantenimiento) => {
  return mantenimiento.IDACTIVO && mantenimiento.TIPOMANTENIMIENTO;
};

const obtenerMantenimientos = async (peticion, respuesta) => {
  try {
    const datos = await consultarMantenimientos({
      pagina: Number(peticion.query.pagina) || 1,
      limite: Number(peticion.query.limite) || 0,
      anio: Number(peticion.query.anio) || null,
      idSede: Number(peticion.query.sede) || null,
      idMesa: Number(peticion.usuario.idMesa)
    });

    respuesta.json(datos);
  } catch (error) {
    respuesta.status(500).json({
      mensaje: 'Error al consultar los mantenimientos',
      error: error.message
    });
  }
};

const insertarMantenimiento = async (peticion, respuesta) => {
  if (!validarMantenimiento(peticion.body)) {
    return respuesta.status(400).json({
      mensaje: 'IDACTIVO y TIPOMANTENIMIENTO son obligatorios'
    });
  }

  try {
    const mantenimiento = await crearMantenimiento(peticion.body, Number(peticion.usuario.idMesa));
    if (!mantenimiento) return respuesta.status(400).json({ mensaje: 'El activo no pertenece a la mesa autenticada' });
    respuesta.status(201).json(mantenimiento);
  } catch (error) {
    respuesta.status(500).json({
      mensaje: 'Error al crear el mantenimiento',
      error: error.message
    });
  }
};

const actualizarMantenimiento = async (peticion, respuesta) => {
  if (!validarMantenimiento(peticion.body)) {
    return respuesta.status(400).json({
      mensaje: 'IDACTIVO y TIPOMANTENIMIENTO son obligatorios'
    });
  }

  try {
    const mantenimiento = await editarMantenimiento(peticion.params.id, peticion.body, Number(peticion.usuario.idMesa));

    if (!mantenimiento) {
      return respuesta.status(404).json({ mensaje: 'Mantenimiento no encontrado' });
    }

    respuesta.json(mantenimiento);
  } catch (error) {
    respuesta.status(500).json({
      mensaje: 'Error al editar el mantenimiento',
      error: error.message
    });
  }
};

const actualizarEstadoMantenimiento = async (peticion, respuesta) => {
  if (!peticion.body.ESTADO) {
    return respuesta.status(400).json({ mensaje: 'ESTADO es obligatorio' });
  }

  try {
    const mantenimiento = await cambiarEstadoMantenimiento(peticion.params.id, peticion.body.ESTADO, Number(peticion.usuario.idMesa));

    if (!mantenimiento) {
      return respuesta.status(404).json({ mensaje: 'Mantenimiento no encontrado' });
    }

    respuesta.json(mantenimiento);
  } catch (error) {
    respuesta.status(500).json({
      mensaje: 'Error al cambiar el estado',
      error: error.message
    });
  }
};

const borrarMantenimiento = async (peticion, respuesta) => {
  try {
    const eliminado = await eliminarMantenimiento(peticion.params.id, Number(peticion.usuario.idMesa));

    if (!eliminado) {
      return respuesta.status(404).json({ mensaje: 'Mantenimiento no encontrado' });
    }

    respuesta.json({ mensaje: 'Mantenimiento eliminado correctamente' });
  } catch (error) {
    respuesta.status(500).json({
      mensaje: 'Error al eliminar el mantenimiento',
      error: error.message
    });
  }
};

module.exports = {
  obtenerMantenimientos,
  insertarMantenimiento,
  actualizarMantenimiento,
  actualizarEstadoMantenimiento,
  borrarMantenimiento
};
