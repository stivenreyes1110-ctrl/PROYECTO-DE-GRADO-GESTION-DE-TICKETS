const DEPENDENCIAS = Object.freeze({
  incidentes: [{clave:'TICKETS',singular:'ticket',plural:'tickets',consulta:'SELECT COUNT(*) FROM TICKETSMESA D WHERE D.IDINCIDENTE=C.ID'}],
  sedes: [
    {clave:'AREAS',singular:'área',plural:'áreas',consulta:'SELECT COUNT(*) FROM AREASCLB D WHERE D.IDSEDE=C.ID'},
    {clave:'TICKETS',singular:'ticket',plural:'tickets',consulta:'SELECT COUNT(*) FROM TICKETSMESA D WHERE D.IDSEDE=C.ID'},
    {clave:'ACTIVOS',singular:'activo',plural:'activos',consulta:'SELECT COUNT(*) FROM INVENTARIOSMESA D WHERE D.IDSEDE=C.ID'}
  ],
  areas: [
    {clave:'TICKETS',singular:'ticket',plural:'tickets',consulta:'SELECT COUNT(*) FROM TICKETSMESA D WHERE D.IDAREA=C.ID'},
    {clave:'ACTIVOS',singular:'activo',plural:'activos',consulta:'SELECT COUNT(*) FROM INVENTARIOSMESA D WHERE D.IDAREA=C.ID'},
    {clave:'RESPONSABILIDADES',singular:'responsabilidad',plural:'responsabilidades',consulta:'SELECT COUNT(*) FROM RESPONSABILIDADES D WHERE D.IDAREA=C.ID'}
  ],
  prioridades: [{clave:'TICKETS',singular:'ticket',plural:'tickets',consulta:'SELECT COUNT(*) FROM TICKETSMESA D WHERE D.PRIORIDAD=C.CODIGO AND D.IDMESA=C.IDMESA'}]
});
function columnasDependencias(recurso) {
  if (!Object.hasOwn(DEPENDENCIAS,recurso)) throw new Error('Recurso no permitido');
  return DEPENDENCIAS[recurso].map(d => `(${d.consulta}) AS DEP_${d.clave}`).join(', ');
}
function describirRegistro(recurso, registro, mesa) {
  const datos = {...registro};
  const dependencias = DEPENDENCIAS[recurso].map(d => {
    const total = Number(datos[`DEP_${d.clave}`] || 0);
    delete datos[`DEP_${d.clave}`];
    return {tipo:d.clave,total,descripcion:total === 1 ? d.singular : d.plural};
  }).filter(d => d.total > 0);
  const enUso = dependencias.length > 0;
  const compartido = recurso === 'incidentes' && Number(registro.IDMESA) !== Number(mesa);
  const motivo = compartido ? 'Incidente compartido: solo consulta.' : enUso ? `En uso: ${dependencias.map(d => `${d.total} ${d.descripcion}`).join(', ')}.` : '';
  return {...datos, DEPENDENCIAS:dependencias, EN_USO:enUso, PUEDE_ELIMINAR:!compartido && !enUso, MOTIVO_ELIMINACION:motivo};
}
module.exports = {columnasDependencias, describirRegistro};
