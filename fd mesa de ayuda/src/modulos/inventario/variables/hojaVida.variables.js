import {normalizarTipo} from '../utilidades/inventario.utilidades';
export function obtenerVariablesHojaVida(activo, mantenimientos) {
  const mantenimientosEquipo = mantenimientos
    .filter((item) => Number(item.IDACTIVO) === Number(activo.ID))
    .sort((a, b) => new Date(b.FECHA || 0) - new Date(a.FECHA || 0));

  const preventivos = mantenimientosEquipo.filter((item) => normalizarTipo(item.TIPOMANTENIMIENTO) === 'PREVENTIVO');
  const correctivos = mantenimientosEquipo.filter((item) => normalizarTipo(item.TIPOMANTENIMIENTO) === 'CORRECTIVO');

  return {mantenimientosEquipo, preventivos, correctivos};
}
