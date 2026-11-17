import { API_BASE_URL } from '../../config/api.js';
import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, ClipboardList, Plus, Trash2, UserRound, UsersRound } from "lucide-react";
import CronogramaResponsabilidades from "./componentes/CronogramaResponsabilidades";
import ModalResponsabilidad from "./componentes/ModalResponsabilidad";

const API = `${API_BASE_URL}/responsabilidades`;
const fechaCorta = (fecha) => String(fecha || "").slice(0, 10);

const normalizarResponsabilidad = (item) => ({
  id: item.ID,
  titulo: item.DESCRIPCION,
  idArea: item.IDAREA,
  area: item.NOMBREAREA,
  idSoporte: item.IDSOPORTE,
  responsable: item.NOMBRESOPORTE,
  fecha: fechaCorta(item.FECHAINICIO),
  fechaFin: fechaCorta(item.FECHAFIN),
  frecuencia: fechaCorta(item.FECHAINICIO) === fechaCorta(item.FECHAFIN) ? "Una fecha" : `Hasta ${fechaCorta(item.FECHAFIN)}`,
  estado: item.ESTADO === "COMPLETADA" ? "FINALIZADO" : item.ESTADO || "PENDIENTE",
  porcentaje: Number(item.PORCENTAJE) || 0
});

const estilosEstado = {
  PENDIENTE: "border-amber-100 bg-amber-50 text-amber-700",
  "EN PROCESO": "border-blue-100 bg-blue-50 text-blue-700",
  FINALIZADO: "border-emerald-100 bg-emerald-50 text-emerald-700"
};

const opcionesEstado = [
  { valor: "PENDIENTE", etiqueta: "Pendiente" },
  { valor: "EN PROCESO", etiqueta: "En proceso" },
  { valor: "FINALIZADO", etiqueta: "Finalizado" }
];

export default function ResponsabilidadesArea({ logeo }) {
  const [vista, setVista] = useState("pendientes-propios");
  const [responsabilidades, setResponsabilidades] = useState([]);
  const [periodo, setPeriodo] = useState({ mes: new Date().getMonth() + 1, anio: new Date().getFullYear() });
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [procesandoId, setProcesandoId] = useState(null);
  const [error, setError] = useState("");

  const cargarResponsabilidades = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const respuesta = await fetch(API, { headers: { Authorization: `Bearer ${logeo.token}` } });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error || datos.mensaje || "No fue posible cargar las responsabilidades");
      setResponsabilidades(datos.map(normalizarResponsabilidad));
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [logeo.token]);

  useEffect(() => {
    // La carga sincroniza la vista con la sesión y su mesa activa.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarResponsabilidades();
  }, [cargarResponsabilidades]);

  const idSoporteActual = Number(logeo.id);
  const responsabilidadesPropias = useMemo(
    () => responsabilidades.filter((item) => Number(item.idSoporte) === idSoporteActual),
    [idSoporteActual, responsabilidades]
  );
  const pendientesEquipo = useMemo(
    () => responsabilidades.filter((item) => item.estado !== "FINALIZADO"),
    [responsabilidades]
  );
  const pendientesPropios = useMemo(
    () => responsabilidadesPropias.filter((item) => item.estado !== "FINALIZADO"),
    [responsabilidadesPropias]
  );

  const vistas = [
    { id: "pendientes-propios", nombre: "Mis pendientes", detalle: "Asignados a mí", total: pendientesPropios.length, icono: UserRound },
    { id: "pendientes-equipo", nombre: "Pendientes del equipo", detalle: "Soportes de esta mesa", total: pendientesEquipo.length, icono: UsersRound },
    { id: "cronograma-individual", nombre: "Mi cronograma", detalle: "Mi programación", total: responsabilidadesPropias.length, icono: CalendarDays },
    { id: "cronograma-grupo", nombre: "Cronograma del grupo", detalle: "Programación de la mesa", total: responsabilidades.length, icono: ClipboardList }
  ];
  const vistaActual = vistas.find((item) => item.id === vista);
  const esCronograma = vista.startsWith("cronograma-");
  const responsabilidadesVisibles = vista === "pendientes-propios"
    ? pendientesPropios
    : vista === "pendientes-equipo"
      ? pendientesEquipo
      : vista === "cronograma-individual"
        ? responsabilidadesPropias
        : responsabilidades;

  const cambiarEstado = async (id, estado) => {
    setError("");
    setProcesandoId(id);
    try {
      const respuesta = await fetch(`${API}/${id}/estado`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${logeo.token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ESTADO: estado })
      });
      const resultado = await respuesta.json();
      if (!respuesta.ok) throw new Error(resultado.mensaje || "No fue posible cambiar el estado");
      setResponsabilidades((actuales) => actuales.map((item) => item.id === id ? { ...item, estado: resultado.ESTADO, porcentaje: Number(resultado.PORCENTAJE) || 0 } : item));
    } catch (err) {
      setError(`${err.message}. Intenta nuevamente.`);
    } finally {
      setProcesandoId(null);
    }
  };

  const eliminarResponsabilidad = async (item) => {
    if (!window.confirm(`¿Eliminar la responsabilidad "${item.titulo}"? Esta acción no se puede deshacer.`)) return;
    setError("");
    setProcesandoId(item.id);
    try {
      const respuesta = await fetch(`${API}/${item.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${logeo.token}` }
      });
      const resultado = await respuesta.json();
      if (!respuesta.ok) throw new Error(resultado.mensaje || "No fue posible eliminar la responsabilidad");
      setResponsabilidades((actuales) => actuales.filter((responsabilidad) => responsabilidad.id !== item.id));
    } catch (err) {
      setError(`${err.message}. Intenta nuevamente.`);
    } finally {
      setProcesandoId(null);
    }
  };

  const agregarResponsabilidad = async (datos) => {
    const respuesta = await fetch(API, {
      method: "POST",
      headers: { Authorization: `Bearer ${logeo.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        DESCRIPCION: datos.titulo,
        IDAREA: Number(datos.idArea),
        IDSOPORTE: Number(datos.idSoporte),
        FECHAINICIO: datos.fechaInicio,
        FECHAFIN: datos.fechaFin
      })
    });
    const resultado = await respuesta.json();
    if (!respuesta.ok) throw new Error(resultado.mensaje || "No fue posible guardar la responsabilidad");
    await cargarResponsabilidades();
    const [anio, mes] = datos.fechaInicio.split("-").map(Number);
    setPeriodo({ anio, mes });
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <header className="support-hero relative overflow-hidden rounded-[28px] border border-blue-100 p-6 shadow-sm">
        <div className="support-orb support-orb-one" />
        <div className="support-orb support-orb-two" />
        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200"><ClipboardList /></span>
            <div><p className="text-xs font-bold text-blue-600">Mesa de ayuda {logeo.mesa}</p><h1 className="mt-1 text-2xl font-black text-[#0b2756]">Pendientes y cronogramas</h1><p className="mt-1 text-sm text-slate-500">Actividades propias y del equipo vinculado a esta mesa.</p></div>
          </div>
          <button type="button" onClick={() => setModalAbierto(true)} className="support-primary-button"><Plus /><span className="text-sm font-bold">Nueva responsabilidad</span></button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Vistas de pendientes y cronogramas">
        {vistas.map(({ id, nombre, detalle, total, icono: Icono }) => (
          <button key={id} type="button" onClick={() => setVista(id)} aria-pressed={vista === id} className={`group flex min-h-28 items-center gap-4 rounded-2xl p-4 text-left transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${vista === id ? "bg-[#0b5fd3] text-white shadow-lg shadow-blue-200" : "bg-white text-[#0b2756] shadow-sm hover:bg-blue-50"}`}>
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${vista === id ? "bg-white/15" : "bg-blue-50 text-blue-700"}`}><Icono size={20} /></span>
            <span className="min-w-0 flex-1"><strong className="block text-sm">{nombre}</strong><small className={`mt-1 block text-xs ${vista === id ? "text-blue-100" : "text-slate-500"}`}>{detalle}</small></span>
            <span className={`text-3xl font-black ${vista === id ? "text-white" : "text-blue-700"}`}>{total}</span>
          </button>
        ))}
      </section>

      <section className="overflow-hidden rounded-[24px] bg-white shadow-sm">
        <div className="flex items-center justify-between bg-blue-50/60 p-4">
          <div><h2 className="font-black text-[#0b2756]">{vistaActual?.nombre}</h2><p className="text-xs text-slate-500">{vistaActual?.detalle}</p></div>
          <p className="text-xs font-bold text-blue-700">Mesa {logeo.mesa}</p>
        </div>
        {error && <div role="alert" className="m-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {cargando ? <div role="status" aria-live="polite" className="p-8 text-center text-sm text-slate-500">Cargando responsabilidades...</div> : !esCronograma ? (
          <div className="divide-y divide-slate-100">
            {responsabilidadesVisibles.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No hay pendientes en esta vista para la mesa activa.</p>}
            {responsabilidadesVisibles.map((item) => <article key={item.id} className="flex flex-col gap-4 p-5 transition duration-300 hover:bg-blue-50/45 md:flex-row md:items-center">
              <div className="min-w-0 flex-1"><h3 className="font-bold text-slate-800">{item.titulo}</h3><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500"><span className="flex items-center gap-1"><UserRound size={14} /> {item.responsable}</span><span className="flex items-center gap-1"><CalendarDays size={14} /> {item.fecha}{item.fechaFin !== item.fecha ? ` a ${item.fechaFin}` : ""}</span></div></div>
              {(Number(logeo.idrol) === 1 || Number(item.idSoporte) === idSoporteActual) ? <div className="flex flex-wrap items-center gap-2 self-start" aria-busy={procesandoId === item.id}>
                <label className="sr-only" htmlFor={`estado-${item.id}`}>Estado de {item.titulo}</label>
                <select id={`estado-${item.id}`} value={item.estado} disabled={procesandoId !== null} onChange={(evento) => cambiarEstado(item.id, evento.target.value)} className={`h-11 rounded-xl border px-3 text-xs font-black outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-wait disabled:opacity-60 ${estilosEstado[item.estado] || estilosEstado.PENDIENTE}`}>
                  {opcionesEstado.map((opcion) => <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>)}
                </select>
                <button type="button" disabled={procesandoId !== null} onClick={() => eliminarResponsabilidad(item)} className="flex h-11 w-11 items-center justify-center rounded-xl text-rose-600 hover:bg-rose-50 focus:outline-none focus:ring-4 focus:ring-rose-100 disabled:cursor-wait disabled:opacity-50" aria-label={`Eliminar ${item.titulo}`}><Trash2 size={18} /></button>
              </div> : <span className={`self-start rounded-full border px-3 py-1 text-[10px] font-black ${estilosEstado[item.estado] || estilosEstado.PENDIENTE}`}>{item.estado}</span>}
            </article>)}
          </div>
        ) : <CronogramaResponsabilidades responsabilidades={responsabilidadesVisibles} periodo={periodo} onCambiarPeriodo={setPeriodo} titulo={vista === "cronograma-individual" ? "Mi cronograma mensual" : "Cronograma mensual del grupo"} descripcion={vista === "cronograma-individual" ? "Actividades asignadas a tu usuario en esta mesa." : "Actividades de todos los soportes vinculados a esta mesa."} />}
      </section>
      <ModalResponsabilidad abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} onGuardar={agregarResponsabilidad} logeo={logeo} />
    </div>
  );
}
