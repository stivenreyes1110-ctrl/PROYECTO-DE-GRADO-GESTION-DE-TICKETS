import { useCallback } from 'react';
import * as api from './inventario.fetch';
import { REGISTROS_POR_PAGINA } from '../variables/inventario.constantes';
export function useEventosInventario({token, variables, setError, consultarMantenimientos, paginaMantenimientos, anioMantenimientos, sedeMantenimientos, consultarCronograma, periodoCronograma}) {
  const { activos, setPaginaInventario, activoEditando, setActivoEditando, setModalActivoAbierto, paginaInventario, setCargandoInventario, setActivos, setTotalInventario, setResumenInventario, setTodosActivos } = variables;
  const consultarInventario = useCallback(async (pagina = 1) => {
    setCargandoInventario(true);
    try {
      const [paginado, catalogo, conteoInventario] = await Promise.all([
        api.consultarInventario(token, pagina, REGISTROS_POR_PAGINA),
        api.consultarTodosActivos(token),
        api.consultarConteoInventario(token)
      ]);
      const inventarioCompleto = Array.isArray(catalogo) ? catalogo : catalogo.datos || [];
      const totalCategorias = new Set(
        inventarioCompleto
          .map((activo) => String(activo.CATEGORIA || '').trim().toUpperCase())
          .filter(Boolean)
      ).size;
      const totalAreas = new Set(
        inventarioCompleto
          .map((activo) => activo.IDAREA)
          .filter((idArea) => idArea !== null && idArea !== undefined && idArea !== '')
          .map(String)
      ).size;
      const totalSedes = new Set(
        inventarioCompleto
          .map((activo) => activo.IDSEDE)
          .filter((idSede) => idSede !== null && idSede !== undefined && idSede !== '')
          .map(String)
      ).size;

      setActivos(paginado.datos || []);
      setTotalInventario(conteoInventario.total || 0);
      setResumenInventario({
        total: conteoInventario.total ?? inventarioCompleto.length,
        categorias: conteoInventario.categorias ?? totalCategorias,
        areas: conteoInventario.areas ?? totalAreas,
        sedes: conteoInventario.sedes ?? totalSedes
      });
      setTodosActivos(inventarioCompleto);
      setError('');
    } catch (errorConsulta) {
      setError(errorConsulta.message);
    } finally {
      setCargandoInventario(false);
    }
  }, [token, setActivos, setTotalInventario, setResumenInventario, setTodosActivos, setError, setCargandoInventario]);

  const guardarActivo = async (datos) => {
    try {
      if (activoEditando) await api.actualizarActivo(token, activoEditando.ID, datos);
      else await api.enviarActivo(token, datos);
      setActivoEditando(null);
      setModalActivoAbierto(false);
      await consultarInventario(paginaInventario);
    } catch (errorGuardado) {
      setError(errorGuardado.message);
      throw errorGuardado;
    }
  };

  const eliminarActivo = async (id) => {
    if (!window.confirm('¿Desea eliminar este activo?')) return;
    try {
      await api.eliminarActivo(token, id);
      if (paginaInventario > 1 && activos.length === 1) setPaginaInventario(paginaInventario - 1);
      await Promise.all([
        consultarInventario(paginaInventario > 1 && activos.length === 1 ? paginaInventario - 1 : paginaInventario),
        consultarMantenimientos(paginaMantenimientos, anioMantenimientos, sedeMantenimientos),
        consultarCronograma(periodoCronograma)
      ]);
    } catch (errorEliminacion) {
      setError(errorEliminacion.message);
    }
  };

  return {consultarInventario, guardarActivo, eliminarActivo};
}
