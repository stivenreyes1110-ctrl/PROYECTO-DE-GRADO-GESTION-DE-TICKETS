const {prioridadDisponible} = require('../../configuracion/configuracion.servicio');
const servicio = require('../compartido/solicitudSoporte.datos');
const { registrarEvento } = require('../utilidades/auditoriaSolicitud');

const contextoUsuario = (req) => ({
  idUsuario: Number(req.usuario.idUsuario),
  idMesa: Number(req.usuario.idMesa),
  direccion: String(req.headers['x-forwarded-for'] || req.ip || req.socket?.remoteAddress || '')
    .split(',')[0]
    .trim()
    .replace('::ffff:', '')
});

const validarSolicitud = (datos) => {
  const requeridos = ['incidente', 'area', 'sede', 'prioridad', 'descripcion', 'ubicacion'];
  const faltantes = requeridos.filter((campo) => !String(datos[campo] ?? '').trim());
  return faltantes.length ? `Campos obligatorios: ${faltantes.join(', ')}` : null;
};

const listarSolicitudes = async (req, res) => {
  try {
    const resultado = await servicio.listarSolicitudes({
      ...contextoUsuario(req),
      pagina: Number(req.query.pagina) || 1,
      limite: Number(req.query.limite) || 10,
      estado: req.query.estado,
      filtros: {
        ticket: req.query.ticket,
        dependencia: req.query.dependencia,
        solicitud: req.query.solicitud,
        prioridad: req.query.prioridad,
        estadoTexto: req.query.estadoTexto,
        registro: req.query.registro,
        respuesta: req.query.respuesta,
        responsables: req.query.responsables
      }
    });
    registrarEvento(req, 'LISTAR_SOLICITUDES', 'EXITOSO', {
      pagina: resultado.paginacion.pagina,
      registrosDevueltos: resultado.datos.length,
      totalRegistros: resultado.paginacion.total,
      estado: req.query.estado || 'TODOS',
      filtrosActivos: Object.keys(req.query).filter((campo) => !['pagina', 'limite'].includes(campo))
    });
    return res.json(resultado);
  } catch (error) {
    registrarEvento(req, 'LISTAR_SOLICITUDES', 'ERROR', { error: error.message });
    return res.status(500).json({ ok: false, mensaje: 'Error al consultar las solicitudes' });
  }
};

const obtenerResumenSolicitudes = async (req, res) => {
  try {
    const resumen = await servicio.obtenerResumenSolicitudes(contextoUsuario(req));
    return res.json({ ok: true, datos: resumen });
  } catch (error) {
    registrarEvento(req, 'RESUMEN_SOLICITUDES', 'ERROR', { error: error.message });
    return res.status(500).json({ ok: false, mensaje: 'Error al consultar el resumen de solicitudes' });
  }
};

const obtenerSolicitud = async (req, res) => {
  try {
    const solicitud = await servicio.obtenerSolicitud({
      id: Number(req.params.id),
      ...contextoUsuario(req)
    });
    if (!solicitud) {
      registrarEvento(req, 'SELECCIONAR_SOLICITUD', 'NO_ENCONTRADO', {
        idTicket: Number(req.params.id)
      });
      return res.status(404).json({ ok: false, mensaje: 'Solicitud no encontrada' });
    }
    registrarEvento(req, 'SELECCIONAR_SOLICITUD', 'EXITOSO', {
      idTicket: solicitud.ID_TICKET,
      estado: solicitud.ESTADO
    });
    return res.json(solicitud);
  } catch (error) {
    registrarEvento(req, 'SELECCIONAR_SOLICITUD', 'ERROR', {
      idTicket: Number(req.params.id),
      error: error.message
    });
    return res.status(500).json({ ok: false, mensaje: 'Error al consultar la solicitud' });
  }
};

const crearSolicitud = async (req, res) => {
  const errorValidacion = validarSolicitud(req.body);
  if (errorValidacion) {
    registrarEvento(req, 'CREAR_SOLICITUD', 'RECHAZADO', { motivo: errorValidacion });
    return res.status(400).json({ ok: false, mensaje: errorValidacion });
  }

  try {
    if (!await prioridadDisponible(Number(req.usuario.idMesa), req.body.prioridad)) return res.status(400).json({mensaje: 'La prioridad no esta configurada para esta mesa.'});
    const archivoUrl = req.file
      ? `${req.protocol}://${req.get('host')}/uploads/TICS/${req.file.filename}`
      : null;
    const solicitud = await servicio.crearSolicitud({
      ...req.body,
      ...contextoUsuario(req),
      idUsuario: req.idSolicitanteWhatsApp ?? Number(req.usuario.idUsuario),
      archivoUrl
    });
    registrarEvento(req, 'CREAR_SOLICITUD', 'EXITOSO', {
      idTicket: solicitud.ID,
      idSolicitante: req.idSolicitanteWhatsApp ?? Number(req.usuario.idUsuario),
      idArea: Number(req.body.area),
      idSede: Number(req.body.sede),
      idIncidente: Number(req.body.incidente),
      prioridad: req.body.prioridad,
      tieneArchivo: Boolean(req.file)
    });
    return res.status(201).json({ ok: true, mensaje: 'Solicitud creada', data: solicitud });
  } catch (error) {
    registrarEvento(req, 'CREAR_SOLICITUD', 'ERROR', { error: error.message });
    return res.status(500).json({ ok: false, mensaje: 'Error al crear la solicitud' });
  }
};

const actualizarSolicitud = async (req, res) => {
  const errorValidacion = validarSolicitud(req.body);
  if (errorValidacion) {
    registrarEvento(req, 'ACTUALIZAR_SOLICITUD', 'RECHAZADO', {
      idTicket: Number(req.params.id),
      motivo: errorValidacion
    });
    return res.status(400).json({ ok: false, mensaje: errorValidacion });
  }

  try {
    if (!await prioridadDisponible(Number(req.usuario.idMesa), req.body.prioridad)) return res.status(400).json({mensaje: 'La prioridad no esta configurada para esta mesa.'});
    const solicitud = await servicio.actualizarSolicitud({
      id: Number(req.params.id),
      ...req.body,
      ...contextoUsuario(req)
    });
    if (!solicitud) {
      registrarEvento(req, 'ACTUALIZAR_SOLICITUD', 'NO_ENCONTRADO', {
        idTicket: Number(req.params.id),
        motivo: 'No pertenece al usuario autenticado o no está pendiente'
      });
      return res.status(404).json({
        ok: false,
        mensaje: 'Solicitud no encontrada, no autorizada o ya no está pendiente'
      });
    }
    registrarEvento(req, 'ACTUALIZAR_SOLICITUD', 'EXITOSO', {
      idTicket: solicitud.ID,
      idArea: solicitud.IDAREA,
      idSede: solicitud.IDSEDE,
      idIncidente: solicitud.IDINCIDENTE,
      prioridad: solicitud.PRIORIDAD
    });
    return res.json({ ok: true, mensaje: 'Solicitud actualizada', data: solicitud });
  } catch (error) {
    registrarEvento(req, 'ACTUALIZAR_SOLICITUD', 'ERROR', {
      idTicket: Number(req.params.id),
      error: error.message
    });
    return res.status(500).json({ ok: false, mensaje: 'Error al actualizar la solicitud' });
  }
};

const eliminarSolicitud = async (req, res) => {
  try {
    const eliminada = await servicio.eliminarSolicitud({
      id: Number(req.params.id),
      ...contextoUsuario(req)
    });
    if (!eliminada) {
      registrarEvento(req, 'ELIMINAR_SOLICITUD', 'NO_ENCONTRADO', {
        idTicket: Number(req.params.id),
        motivo: 'No pertenece al usuario autenticado o no está pendiente'
      });
      return res.status(404).json({
        ok: false,
        mensaje: 'Solicitud no encontrada, no autorizada o ya no está pendiente'
      });
    }
    registrarEvento(req, 'ELIMINAR_SOLICITUD', 'EXITOSO', {
      idTicket: Number(req.params.id)
    });
    return res.json({ ok: true, mensaje: 'Solicitud eliminada' });
  } catch (error) {
    registrarEvento(req, 'ELIMINAR_SOLICITUD', 'ERROR', {
      idTicket: Number(req.params.id),
      error: error.message
    });
    return res.status(500).json({ ok: false, mensaje: 'Error al eliminar la solicitud' });
  }
};

module.exports = {
  listarSolicitudes,
  obtenerResumenSolicitudes,
  obtenerSolicitud,
  crearSolicitud,
  actualizarSolicitud,
  eliminarSolicitud
};
