const texto = valor => valor === null || valor === undefined || String(valor).trim() === '' ? 'Sin registro' : String(valor);
const referencia = (nombre, id) => nombre ? `${nombre}${id != null ? ` (${id})` : ''}` : texto(id);
export function datosActivo(activo) {
  const fecha = activo.FECHAREGISTRO ? new Date(activo.FECHAREGISTRO) : null;
  return [
    ['ID', texto(activo.ID)],
    ['N?mero de serie', texto(activo.NUMEROSERIE)],
    ['Categor?a', texto(activo.CATEGORIA)],
    ['Marca', texto(activo.MARCA)],
    ['Modelo', texto(activo.MODELO)],
    ['Placa', texto(activo.PLACA)],
    ['Ubicaci?n', texto(activo.DESCRIPCIONUBICACION)],
    ['?rea', referencia(activo.NOMBREAREA, activo.IDAREA)],
    ['Sede', referencia(activo.NOMBRESEDE, activo.IDSEDE)],
    ['Mesa', referencia(activo.NOMBREMESA, activo.IDMESA)],
    ['Fecha de registro', fecha && !Number.isNaN(fecha.getTime()) ? fecha.toLocaleString('es-CO', {timeZone: 'America/Bogota'}) : 'Sin registro']
  ];
}
export const nombreActivoCompleto = activo => datosActivo(activo).map((dato) => dato[1]).join(' | ');
