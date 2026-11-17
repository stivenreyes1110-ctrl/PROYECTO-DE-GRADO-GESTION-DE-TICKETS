const autorizarAdministracionTickets = (req, res, next) => {
  const idRol = Number(req.usuario?.idRol);
  const idUsuario = Number(req.usuario?.idUsuario);
  const idMesa = Number(req.usuario?.idMesa);

  if (idRol !== 1) {
    return res.status(403).json({
      ok: false,
      mensaje: 'El modulo de administracion de tickets es exclusivo para administradores'
    });
  }

  if (![idUsuario, idMesa].every((valor) => Number.isInteger(valor) && valor > 0)) {
    return res.status(403).json({
      ok: false,
      mensaje: 'La sesion no contiene un usuario y una mesa validos'
    });
  }

  req.contextoAdministracion = { idRol, idUsuario, idMesa };
  return next();
};

module.exports = autorizarAdministracionTickets;
