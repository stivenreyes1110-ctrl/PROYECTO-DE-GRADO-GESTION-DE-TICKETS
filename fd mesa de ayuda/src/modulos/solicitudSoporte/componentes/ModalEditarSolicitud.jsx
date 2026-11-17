import {usePrioridades} from '../../configuracion/variables/usePrioridades';
import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { HiOutlinePencilSquare } from "react-icons/hi2";

const campo = "w-full rounded-xl border border-blue-100 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100/70";

export default function ModalEditarSolicitud({ ticket, onClose, onGuardar, areas, sedes, incidentes, logeo }) {
  const {prioridades, errorPrioridades, cargandoPrioridades} = usePrioridades(logeo.token);
  const [formulario, setFormulario] = useState(() => ({
    sede: String(ticket.IDSEDE || ""), area: String(ticket.IDAREA || ""),
    incidente: String(ticket.IDINCIDENTE || ""), prioridad: ticket.PRIORIDAD || "",
    ubicacion: ticket.UBICACIONFISICA || "", descripcion: ticket.DESCRIPCION || ""
  }));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const areasDisponibles = areas.filter((item) => Number(item.IDSEDE) === Number(formulario.sede));
  const cambiar = (nombre, valor) => setFormulario((actual) => ({ ...actual, [nombre]: valor }));

  const enviar = async () => {
    if (errorPrioridades || cargandoPrioridades) {setError(errorPrioridades || "Espera a que carguen las prioridades.");return;}
    if (Object.values(formulario).some((valor) => !String(valor).trim())) {
      setError("Completa todos los campos."); return;
    }
    setGuardando(true); setError("");
    try { await onGuardar(ticket.ID_TICKET, formulario); }
    catch (err) { setError(err.message); }
    finally { setGuardando(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#061c3d]/65 p-4 backdrop-blur-md">
      <section className="support-modal w-full max-w-3xl overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-2xl">
        <header className="support-modal-header flex items-center justify-between px-6 py-5 text-white">
          <div className="flex items-center gap-3"><HiOutlinePencilSquare className="text-2xl" /><div><p className="text-[10px] uppercase tracking-widest text-blue-100">Ticket #{ticket.ID_TICKET}</p><h2 className="text-xl font-black">Editar solicitud</h2></div></div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20"><FaTimes /></button>
        </header>
        <div className="grid max-h-[70vh] grid-cols-1 gap-4 overflow-y-auto bg-[#f8fbff] p-6 md:grid-cols-2">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 md:col-span-2">{error}</div>}
          <label className="space-y-1"><span className="text-xs font-bold">Sede</span><select className={campo} value={formulario.sede} onChange={(e) => { cambiar("sede", e.target.value); cambiar("area", ""); }}><option value="">Selecciona</option>{sedes.map((x) => <option key={x.ID} value={x.ID}>{x.NOMBRE}</option>)}</select></label>
          <label className="space-y-1"><span className="text-xs font-bold">Área</span><select className={campo} value={formulario.area} onChange={(e) => cambiar("area", e.target.value)}><option value="">Selecciona</option>{areasDisponibles.map((x) => <option key={x.ID} value={x.ID}>{x.NOMBRE}</option>)}</select></label>
          <label className="space-y-1"><span className="text-xs font-bold">Incidente</span><select className={campo} value={formulario.incidente} onChange={(e) => cambiar("incidente", e.target.value)}><option value="">Selecciona</option>{incidentes.map((x) => <option key={x.ID} value={x.ID}>{x.NOMBRE}</option>)}</select></label>
          <label className="space-y-1"><span className="text-xs font-bold">Prioridad</span><select disabled={cargandoPrioridades || Boolean(errorPrioridades)} className={campo} value={formulario.prioridad} onChange={(e) => cambiar("prioridad", e.target.value)}>{prioridades.map(p => <option key={p.ID} value={p.CODIGO}>{p.NOMBRE}</option>)}</select></label>
          <label className="space-y-1 md:col-span-2"><span className="text-xs font-bold">Ubicación</span><input className={campo} value={formulario.ubicacion} onChange={(e) => cambiar("ubicacion", e.target.value)} /></label>
          <label className="space-y-1 md:col-span-2"><span className="text-xs font-bold">Descripción</span><textarea rows="4" className={`${campo} resize-none`} value={formulario.descripcion} onChange={(e) => cambiar("descripcion", e.target.value)} /></label>
        </div>
        <footer className="flex justify-end gap-3 border-t border-blue-100 p-4"><button type="button" onClick={onClose} className="rounded-xl border px-5 py-2.5 text-sm font-bold">Cancelar</button><button type="button" disabled={guardando} onClick={enviar} className="support-primary-button min-w-[150px] text-sm font-bold">{guardando ? "Guardando..." : "Guardar cambios"}</button></footer>
      </section>
    </div>
  );
}
