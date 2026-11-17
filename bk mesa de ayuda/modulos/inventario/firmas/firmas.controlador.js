const servicio = require('./firmas.servicio');
const {validarFirma} = require('./firmas.validacion');
function validarAcceso(req,res,next) {
  if (![1,2].includes(Number(req.usuario?.idRol))) return res.status(403).json({mensaje: 'Las firmas requieren acceso de administrador o soporte.'});
  if (!Number.isSafeInteger(Number(req.params.id)) || Number(req.params.id)<=0) return res.status(400).json({mensaje: 'Activo no valido.'});
  next();
}
function errorRespuesta(res,error) {
  if (Number(error.number)===50200) return res.status(400).json({mensaje: error.message});
  if (Number(error.number)===50204) return res.status(404).json({mensaje: error.message});
  if (Number(error.number)===50203) return res.status(403).json({mensaje: error.message});
  console.error('[FIRMAS_HOJA_VIDA]',error.code||error.name);
  return res.status(500).json({mensaje: 'No fue posible completar la operacion de firmas.'});
}
async function consultar(req,res) {
  try {res.json(await servicio.consultarFirmas(Number(req.params.id),req.usuario));}catch(e){errorRespuesta(res,e);}
}
async function guardar(req,res) {
  const {valor,error}=validarFirma(req.params.tipo,req.body);
  if(error)return res.status(400).json({mensaje:error});
  try {res.json(await servicio.guardarFirma(Number(req.params.id),req.params.tipo,valor,req.usuario));}catch(e){errorRespuesta(res,e);}
}
async function firmantes(req,res) {
  try {res.json(await servicio.consultarFirmantes(Number(req.params.id),req.usuario));}catch(e){errorRespuesta(res,e);}
}
module.exports={validarAcceso,consultar,guardar,firmantes};
