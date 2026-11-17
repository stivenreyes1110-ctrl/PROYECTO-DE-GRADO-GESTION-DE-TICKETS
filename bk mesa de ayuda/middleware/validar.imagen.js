const {RUTA_IMAGEN} = require('./guardar.imagen');
const MAX_BYTES = 2 * 1024 * 1024;
function validarImagen(campo) {
  return (req, res, next) => {
    const valor = req.body?.[campo];
    if (valor === undefined || valor === null || valor === '') return next();
    if (typeof valor === 'string' && RUTA_IMAGEN.test(valor)) return next();
    if (typeof valor !== 'string' || valor.length > Math.ceil(MAX_BYTES / 3) * 4 + 40) return res.status(400).json({mensaje: 'La imagen debe pesar como maximo 2 MB.'});
    const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(valor);
    if (!match) return res.status(400).json({mensaje: 'La imagen debe ser JPG, PNG o WebP.'});
    const bytes = Buffer.from(match[2], 'base64');
    const tipo = match[1];
    const valida = tipo === 'jpeg' ? bytes.subarray(0,3).equals(Buffer.from([255,216,255])) : tipo === 'png' ? bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : bytes.toString('ascii',0,4) === 'RIFF' && bytes.toString('ascii',8,12) === 'WEBP';
    if (!valida || bytes.length > MAX_BYTES || bytes.toString('base64') !== match[2]) return res.status(400).json({mensaje: 'Imagen invalida o mayor de 2 MB.'});
    next();
  };
}
module.exports = {validarImagen};
