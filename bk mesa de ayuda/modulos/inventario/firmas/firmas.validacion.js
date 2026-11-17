const TIPOS = new Set(['COORDINADOR', 'DESIGNADO']);
const MAX_BYTES = 512 * 1024;
function validarFirma(tipo, datos = {}) {
  if (!TIPOS.has(tipo)) return {error: 'Tipo de firma no valido.'};
  const idFirmante = datos.IDFIRMANTE;
  if (!Number.isSafeInteger(idFirmante) || idFirmante <= 0) return {error: 'Seleccione un usuario registrado como firmante.'};
  const valor = datos.FIRMA;
  if (typeof valor !== 'string' || valor.length > Math.ceil(MAX_BYTES / 3) * 4 + 30) return {error: 'La firma debe ser una imagen PNG de hasta 512 KB.'};
  const match = /^data:image\/png;base64,([A-Za-z0-9+/]+={0,2})$/.exec(valor);
  if (!match) return {error: 'La firma debe ser una imagen PNG.'};
  const imagen = Buffer.from(match[1], 'base64');
  if (imagen.length < 33 || imagen.length > MAX_BYTES || imagen.toString('base64') !== match[1] || !imagen.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) || imagen.toString('ascii',12,16) !== 'IHDR') return {error: 'El contenido de la firma no es valido.'};
  const ancho = imagen.readUInt32BE(16), alto = imagen.readUInt32BE(20);
  if (!ancho || !alto || ancho > 4096 || alto > 2048) return {error: 'Las dimensiones de la firma no son validas.'};
  return {valor: {idFirmante, imagen}};
}
module.exports = {TIPOS, validarFirma};
