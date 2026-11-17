const RECURSOS = Object.freeze({
  incidentes: {tabla: 'INCIDENTESMESA', mesa: true},
  sedes: {tabla: 'SEDESCLB'},
  areas: {tabla: 'AREASCLB'},
  prioridades: {tabla: 'PRIORIDADESMESA', mesa: true}
});
function validarDatos(recurso, datos = {}) {
  if (!Object.hasOwn(RECURSOS, recurso)) return {error: 'Seccion de configuracion no valida.'};
  const NOMBRE = String(datos.NOMBRE ?? '').trim();
  if (!NOMBRE || NOMBRE.length > 100) return {error: 'El nombre es obligatorio y admite hasta 100 caracteres.'};
  const valor = {NOMBRE};
  if (recurso === 'areas') {
    valor.IDSEDE = Number(datos.IDSEDE);
    if (!Number.isSafeInteger(valor.IDSEDE) || valor.IDSEDE <= 0) return {error: 'Selecciona una sede valida.'};
    valor.PISO = datos.PISO === '' || datos.PISO == null ? null : Number(datos.PISO);
    if (valor.PISO !== null && (!Number.isInteger(valor.PISO) || valor.PISO < -100 || valor.PISO > 1000)) return {error: 'El piso debe ser un numero entero entre -100 y 1000.'};
  }
  if (recurso === 'prioridades') {
    valor.CODIGO = String(datos.CODIGO ?? '').trim().toUpperCase();
    if (!/^[A-Z0-9_]{1,20}$/.test(valor.CODIGO)) return {error: 'El codigo admite hasta 20 letras, numeros o guion bajo.'};
    valor.ORDEN = Number(datos.ORDEN ?? 0);
    if (!Number.isSafeInteger(valor.ORDEN) || valor.ORDEN < 0 || valor.ORDEN > 1000) return {error: 'El orden debe estar entre 0 y 1000.'};
  }
  return {valor};
}
module.exports = {RECURSOS, validarDatos};
