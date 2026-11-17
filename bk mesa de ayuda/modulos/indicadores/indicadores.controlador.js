const servicio = require('./indicadores.servicio');
const {validarFiltros} = require('./indicadores.validacion');
async function consultar(req,res) {
  try {
    if (![1,2].includes(Number(req.usuario?.idRol))) return res.status(403).json({mensaje:'No tiene permisos para consultar indicadores.'});
    if (!Number.isSafeInteger(Number(req.usuario.idMesa)) || Number(req.usuario.idMesa)<=0 || !Number.isSafeInteger(Number(req.usuario.idUsuario)) || Number(req.usuario.idUsuario)<=0) return res.status(400).json({mensaje:'La sesión no tiene una mesa o usuario válido.'});
    const filtros = validarFiltros(req.query);
    res.json(await servicio.consultar(req.usuario,filtros));
  } catch(error) {
    if (error.status===400 || error.number===50300) return res.status(400).json({mensaje:error.message});
    if (error.number===50303) return res.status(403).json({mensaje:error.message});
    console.error('[INDICADORES]',error.code || error.name);
    res.status(500).json({mensaje:'No fue posible consultar los indicadores. Intente nuevamente.'});
  }
}
module.exports = {consultar};
