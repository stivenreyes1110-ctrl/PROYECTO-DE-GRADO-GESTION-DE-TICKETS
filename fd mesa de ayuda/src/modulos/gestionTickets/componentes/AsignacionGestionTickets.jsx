import { API_BASE_URL } from '../../../config/api.js';
import { useCallback, useEffect, useState } from "react";
import { HiOutlineInformationCircle, HiOutlineUserPlus, HiOutlineXMark } from "react-icons/hi2";

export default function AsignacionGestionTickets({ abrir, setAbrir, seleccionTicket, getTickets, logeo }) {
  const [usuario, setUsuario] = useState("");
  const [soportes, setSoportes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const consultarSoportes = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const respuesta = await fetch(`${API_BASE_URL}/usuarios/soporte/${logeo.mesa}`, {
        headers: { Authorization: `Bearer ${logeo.token}` }
      });
      if (!respuesta.ok) throw new Error("No fue posible consultar el personal de soporte.");
      const datos = await respuesta.json();
      setSoportes(Array.isArray(datos) ? datos : []);
    } catch (errorConsulta) {
      setError(errorConsulta.message);
    } finally {
      setCargando(false);
    }
  }, [logeo.mesa, logeo.token]);

  useEffect(() => {
    if (abrir) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      consultarSoportes();
    }
  }, [abrir, consultarSoportes]);

  if (!abrir) return null;

  const guardarAsignacion = async () => {
    if (!usuario) return;
    setGuardando(true);
    setError("");
    try {
      const respuesta = await fetch(`${API_BASE_URL}/tickets/${seleccionTicket}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${logeo.token}`
        },
        body: JSON.stringify({ usuario_id: usuario })
      });
      if (!respuesta.ok) throw new Error("No fue posible asignar el ticket.");
      await getTickets();
      setUsuario("");
      setAbrir(false);
    } catch (errorAsignacion) {
      setError(errorAsignacion.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#061c3d]/70 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="titulo-asignacion-gestion">
      <section className="w-full max-w-xl overflow-hidden rounded-[30px] border border-white/60 bg-white shadow-2xl shadow-blue-950/40">
        <header className="support-modal-header relative overflow-hidden px-7 py-7">
          <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-cyan-300/20 blur-2xl" />
          <div className="relative flex items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-2xl text-white"><HiOutlineUserPlus /></span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">Ticket #{seleccionTicket}</p>
                <h2 id="titulo-asignacion-gestion" className="mt-1 text-2xl font-black text-white">Asignar responsable</h2>
                <p className="mt-1 text-xs text-blue-100">Selecciona quién atenderá esta solicitud.</p>
              </div>
            </div>
            <button type="button" onClick={() => setAbrir(false)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl text-white transition hover:bg-white/20" aria-label="Cerrar"><HiOutlineXMark /></button>
          </div>
        </header>

        <div className="space-y-5 bg-[#f7faff] p-7">
          <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
            <label htmlFor="soporte-gestion" className="text-xs font-black uppercase tracking-wider text-slate-500">Personal disponible</label>
            <select id="soporte-gestion" value={usuario} onChange={(e) => setUsuario(e.target.value)} disabled={cargando} className="mt-3 h-12 w-full rounded-xl border border-blue-100 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100">
              <option value="">{cargando ? "Consultando personal..." : "Selecciona un responsable"}</option>
              {soportes.map((soporte) => <option key={soporte.ID} value={soporte.IDSOPORTE}>{soporte.NOMBRE}</option>)}
            </select>
            <div className="mt-5 flex gap-3 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4">
              <HiOutlineInformationCircle className="mt-0.5 shrink-0 text-xl text-cyan-700" />
              <p className="text-xs leading-5 text-cyan-900">El ticket aparecerá automáticamente en la bandeja del soporte seleccionado.</p>
            </div>
          </div>
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-blue-100 bg-white px-7 py-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => setAbrir(false)} disabled={guardando} className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Cancelar</button>
          <button type="button" onClick={guardarAsignacion} disabled={!usuario || guardando} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40">{guardando ? "Asignando..." : "Confirmar asignación"}</button>
        </footer>
      </section>
    </div>
  );
}
