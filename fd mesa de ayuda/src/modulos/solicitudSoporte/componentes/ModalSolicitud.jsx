import { API_BASE_URL } from '../../../config/api.js';
import {usePrioridades} from '../../configuracion/variables/usePrioridades';
import { useEffect, useMemo, useState } from "react";
import { FaHeadset, FaTimes } from "react-icons/fa";
import { HiOutlineArrowUpTray, HiOutlineCheckCircle, HiOutlineMapPin, HiOutlinePaperAirplane } from "react-icons/hi2";

const campo = "w-full rounded-xl border border-blue-100 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100/70 disabled:cursor-not-allowed disabled:bg-slate-50";

export default function ModalSolicitud({
  modalAbierto,
  setModalAbierto,
  logeo,
  getTickets,
  page,
  getArea,
  areas,
  getSede,
  sedes,
  getIncidentes,
  incidentes
}) {
  const {prioridades, errorPrioridades, cargandoPrioridades} = usePrioridades(logeo.token);
  const [incidente, setIncidente] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [sede, setSede] = useState("");
  const [area, setArea] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getArea();
    getSede();
    getIncidentes();
  }, [getArea, getIncidentes, getSede]);

  const areasDisponibles = useMemo(
    () => areas.filter((item) => Number(item.IDSEDE) === Number(sede)),
    [areas, sede]
  );

  if (!modalAbierto) return null;

  const limpiar = () => {
    setIncidente("");
    setPrioridad("");
    setSede("");
    setArea("");
    setUbicacion("");
    setDescripcion("");
    setArchivo(null);
    setError("");
  };

  const cerrar = () => {
    if (enviando) return;
    setModalAbierto(false);
    setError("");
  };

  const guardarTickets = async () => {
    if (errorPrioridades || cargandoPrioridades) {setError(errorPrioridades || "Espera a que carguen las prioridades.");return;}
    if (!sede || !area || !incidente || !prioridad || !ubicacion.trim() || !descripcion.trim()) {
      setError("Completa sede, área, incidente, prioridad, ubicación y descripción.");
      return;
    }

    const formData = new FormData();
    formData.append("incidente", incidente);
    formData.append("prioridad", prioridad);
    formData.append("sede", sede);
    formData.append("area", area);
    formData.append("ubicacion", ubicacion.trim());
    formData.append("descripcion", descripcion.trim());
    if (archivo) formData.append("archivo", archivo);

    setEnviando(true);
    setError("");
    try {
      const respuesta = await fetch(`${API_BASE_URL}/solicitudes-soporte`, {
        method: "POST",
        headers: { Authorization: `Bearer ${logeo.token}` },
        body: formData
      });
      const datos = await respuesta.json().catch(() => null);
      if (!respuesta.ok) throw new Error(datos?.mensaje || "No fue posible crear el ticket.");

      limpiar();
      setModalAbierto(false);
      await getTickets(page);
    } catch (errorSolicitud) {
      setError(errorSolicitud.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#061c3d]/65 p-4 backdrop-blur-md" onMouseDown={(evento) => evento.target === evento.currentTarget && cerrar()}>
      <section role="dialog" aria-modal="true" aria-labelledby="titulo-solicitud" className="support-modal relative max-h-[94vh] w-full max-w-4xl overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-2xl shadow-blue-950/30">
        <header className="support-modal-header relative overflow-hidden px-6 py-5 text-white md:px-7">
          <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-cyan-300/20 blur-2xl" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-xl backdrop-blur"><FaHeadset /></span>
              <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-100">Nueva solicitud</p><h2 id="titulo-solicitud" className="mt-1 text-xl font-black">Crear ticket de soporte</h2></div>
            </div>
            <button type="button" onClick={cerrar} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 transition hover:rotate-90 hover:bg-white/20" aria-label="Cerrar"><FaTimes /></button>
          </div>
        </header>

        <div className="max-h-[calc(94vh-145px)] overflow-y-auto bg-gradient-to-b from-[#f8fbff] to-white p-5 md:p-7">
          <div className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-blue-100 bg-white/80 p-3 text-xs text-slate-500 shadow-sm">
            <HiOutlineCheckCircle className="text-lg text-emerald-500" />
            <span className="font-bold text-slate-700">Solicitante:</span> {logeo.nombre}
            <span className="hidden text-slate-300 sm:inline">|</span>
            <span>Mesa {logeo.mesa}</span><span>·</span><span>IP {logeo.ip || "no disponible"}</span>
          </div>

          {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-1.5"><span className="text-xs font-bold text-slate-600">Sede *</span><select value={sede} onChange={(e) => { setSede(e.target.value); setArea(""); }} className={campo}><option value="">Selecciona una sede</option>{sedes.map((item) => <option key={item.ID} value={item.ID}>{item.NOMBRE}</option>)}</select></label>
            <label className="space-y-1.5"><span className="text-xs font-bold text-slate-600">Área *</span><select value={area} onChange={(e) => setArea(e.target.value)} disabled={!sede} className={campo}><option value="">{sede ? "Selecciona un área" : "Primero selecciona una sede"}</option>{areasDisponibles.map((item) => <option key={item.ID} value={item.ID}>{item.NOMBRE}</option>)}</select></label>
            <label className="space-y-1.5"><span className="text-xs font-bold text-slate-600">Tipo de incidente *</span><select value={incidente} onChange={(e) => setIncidente(e.target.value)} className={campo}><option value="">Selecciona un incidente</option>{incidentes.map((item) => <option key={item.ID} value={item.ID}>{item.NOMBRE}</option>)}</select></label>
            {errorPrioridades && <p role="alert" className="text-sm text-red-700">{errorPrioridades}</p>}
            <label className="space-y-1.5"><span className="text-xs font-bold text-slate-600">Prioridad *</span><select disabled={cargandoPrioridades || Boolean(errorPrioridades)} value={prioridad} onChange={(e) => setPrioridad(e.target.value)} className={campo}><option value="">Selecciona prioridad</option>{prioridades.map(p => <option key={p.ID} value={p.CODIGO}>{p.NOMBRE}</option>)}</select></label>
            <label className="space-y-1.5 md:col-span-2"><span className="flex items-center gap-1.5 text-xs font-bold text-slate-600"><HiOutlineMapPin className="text-blue-600" /> Ubicación física *</span><input value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} className={campo} placeholder="Ej. Consultorio 203, equipo junto a recepción" /></label>
            <label className="space-y-1.5 md:col-span-2"><span className="text-xs font-bold text-slate-600">Descripción del problema *</span><textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows="4" maxLength="1000" className={`${campo} resize-none`} placeholder="Describe qué sucede, desde cuándo y qué acciones intentaste..." /><span className="block text-right text-[10px] text-slate-400">{descripcion.length}/1000</span></label>

            <label className="group cursor-pointer md:col-span-2">
              <span className="mb-1.5 block text-xs font-bold text-slate-600">Evidencia opcional</span>
              <div className="flex items-center gap-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50/45 p-4 transition group-hover:border-blue-400 group-hover:bg-blue-50">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl text-blue-600 shadow-sm"><HiOutlineArrowUpTray /></span>
                <div className="min-w-0"><p className="truncate text-sm font-bold text-slate-700">{archivo?.name || "Adjuntar captura o fotografía"}</p><p className="mt-1 text-[11px] text-slate-400">PNG, JPG o archivo relacionado con la solicitud</p></div>
              </div>
              <input type="file" accept="image/png,image/jpeg,image/webp,.pdf" onChange={(e) => setArchivo(e.target.files?.[0] || null)} className="sr-only" />
            </label>
          </div>
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-blue-100 bg-white px-5 py-4 md:px-7">
          <button type="button" onClick={cerrar} disabled={enviando} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">Cancelar</button>
          <button type="button" onClick={guardarTickets} disabled={enviando} className="support-primary-button min-w-[170px] disabled:cursor-wait disabled:opacity-60"><HiOutlinePaperAirplane className="text-lg" /><span className="text-sm font-bold">{enviando ? "Enviando..." : "Crear ticket"}</span></button>
        </footer>
      </section>
    </div>
  );
}
