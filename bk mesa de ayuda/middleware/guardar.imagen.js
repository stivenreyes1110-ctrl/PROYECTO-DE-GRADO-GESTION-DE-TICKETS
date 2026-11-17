const fs = require('node:fs/promises');
const path = require('node:path');
const {randomUUID} = require('node:crypto');
const DIRECTORIO_ACTIVOS = path.resolve(__dirname, '../uploads/activos');
const RUTA_IMAGEN = /^\/uploads\/activos\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/;

// Se ejecuta despues de validarImagen y antes del controlador SQL.
function guardarImagen(campo, directorio = DIRECTORIO_ACTIVOS) {
  return async (req, res, next) => {
    if (!['POST', 'PUT'].includes(req.method)) return next();
    const valor = req.body?.[campo];
    if (!valor) return next();
    if (RUTA_IMAGEN.test(valor)) {
      try {
        await fs.access(path.join(directorio, path.basename(valor)));
        return next();
      } catch {
        return res.status(400).json({mensaje: 'La imagen guardada ya no existe. Adjunta la foto nuevamente.'});
      }
    }
    let archivo;
    try {
      const match = /^data:image\/(jpeg|png|webp);base64,(.+)$/.exec(valor);
      if (!match) return res.status(400).json({mensaje: 'Formato de imagen no permitido.'});
      const extension = match[1] === 'jpeg' ? 'jpg' : match[1];
      const nombre = `${randomUUID()}.${extension}`;
      await fs.mkdir(directorio, {recursive: true});
      archivo = path.join(directorio, nombre);
      await fs.writeFile(archivo, Buffer.from(match[2], 'base64'), {flag: 'wx'});
      req.body[campo] = `/uploads/activos/${nombre}`;
      // Si SQL o la validacion de campos rechaza el registro, retirar solo la nueva foto.
      res.once('finish', () => {
        if (res.statusCode >= 400) fs.unlink(archivo).catch(error => {
          if (error.code !== 'ENOENT') console.error('No fue posible retirar una imagen rechazada:', error.code);
        });
      });
      next();
    } catch (error) {
      if (archivo) await fs.unlink(archivo).catch(() => {});
      console.error('Error guardando imagen del activo:', error.code);
      res.status(500).json({mensaje: 'No fue posible guardar la imagen en la carpeta activos.'});
    }
  };
}
module.exports = {guardarImagen, DIRECTORIO_ACTIVOS, RUTA_IMAGEN};
