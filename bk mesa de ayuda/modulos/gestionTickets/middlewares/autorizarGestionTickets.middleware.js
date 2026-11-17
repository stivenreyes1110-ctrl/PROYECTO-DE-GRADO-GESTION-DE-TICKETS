const autorizarGestionTickets = (req, res, next) => {
  const idRol = Number(req.usuario?.idRol);
  const idUsuario = Number(req.usuario?.idUsuario);
  const idMesa = Number(req.usuario?.idMesa);
  const idSoporte = Number(req.usuario?.idSoporte);

  if (![1, 2].includes(idRol)) {
    return res.status(403).json({
      ok: false,
      mensaje: 'El módulo de gestión de tickets es exclusivo para administradores y personal de soporte'
    });
  }

  if (![idUsuario, idMesa].every((valor) => Number.isInteger(valor) && valor > 0)) {
    return res.status(403).json({
      ok: false,
      mensaje: 'La sesión no tiene una relación válida de usuario y mesa'
    });
  }

  if (idRol === 2 && (!Number.isInteger(idSoporte) || idSoporte <= 0)) {
    return res.status(403).json({
      ok: false,
      mensaje: 'El usuario no tiene un ID de soporte válido para la mesa seleccionada'
    });
  }

  req.contextoGestion = {
    idRol,
    idUsuario,
    idMesa,
    idSoporte,
    alcance: idRol === 1 ? 'MESA' : 'ASIGNADO'
  };
  return next();
};

module.exports = autorizarGestionTickets;
