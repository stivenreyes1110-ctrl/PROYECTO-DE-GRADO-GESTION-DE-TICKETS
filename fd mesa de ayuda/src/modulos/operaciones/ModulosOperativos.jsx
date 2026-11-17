import { solicitarApi } from '../inventario/eventos/inventario.fetch';
import { REGISTROS_POR_PAGINA } from '../inventario/variables/inventario.constantes';
import { useVariablesInventario } from '../inventario/variables/useVariablesInventario';
import { useEventosInventario } from '../inventario/eventos/useEventosInventario';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, ClipboardList, Plus, Stethoscope } from 'lucide-react';
import Inventario from '../inventario/Inventario';
import Mantenimientos from '../mantenimientos/Mantenimientos';
import CronogramaInventarios from '../cronograma/CronogramaInventarios';
import ModalMantenimiento from '../mantenimientos/componentes/ModalMantenimiento';

const titulos = {
  inventario: {
    etiqueta: 'Control de activos',
    titulo: 'Inventario de area',
    descripcion: 'Consulta y administra los activos registrados en la mesa de ayuda.'
  },
  mantenimientos: {
    etiqueta: 'Historial tecnico',
    titulo: 'Mantenimientos',
    descripcion: 'Administra mantenimientos preventivos, correctivos y predictivos.'
  },
  cronograma: {
    etiqueta: 'Planeacion mensual',
    titulo: 'Cronograma de inventarios',
    descripcion: 'Consulta las actividades programadas para el mes actual.'
  }
};

export default function ModulosOperativos({ vista = 'inventario', logeo }) {
  const variablesInventario = useVariablesInventario();
  const { activos, todosActivos, totalInventario, resumenInventario, cargandoInventario, paginaInventario, setPaginaInventario, modalActivoAbierto, setModalActivoAbierto, activoEditando, setActivoEditando, modalHojaVidaAbierto, setModalHojaVidaAbierto, activoHojaVida, setActivoHojaVida } = variablesInventario;
  const [mantenimientos, setMantenimientos] = useState([]);
  const [todosMantenimientos, setTodosMantenimientos] = useState([]);
  const [totalMantenimientos, setTotalMantenimientos] = useState(0);
  const [resumenMantenimientos, setResumenMantenimientos] = useState(null);
  const [aniosMantenimientos, setAniosMantenimientos] = useState([]);
  const [anioMantenimientos, setAnioMantenimientos] = useState(() => new Date().getFullYear());
  const [sedesMantenimientos, setSedesMantenimientos] = useState([]);
  const [sedeMantenimientos, setSedeMantenimientos] = useState(null);
  const [eventosCronograma, setEventosCronograma] = useState([]);
  const [periodoCronograma, setPeriodoCronograma] = useState(() => {
    const hoy = new Date();
    return { mes: hoy.getMonth() + 1, anio: hoy.getFullYear() };
  });
  const [areas, setAreas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [cargandoCronograma, setCargandoCronograma] = useState(true);
  const [error, setError] = useState('');
  const [paginaMantenimientos, setPaginaMantenimientos] = useState(1);
  const [modalMantenimientoAbierto, setModalMantenimientoAbierto] = useState(false);
  const [mantenimientoEditando, setMantenimientoEditando] = useState(null);

  const solicitar = useCallback((ruta, opciones) => solicitarApi(logeo?.token, ruta, opciones), [logeo?.token]);

  const consultarMantenimientos = useCallback(async (pagina = 1, anio = null, sede = null) => {
    try {
      const filtroAnio = anio ? `&anio=${anio}` : '';
      const filtroSede = sede ? `&sede=${sede}` : '';
      const [paginado, historial] = await Promise.all([
        solicitar(`/mantenimientos?pagina=${pagina}&limite=${REGISTROS_POR_PAGINA}${filtroAnio}${filtroSede}`),
        solicitar('/mantenimientos')
      ]);
      setMantenimientos(paginado.datos || []);
      setTotalMantenimientos(paginado.total || 0);
      setResumenMantenimientos(paginado.conteos || null);
      setAniosMantenimientos(paginado.anios || []);
      setSedesMantenimientos(paginado.sedes || []);
      setTodosMantenimientos(Array.isArray(historial) ? historial : historial.datos || []);
      setError('');
    } catch (errorConsulta) {
      setError(errorConsulta.message);
    }
  }, [solicitar]);

  const consultarCronograma = useCallback(async (periodo) => {
    setCargandoCronograma(true);
    try {
      const datos = await solicitar(`/cronograma/inventarios?mes=${periodo.mes}&anio=${periodo.anio}`);
      setEventosCronograma(Array.isArray(datos) ? datos : []);
      setError('');
    } catch (errorConsulta) {
      setError(errorConsulta.message);
    } finally {
      setCargandoCronograma(false);
    }
  }, [solicitar]);

  const { consultarInventario, guardarActivo, eliminarActivo } = useEventosInventario({token: logeo?.token, variables: variablesInventario, setError, consultarMantenimientos, paginaMantenimientos, anioMantenimientos, sedeMantenimientos, consultarCronograma, periodoCronograma});

  useEffect(() => {
    const cargarCatalogos = async () => {
      const [resultadoAreas, resultadoSedes] = await Promise.allSettled([
        solicitar('/inventario/areas'),
        solicitar('/sedes')
      ]);

      if (resultadoAreas.status === 'fulfilled') {
        setAreas(Array.isArray(resultadoAreas.value) ? resultadoAreas.value : []);
      }

      if (resultadoSedes.status === 'fulfilled') {
        setSedes(Array.isArray(resultadoSedes.value) ? resultadoSedes.value : []);
      }

      const errores = [resultadoAreas, resultadoSedes]
        .filter((resultado) => resultado.status === 'rejected')
        .map((resultado) => resultado.reason?.message)
        .filter(Boolean);

      if (errores.length > 0) {
        setError(errores.join(' · '));
      }
    };

    cargarCatalogos();
  }, [solicitar]);

  useEffect(() => {
    const iniciarConsulta = async () => consultarInventario(paginaInventario);
    iniciarConsulta();
  }, [consultarInventario, paginaInventario]);

  useEffect(() => {
    const iniciarConsulta = async () => consultarMantenimientos(paginaMantenimientos, anioMantenimientos, sedeMantenimientos);
    iniciarConsulta();
  }, [consultarMantenimientos, paginaMantenimientos, anioMantenimientos, sedeMantenimientos]);

  useEffect(() => {
    const iniciarConsulta = async () => consultarCronograma(periodoCronograma);
    iniciarConsulta();
  }, [consultarCronograma, periodoCronograma]);

  const guardarMantenimiento = async (datos) => {
    try {
      await solicitar(
        mantenimientoEditando ? `/mantenimientos/${mantenimientoEditando.ID}` : '/mantenimientos',
        { method: mantenimientoEditando ? 'PUT' : 'POST', body: JSON.stringify(datos) }
      );
      setMantenimientoEditando(null);
      setModalMantenimientoAbierto(false);
      await Promise.all([
        consultarMantenimientos(paginaMantenimientos, anioMantenimientos, sedeMantenimientos),
        consultarCronograma(periodoCronograma)
      ]);
    } catch (errorGuardado) {
      setError(errorGuardado.message);
      throw errorGuardado;
    }
  };

  const eliminarMantenimiento = async (id) => {
    if (!window.confirm('¿Desea eliminar este mantenimiento?')) return;
    try {
      await solicitar(`/mantenimientos/${id}`, { method: 'DELETE' });
      await Promise.all([
        consultarMantenimientos(paginaMantenimientos, anioMantenimientos, sedeMantenimientos),
        consultarCronograma(periodoCronograma)
      ]);
    } catch (errorEliminacion) {
      setError(errorEliminacion.message);
    }
  };

  const encabezado = titulos[vista] || titulos.inventario;
  const Icono = vista === 'inventario'
    ? ClipboardList
    : vista === 'mantenimientos'
      ? Stethoscope
      : CalendarDays;

  const abrirNuevo = () => {
    if (vista === 'inventario') {
      setActivoEditando(null);
      setModalActivoAbierto(true);
    } else if (vista === 'mantenimientos') {
      setMantenimientoEditando(null);
      setModalMantenimientoAbierto(true);
    }
  };

  const resumenSedesVisible = useMemo(() => {
    if (sedesMantenimientos.length > 0) return sedesMantenimientos;

    const sedesDeLaMesa = new Set(todosActivos.map((activo) => Number(activo.IDSEDE)));
    return sedes.filter((sede) => sedesDeLaMesa.has(Number(sede.ID))).map((sede) => {
      const computadores = todosActivos.filter((activo) => (
        Number(activo.IDSEDE) === Number(sede.ID)
        && String(activo.CATEGORIA || '').toUpperCase().includes('COMPUT')
      ));
      const idsComputadores = new Set(computadores.map((activo) => Number(activo.ID)));
      const computadoresConMantenimiento = new Set(
        todosMantenimientos
          .filter((mantenimiento) => {
            const fecha = new Date(mantenimiento.FECHA);
            return idsComputadores.has(Number(mantenimiento.IDACTIVO))
              && fecha.getFullYear() === Number(anioMantenimientos)
              && String(mantenimiento.ESTADO || '').trim().toUpperCase() === 'FINALIZADO';
          })
          .map((mantenimiento) => Number(mantenimiento.IDACTIVO))
      ).size;

      return {
        IDSEDE: sede.ID,
        NOMBRESEDE: sede.NOMBRE,
        TOTALCOMPUTADORES: computadores.length,
        COMPUTADORESCONMANTENIMIENTO: computadoresConMantenimiento,
        PORCENTAJE: computadores.length > 0
          ? Math.round((computadoresConMantenimiento / computadores.length) * 100)
          : 0
      };
    });
  }, [anioMantenimientos, sedes, sedesMantenimientos, todosActivos, todosMantenimientos]);

  return (
    <div className="space-y-5">
      {vista !== 'inventario' && <header className="flex flex-col gap-4 rounded-3xl border border-blue-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <span className="rounded-2xl bg-blue-600 p-3 text-white"><Icono className="h-6 w-6" /></span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">{encabezado.etiqueta}</p>
            <h1 className="mt-1 text-2xl font-bold text-[#0b2756]">{encabezado.titulo}</h1>
            <p className="mt-1 text-sm text-slate-500">{encabezado.descripcion}</p>
          </div>
        </div>
        {vista !== 'cronograma' && (
          <button type="button" onClick={abrirNuevo} className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            {vista === 'inventario' ? 'Nuevo activo' : 'Nuevo mantenimiento'}
          </button>
        )}
      </header>}

      {error && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {vista === 'inventario' && (
        <Inventario
          logeo={logeo}
          activos={activos}
          cargando={cargandoInventario}
          totalInventario={totalInventario}
          resumenInventario={resumenInventario}
          paginaInventario={paginaInventario}
          registrosPorPagina={REGISTROS_POR_PAGINA}
          onCambiarPagina={setPaginaInventario}
          onEditarActivo={(activo) => { setActivoEditando(activo); setModalActivoAbierto(true); }}
          onEliminarActivo={eliminarActivo}
          onGuardarActivo={guardarActivo}
          modalActivoAbierto={modalActivoAbierto}
          onCerrarModalActivo={() => setModalActivoAbierto(false)}
          activoEditando={activoEditando}
          areas={areas}
          sedes={sedes}
          idMesa={Number(logeo?.idmesa || logeo?.mesa)}
          onAbrirHojaVida={(activo) => { setActivoHojaVida(activo); setModalHojaVidaAbierto(true); }}
          modalHojaVidaAbierto={modalHojaVidaAbierto}
          onCerrarHojaVida={() => setModalHojaVidaAbierto(false)}
          activoHojaVida={activoHojaVida}
          mantenimientosHojaVida={todosMantenimientos}
          onNuevoActivo={abrirNuevo}
        />
      )}

      {vista === 'mantenimientos' && (
        <Mantenimientos
          mantenimientos={mantenimientos}
          resumenMantenimientos={resumenMantenimientos}
          totalMantenimientos={totalMantenimientos}
          paginaMantenimientos={paginaMantenimientos}
          registrosPorPagina={REGISTROS_POR_PAGINA}
          aniosMantenimientos={aniosMantenimientos}
          anioMantenimientos={anioMantenimientos}
          sedesMantenimientos={resumenSedesVisible}
          sedeMantenimientos={sedeMantenimientos}
          onCambiarAnio={(anio) => {
            setAnioMantenimientos(anio);
            setSedeMantenimientos(null);
            setPaginaMantenimientos(1);
          }}
          onCambiarSede={(sede) => {
            setSedeMantenimientos(sede);
            setPaginaMantenimientos(1);
          }}
          onCambiarPagina={setPaginaMantenimientos}
          onEditarMantenimiento={(item) => { setMantenimientoEditando(item); setModalMantenimientoAbierto(true); }}
          onEliminarMantenimiento={eliminarMantenimiento}
          modalMantenimientoAbierto={modalMantenimientoAbierto}
          onCerrarModalMantenimiento={() => setModalMantenimientoAbierto(false)}
          onGuardarMantenimiento={guardarMantenimiento}
          mantenimientoEditando={mantenimientoEditando}
          activos={todosActivos}
        />
      )}

      {vista === 'cronograma' && (
        <>
          <CronogramaInventarios
            eventos={eventosCronograma}
            cargando={cargandoCronograma}
            mes={periodoCronograma.mes}
            anio={periodoCronograma.anio}
            onCambiarPeriodo={setPeriodoCronograma}
            onEditarMantenimiento={(item) => {
              const mantenimientoCompleto = todosMantenimientos.find(
                (registro) => Number(registro.ID) === Number(item.ID)
              );
              setMantenimientoEditando(mantenimientoCompleto || item);
              setModalMantenimientoAbierto(true);
            }}
          />
          <ModalMantenimiento
            isOpen={modalMantenimientoAbierto}
            onClose={() => setModalMantenimientoAbierto(false)}
            onSave={guardarMantenimiento}
            editItem={mantenimientoEditando}
            activos={todosActivos}
          />
        </>
      )}
    </div>
  );
}
