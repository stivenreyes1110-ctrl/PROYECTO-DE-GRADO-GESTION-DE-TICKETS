import { API_BASE_URL } from '../../../config/api.js';
import { useState } from "react";
import { HiOutlineDocumentPlus, HiOutlineXMark } from "react-icons/hi2";

const campoClase = "mt-2 h-12 w-full rounded-xl border border-blue-100 bg-slate-50/80 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100";

export default function ModalGestionTickets({ modalAbierto, setModalAbierto }) {
  const [formulario, setFormulario] = useState({
    incidente: "",
    prioridad: "",
    sede: "",
    area: "",
    ubicacion: "",
    descripcion: ""
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  if (!modalAbierto) return null;

  const actualizarCampo = (campo, valor) => {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  };

  const cerrar = () => {
    if (!guardando) setModalAbierto(false);
  };

  const guardarTicket = async (evento) => {
    evento.preventDefault();
    setGuardando(true);
    setError("");
    try {
      const respuesta = await fetch(`${API_BASE_URL}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formulario)
      });
      if (!respuesta.ok) throw new Error("No fue posible crear el ticket.");
      setModalAbierto(false);
    } catch (errorGuardado) {
      setError(errorGuardado.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#061c3d]/65 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="titulo-modal-gestion">
      <form onSubmit={guardarTicket} className="support-modal max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-2xl shadow-blue-950/30">
        <header className="support-modal-header flex items-center justify-between px-6 py-5 text-white md:px-8">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl"><HiOutlineDocumentPlus /></span>
            <div>
              <h2 id="titulo-modal-gestion" className="text-xl font-black">Crear ticket</h2>
              <p className="mt-1 text-xs text-blue-100">Registra una nueva solicitud para la mesa.</p>
            </div>
          </div>
          <button type="button" onClick={cerrar} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl transition hover:bg-white/20" aria-label="Cerrar"><HiOutlineXMark /></button>
        </header>

        <div className="max-h-[65vh] overflow-y-auto bg-[#f8fbff] p-6 md:p-8">
          <div className="grid grid-cols-1 gap-5 rounded-3xl border border-blue-100 bg-white p-5 shadow-sm md:grid-cols-2">
            <label className="text-xs font-bold text-slate-600">Incidente<input required value={formulario.incidente} onChange={(e) => actualizarCampo("incidente", e.target.value)} className={campoClase} placeholder="Tipo de incidente" /></label>
            <label className="text-xs font-bold text-slate-600">Prioridad<input required value={formulario.prioridad} onChange={(e) => actualizarCampo("prioridad", e.target.value)} className={campoClase} placeholder="Prioridad" /></label>
            <label className="text-xs font-bold text-slate-600">Sede<input required value={formulario.sede} onChange={(e) => actualizarCampo("sede", e.target.value)} className={campoClase} placeholder="Sede" /></label>
            <label className="text-xs font-bold text-slate-600">Área<input required value={formulario.area} onChange={(e) => actualizarCampo("area", e.target.value)} className={campoClase} placeholder="Área" /></label>
            <label className="text-xs font-bold text-slate-600 md:col-span-2">Ubicación<input value={formulario.ubicacion} onChange={(e) => actualizarCampo("ubicacion", e.target.value)} className={campoClase} placeholder="Ubicación específica" /></label>
            <label className="text-xs font-bold text-slate-600 md:col-span-2">Descripción<textarea required value={formulario.descripcion} onChange={(e) => actualizarCampo("descripcion", e.target.value)} className={`${campoClase} h-28 resize-none py-3`} placeholder="Describe claramente la solicitud" /></label>
          </div>
          {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-blue-100 bg-white px-6 py-5 sm:flex-row sm:justify-end md:px-8">
          <button type="button" onClick={cerrar} disabled={guardando} className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">Cancelar</button>
          <button type="submit" disabled={guardando} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60">{guardando ? "Guardando..." : "Guardar ticket"}</button>
        </footer>
      </form>
    </div>
  );
}
