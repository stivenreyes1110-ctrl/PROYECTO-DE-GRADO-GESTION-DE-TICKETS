const servicio = require('./configuracion.servicio');
const {RECURSOS, validarDatos} = require('./configuracion.validacion');
async function soloAdministrador(req, res, next) {
  try {
    if (!await servicio.esAdministrador(req.usuario)) return res.status(403).json({mensaje: 'Solo los administradores de la mesa pueden cambiar la configuracion.'});
    next();
  } catch {res.status(500).json({mensaje: 'No fue posible verificar los permisos.'});}
}
function manejarError(res, error) {
  const numero = Number(error.number);
  if (numero === 50104) return res.status(404).json({mensaje: error.message});
  if (numero === 50100) return res.status(400).json({mensaje: error.message});
  if ([50109, 547, 2601, 2627].includes(numero)) return res.status(409).json({mensaje: numero === 50109 ? error.message : 'El registro esta duplicado o tiene datos asociados.'});
  console.error('[CONFIGURACION]', error.code || error.name);
  return res.status(500).json({mensaje: 'No fue posible completar la operacion de configuracion.'});
}
function validarRecurso(req, res, next) {
  if (!Object.hasOwn(RECURSOS, req.params.recurso)) return res.status(404).json({mensaje: 'Seccion no encontrada.'});
  if (req.params.id && (!Number.isSafeInteger(Number(req.params.id)) || Number(req.params.id) <= 0)) return res.status(400).json({mensaje: 'ID invalido.'});
  next();
}
async function listar(req, res) {
  try {res.json(await servicio.listar(req.params.recurso, Number(req.usuario.idMesa)));} catch(e) {manejarError(res,e);}
}
async function guardar(req, res) {
  const {valor, error} = validarDatos(req.params.recurso, req.body);
  if(error) return res.status(400).json({mensaje: error});
  try {
    const datos = await servicio.guardar(req.params.recurso, valor, Number(req.usuario.idMesa), req.params.id ? Number(req.params.id) : null);
    res.status(req.params.id ? 200 : 201).json(datos);
  } catch(e) {manejarError(res,e);}
}
async function eliminar(req, res) {
  try {await servicio.eliminar(req.params.recurso, Number(req.params.id), Number(req.usuario.idMesa));res.json({mensaje: 'Registro eliminado.'});} catch(e) {manejarError(res,e);}
}
async function prioridades(req,res) {
  try {res.json(await servicio.listar('prioridades', Number(req.usuario.idMesa)));} catch(e) {manejarError(res,e);}
}
module.exports = {soloAdministrador, validarRecurso, listar, guardar, eliminar, prioridades};
