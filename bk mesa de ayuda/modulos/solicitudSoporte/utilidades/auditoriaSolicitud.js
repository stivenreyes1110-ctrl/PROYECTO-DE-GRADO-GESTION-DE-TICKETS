const obtenerIp = (req) => {
  const reenviada = req.headers['x-forwarded-for'];
  const ip = Array.isArray(reenviada)
    ? reenviada[0]
    : String(reenviada || req.ip || req.socket?.remoteAddress || 'desconocida').split(',')[0];
  return ip.trim().replace('::ffff:', '');
};

const obtenerActor = (req) => ({
  idUsuario: Number(req.usuario?.idUsuario) || null,
  usuario: req.usuario?.usuario || 'desconocido',
  idRol: Number(req.usuario?.idRol) || null,
  idMesa: Number(req.usuario?.idMesa) || null,
  idSoporte: Number(req.usuario?.idSoporte) || null,
  ip: obtenerIp(req)
});

const escribir = (nivel, accion, req, resultado, detalles = {}) => {
  const registro = {
    fecha: new Date().toISOString(),
    modulo: 'SOLICITUD_SOPORTE',
    nivel,
    accion,
    resultado,
    actor: obtenerActor(req),
    detalles
  };

  const prefijo = nivel === 'ERROR'
    ? '❌ [SOLICITUD_SOPORTE]'
    : nivel === 'ADVERTENCIA'
      ? '⚠️ [SOLICITUD_SOPORTE]'
      : '✅ [SOLICITUD_SOPORTE]';

  const salida = JSON.stringify(registro);
  if (nivel === 'ERROR') console.error(prefijo, salida);
  else if (nivel === 'ADVERTENCIA') console.warn(prefijo, salida);
  else console.info(prefijo, salida);
};

const registrarEvento = (req, accion, resultado, detalles = {}) => {
  const nivel = resultado === 'ERROR'
    ? 'ERROR'
    : ['RECHAZADO', 'NO_ENCONTRADO'].includes(resultado)
      ? 'ADVERTENCIA'
      : 'INFO';
  escribir(nivel, accion, req, resultado, detalles);
};

const registrarAcceso = (req, res, next) => {
  const inicio = process.hrtime.bigint();

  res.on('finish', () => {
    const duracionMs = Number(process.hrtime.bigint() - inicio) / 1e6;
    const resultado = res.statusCode >= 500
      ? 'ERROR'
      : res.statusCode >= 400
        ? 'RECHAZADO'
        : 'COMPLETADO';

    escribir(
      res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'ADVERTENCIA' : 'INFO',
      'ACCESO_HTTP',
      req,
      resultado,
      {
        metodo: req.method,
        ruta: `${req.baseUrl}${req.path}`,
        codigoHttp: res.statusCode,
        duracionMs: Number(duracionMs.toFixed(2))
      }
    );
  });

  next();
};

module.exports = {
  registrarAcceso,
  registrarEvento
};
