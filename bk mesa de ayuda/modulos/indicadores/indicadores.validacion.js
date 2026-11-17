const fallo = mensaje => Object.assign(new Error(mensaje), {status:400});
function fechaValida(valor) {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const d = new Date(`${valor}T00:00:00Z`);
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0,10) === valor && Number(valor.slice(0,4)) >= 1900 && Number(valor.slice(0,4)) <= 9998;
}
function validarFiltros(query = {}) {
  const vista = query.vista || 'general';
  if (!['general','mensual','anual'].includes(vista)) throw fallo('Seleccione una vista válida.');
  const idUsuario = query.usuario ? Number(query.usuario) : null;
  if (query.usuario && (typeof query.usuario !== 'string' || !/^\d+$/.test(query.usuario) || !Number.isSafeInteger(idUsuario) || idUsuario <= 0 || idUsuario > 2147483647)) throw fallo('Usuario no válido.');
  let desde = query.desde || null, hasta = query.hasta || null;
  let anio = null, mes = null;
  if (vista !== 'general') {
    anio = Number(query.anio);
    if (typeof query.anio !== 'string' || !/^\d{4}$/.test(query.anio) || !Number.isInteger(anio) || anio < 1900 || anio > 9998) throw fallo('Seleccione un año válido.');
    if (vista === 'mensual') {
      mes = Number(query.mes);
      if (typeof query.mes !== 'string' || !/^\d{1,2}$/.test(query.mes) || !Number.isInteger(mes) || mes < 1 || mes > 12) throw fallo('Seleccione un mes válido.');
      desde = `${anio}-${String(mes).padStart(2,'0')}-01`;
      hasta = new Date(Date.UTC(anio,mes,0)).toISOString().slice(0,10);
    } else {desde = `${anio}-01-01`;hasta = `${anio}-12-31`;}
  }
  if ((desde && !fechaValida(desde)) || (hasta && !fechaValida(hasta))) throw fallo('Indique fechas válidas.');
  if (desde && hasta && desde > hasta) throw fallo('La fecha inicial debe ser anterior o igual a la final.');
  return {vista, idUsuario, desde, hasta, anio, mes};
}
function completarSerie(datos, filtros) {
  if (filtros.vista === 'general') return datos;
  const cantidad = filtros.vista === 'anual' ? 12 : new Date(Date.UTC(filtros.anio,filtros.mes,0)).getUTCDate();
  const mapa = new Map(datos.map(d => [d.PERIODO,d]));
  return Array.from({length:cantidad}, (_,i) => {
    const periodo = filtros.vista === 'anual' ? `${filtros.anio}-${String(i+1).padStart(2,'0')}` : `${filtros.anio}-${String(filtros.mes).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`;
    return mapa.get(periodo) || {PERIODO:periodo,TOTAL:0,SOLUCIONADOS:0,CERRADOS:0};
  });
}
module.exports = {validarFiltros, completarSerie};
