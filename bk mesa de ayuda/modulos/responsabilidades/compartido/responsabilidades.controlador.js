const {
  consultarResponsabilidades,
  crearResponsabilidad,
  editarResponsabilidad,
  actualizarEstadoResponsabilidad,
  eliminarResponsabilidad
} = require('../compartido/responsabilidades.datos');

const obtenerMesa = (peticion) => Number(peticion.usuario?.idMesa || peticion.usuario?.mesa);
const obtenerPermisos = (peticion) => ({
  idRol: Number(peticion.usuario?.idRol),
  idSoporte: Number(peticion.usuario?.idSoporte) || null
});

const validarDatos = (datos) => {
  if (!datos.DESCRIPCION?.trim() || !Number(datos.IDAREA) || !Number(datos.IDSOPORTE) || !datos.FECHAINICIO || !datos.FECHAFIN) {
    return 'DESCRIPCION, IDAREA, IDSOPORTE, FECHAINICIO y FECHAFIN son obligatorios';
  }
  if (new Date(datos.FECHAFIN) < new Date(datos.FECHAINICIO)) {
    return 'FECHAFIN no puede ser anterior a FECHAINICIO';
  }
  return null;
};

const obtenerResponsabilidades = async (peticion, respuesta) => {
  try {
    const datos = await consultarResponsabilidades(obtenerMesa(peticion));
    respuesta.json(datos);
  } catch (error) {
    respuesta.status(500).json({ mensaje: 'Error al consultar las responsabilidades', error: error.message });
  }
};

const insertarResponsabilidad = async (peticion, respuesta) => {
  const errorValidacion = validarDatos(peticion.body);
  if (errorValidacion) return respuesta.status(400).json({ mensaje: errorValidacion });

  try {
    const dato = await crearResponsabilidad(peticion.body, obtenerMesa(peticion));
    if (!dato) return respuesta.status(400).json({ mensaje: 'El soporte seleccionado no pertenece a esta mesa' });
    respuesta.status(201).json(dato);
  } catch (error) {
    respuesta.status(500).json({ mensaje: 'Error al crear la responsabilidad', error: error.message });
  }
};

const actualizarResponsabilidad = async (peticion, respuesta) => {
  const errorValidacion = validarDatos(peticion.body);
  if (errorValidacion) return respuesta.status(400).json({ mensaje: errorValidacion });

  try {
    const dato = await editarResponsabilidad(peticion.params.id, peticion.body, obtenerMesa(peticion));
    if (!dato) return respuesta.status(404).json({ mensaje: 'Responsabilidad no encontrada o soporte inválido' });
    respuesta.json(dato);
  } catch (error) {
    respuesta.status(500).json({ mensaje: 'Error al editar la responsabilidad', error: error.message });
  }
};

const borrarResponsabilidad = async (peticion, respuesta) => {
  try {
    const permisos = obtenerPermisos(peticion);
    const eliminado = await eliminarResponsabilidad(peticion.params.id, obtenerMesa(peticion), permisos.idRol, permisos.idSoporte);
    if (!eliminado) return respuesta.status(404).json({ mensaje: 'Responsabilidad no encontrada o no autorizada' });
    respuesta.json({ mensaje: 'Responsabilidad eliminada correctamente' });
  } catch (error) {
    respuesta.status(500).json({ mensaje: 'Error al eliminar la responsabilidad', error: error.message });
  }
};

const cambiarEstadoResponsabilidad = async (peticion, respuesta) => {
  const estadoRecibido = String(peticion.body.ESTADO || '').trim().toUpperCase();
  const estado = estadoRecibido === 'COMPLETADA' ? 'FINALIZADO' : estadoRecibido;
  if (!['PENDIENTE', 'EN PROCESO', 'FINALIZADO'].includes(estado)) {
    return respuesta.status(400).json({ mensaje: 'ESTADO debe ser PENDIENTE, EN PROCESO o FINALIZADO' });
  }
  try {
    const permisos = obtenerPermisos(peticion);
    const dato = await actualizarEstadoResponsabilidad(peticion.params.id, estado, obtenerMesa(peticion), permisos.idRol, permisos.idSoporte);
    if (!dato) return respuesta.status(404).json({ mensaje: 'Responsabilidad no encontrada o no autorizada' });
    return respuesta.json(dato);
  } catch (error) {
    return respuesta.status(500).json({ mensaje: 'Error al cambiar el estado', error: error.message });
  }
};

module.exports = {
  obtenerResponsabilidades,
  insertarResponsabilidad,
  actualizarResponsabilidad,
  cambiarEstadoResponsabilidad,
  borrarResponsabilidad
};
