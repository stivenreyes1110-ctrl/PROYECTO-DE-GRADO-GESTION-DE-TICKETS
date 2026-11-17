const normalizarListado = (query) => {
  const pagina = Math.max(1, Number.parseInt(query.pagina, 10) || 1);
  const limite = Math.min(100, Math.max(1, Number.parseInt(query.limite, 10) || 10));
  const estadoSolicitado = Number.parseInt(query.estado, 10);
  const estado = [1, 2, 3].includes(estadoSolicitado) ? estadoSolicitado : null;
  return { pagina, limite, estado };
};

const normalizarActualizacion = (params, body) => {
  const idTicket = Number.parseInt(params.ticketId, 10);
  const estado = Number.parseInt(body.estado, 10);
  const observacion = String(body.observacion ?? body.descripcion ?? '').trim();
  const errores = [];

  if (!Number.isInteger(idTicket) || idTicket <= 0) errores.push('El ticket es inválido');
  if (![2, 3].includes(estado)) errores.push('El estado debe ser EN PROCESO o SOLUCIONADO');
  if (!observacion) errores.push('La observación es obligatoria');
  if (observacion.length > 2000) errores.push('La observación no puede superar 2000 caracteres');

  return { datos: { idTicket, estado, observacion }, errores };
};

module.exports = { normalizarListado, normalizarActualizacion };
