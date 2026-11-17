import { API_BASE_URL } from '../../../config/api.js';
import { useEffect, useState } from "react";
import { ClipboardList, X } from "lucide-react";

const campo = "w-full rounded-xl border border-blue-100 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100/70 disabled:bg-slate-50";
const formularioInicial = { titulo: "", idArea: "", idSoporte: "", fechaInicio: "", fechaFin: "" };

export default function ModalResponsabilidad({ abierto, onCerrar, onGuardar, logeo }) {
  const [areas, setAreas] = useState([]);
  const [soportes, setSoportes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [formulario, setFormulario] = useState(formularioInicial);

  useEffect(() => {
    if (!abierto) return;
    const cargarOpciones = async () => {
      setCargando(true); setError("");
      try {
        const headers = { Authorization: `Bearer ${logeo.token}` };
        const [respuestaAreas, respuestaSoportes] = await Promise.all([
          fetch(`${API_BASE_URL}/areas`, { headers }),
          fetch(`${API_BASE_URL}/usuarios/soporte/${logeo.mesa}`, { headers })
        ]);
        if (!respuestaAreas.ok || !respuestaSoportes.ok) throw new Error("No fue posible cargar áreas y responsables");
        setAreas(await respuestaAreas.json());
        setSoportes(await respuestaSoportes.json());
      } catch (err) { setError(err.message); }
      finally { setCargando(false); }
    };
    cargarOpciones();
  }, [abierto, logeo.mesa, logeo.token]);

  if (!abierto) return null;
  const cambiar = (nombre, valor) => setFormulario((actual) => ({ ...actual, [nombre]: valor }));
  const guardar = async () => {
    if (!formulario.titulo.trim() || !formulario.idArea || !formulario.idSoporte || !formulario.fechaInicio || !formulario.fechaFin) {
      setError("Descripción, área, responsable y fechas son obligatorios."); return;
    }
    if (formulario.fechaFin < formulario.fechaInicio) {
      setError("La fecha final no puede ser anterior a la fecha inicial."); return;
    }
    setGuardando(true); setError("");
    try {
      await onGuardar({ ...formulario, titulo: formulario.titulo.trim() });
      setFormulario(formularioInicial);
      onCerrar();
    } catch (err) { setError(err.message); }
    finally { setGuardando(false); }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#061c3d]/65 p-4 backdrop-blur-md">
    <section className="support-modal w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-2xl">
      <header className="support-modal-header flex items-center justify-between px-6 py-5 text-white"><div className="flex items-center gap-3"><ClipboardList /><div><p className="text-[10px] uppercase tracking-widest text-blue-100">Mesa {logeo.mesa}</p><h2 className="text-xl font-black">Nueva responsabilidad</h2></div></div><button type="button" onClick={onCerrar} className="rounded-xl bg-white/10 p-3 hover:bg-white/20"><X size={18} /></button></header>
      <div className="grid grid-cols-1 gap-4 bg-[#f8fbff] p-6 md:grid-cols-2">
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 md:col-span-2">{error}</div>}
        <label className="space-y-1.5 md:col-span-2"><span className="text-xs font-bold text-slate-600">Descripción *</span><textarea rows="3" maxLength="500" className={campo} value={formulario.titulo} onChange={(e) => cambiar("titulo", e.target.value)} placeholder="Describe la responsabilidad" /></label>
        <label className="space-y-1.5"><span className="text-xs font-bold text-slate-600">Área de acceso *</span><select className={campo} disabled={cargando} value={formulario.idArea} onChange={(e) => cambiar("idArea", e.target.value)}><option value="">Selecciona un área</option>{areas.map((item) => <option key={item.ID} value={item.ID}>{item.NOMBRE}</option>)}</select></label>
        <label className="space-y-1.5"><span className="text-xs font-bold text-slate-600">Soporte responsable *</span><select className={campo} disabled={cargando} value={formulario.idSoporte} onChange={(e) => cambiar("idSoporte", e.target.value)}><option value="">{cargando ? "Cargando responsables..." : "Selecciona un responsable"}</option>{soportes.map((item) => <option key={item.IDSOPORTE} value={item.IDSOPORTE}>{item.NOMBRE}{Number(item.IDROL_MESA) === 1 ? " · Administrador" : ""}</option>)}</select><span className="text-[10px] text-slate-400">Usuarios activos con rol Administrador o Soporte en esta mesa.</span></label>
        <label className="space-y-1.5"><span className="text-xs font-bold text-slate-600">Fecha inicial *</span><input type="date" className={campo} value={formulario.fechaInicio} onChange={(e) => cambiar("fechaInicio", e.target.value)} /></label>
        <label className="space-y-1.5"><span className="text-xs font-bold text-slate-600">Fecha final *</span><input type="date" min={formulario.fechaInicio} className={campo} value={formulario.fechaFin} onChange={(e) => cambiar("fechaFin", e.target.value)} /></label>
      </div>
      <footer className="flex justify-end gap-3 border-t border-blue-100 p-4"><button type="button" onClick={onCerrar} className="rounded-xl border px-5 py-2.5 text-sm font-bold">Cancelar</button><button type="button" onClick={guardar} disabled={cargando || guardando} className="support-primary-button text-sm font-bold disabled:opacity-50">{guardando ? "Guardando..." : "Guardar responsabilidad"}</button></footer>
    </section>
  </div>;
}
