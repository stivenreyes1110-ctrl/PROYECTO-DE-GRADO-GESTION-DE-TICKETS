import {useMemo, useState} from 'react';
export function useVariablesTablaInventario({activos, total, limite}) {
  const [busqueda, setBusqueda] = useState('');
  const totalPaginas = Math.max(1, Math.ceil(total / limite));

  const obtenerArea = (activo) => activo.NOMBREAREA || activo.NOMBRE_AREA || activo.AREA || activo.IDAREA;
  const obtenerSede = (activo) => activo.NOMBRESEDE || activo.NOMBRE_SEDE || activo.SEDE || activo.IDSEDE;
  const obtenerMesa = (activo) => activo.NOMBREMESA || activo.NOMBRE_MESA || activo.MESA || activo.IDMESA;

  const activosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return activos;

    return activos.filter((activo) => {
      return (
        String(activo.CATEGORIA || '').toLowerCase().includes(texto) ||
        String(activo.NUMEROSERIE || '').toLowerCase().includes(texto) ||
        String(activo.MARCA || '').toLowerCase().includes(texto) ||
        String(activo.MODELO || '').toLowerCase().includes(texto) ||
        String(activo.PLACA || '').toLowerCase().includes(texto) ||
        String(activo.DESCRIPCIONUBICACION || '').toLowerCase().includes(texto) ||
        String(obtenerArea(activo) || '').toLowerCase().includes(texto) ||
        String(obtenerSede(activo) || '').toLowerCase().includes(texto) ||
        String(obtenerMesa(activo) || '').toLowerCase().includes(texto)
      );
    });
  }, [activos, busqueda]);

  return {busqueda, setBusqueda, totalPaginas, activosFiltrados, obtenerArea, obtenerSede, obtenerMesa};
}
