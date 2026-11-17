import { API_BASE_URL } from '../../config/api.js';
import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Search, UserCog, UserRound, UsersRound } from "lucide-react";



export default function AjustesRol({ logeo, compacto = false }) {
  const [usuarios, setUsuarios] = useState([]);
  const [idSeleccionado, setIdSeleccionado] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [procesandoId, setProcesandoId] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargarUsuarios = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const respuesta = await fetch(`${API_BASE_URL}/usuarios/roles`, { headers: { Authorization: `Bearer ${logeo.token}` } });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error || "No fue posible consultar los usuarios");
      setUsuarios(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [logeo.token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarUsuarios();
  }, [cargarUsuarios]);

  const usuariosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return usuarios;
    return usuarios.filter((item) => `${item.NOMBRE} ${item.USUARIO}`.toLowerCase().includes(texto));
  }, [busqueda, usuarios]);
  const seleccionado = usuarios.find((item) => String(item.IDUSUARIO) === idSeleccionado);
  const equipoMesa = usuarios.filter((item) => [1, 2].includes(Number(item.IDROL)));

  const actualizarRol = async (usuario, idRol) => {
    const rol = Number(idRol);
    if (Number(usuario.IDUSUARIO) === Number(logeo.id_usuario)) {
      setError("No puedes cambiar tu propio rol.");
      return;
    }
    if (![1, 2].includes(rol)) {
      setError("Temporalmente sólo se permiten los roles Administrador y Soporte.");
      return;
    }
    if (!window.confirm(`¿Cambiar el rol de ${usuario.NOMBRE} a ${rol === 1 ? "Administrador" : "Soporte"} en la mesa ${logeo.mesa}?`)) return;
    setProcesandoId(usuario.IDUSUARIO);
    setError("");
    setMensaje("");
    try {
      const respuesta = await fetch(`${API_BASE_URL}/usuarios/${usuario.IDUSUARIO}/rol`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${logeo.token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ IDROL: rol })
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error || "No fue posible actualizar el rol");
      setUsuarios((actuales) => actuales.map((item) => item.IDUSUARIO === usuario.IDUSUARIO ? datos.usuario : item));
      setMensaje(`Rol de ${datos.usuario.NOMBRE} actualizado a ${datos.usuario.ROL}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesandoId(null);
    }
  };

  return <div className="space-y-5" aria-busy={cargando || procesandoId !== null}>
    {!compacto && <header className="support-hero rounded-[28px] p-6 shadow-sm">
      <div className="flex items-start gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white"><UserCog /></span><div><p className="text-xs font-bold text-blue-700">Administración · Mesa {logeo.mesa}</p><h1 className="mt-1 text-2xl font-black text-[#0b2756]">Gestión de usuarios</h1><p className="mt-1 max-w-2xl text-sm text-blue-950/70">Consulta usuarios activos del sistema, revisa su rol y habilítalos como soporte únicamente en la mesa actual.</p></div></div>
    </header>}

    <section className="grid overflow-hidden rounded-2xl bg-white shadow-sm lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.35fr)]">
      <div className="border-b border-blue-100 bg-blue-50/60 p-5 lg:border-b-0 lg:border-r">
        <label htmlFor="buscar-usuario" className="text-sm font-bold text-[#0b2756]">Buscar usuario</label>
        <div className="mt-2 flex items-center gap-2 rounded-xl bg-white px-3 ring-1 ring-blue-100 focus-within:ring-4 focus-within:ring-blue-100"><Search className="text-blue-600" size={18} /><input id="buscar-usuario" value={busqueda} onChange={(evento) => { setBusqueda(evento.target.value); setIdSeleccionado(""); setMensaje(""); }} className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Nombre o usuario" /></div>
        <label htmlFor="usuario-rol" className="mt-5 block text-sm font-bold text-[#0b2756]">Seleccionar usuario</label>
        <select id="usuario-rol" disabled={cargando} value={idSeleccionado} onChange={(evento) => { setIdSeleccionado(evento.target.value); setMensaje(""); }} className="mt-2 h-12 w-full rounded-xl border border-blue-200 bg-white px-3 text-sm outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-60">
          <option value="">{cargando ? "Cargando usuarios..." : "Selecciona un usuario"}</option>
          {usuariosFiltrados.map((item) => <option key={item.IDUSUARIO} value={item.IDUSUARIO}>{item.NOMBRE} · {item.USUARIO}</option>)}
        </select>
        {!cargando && usuariosFiltrados.length === 0 && <p className="mt-3 text-sm text-blue-800">No hay usuarios que coincidan con la búsqueda.</p>}
      </div>

      <div className="min-h-80 p-6" aria-live="polite">
        {error && <div role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error} <button type="button" onClick={cargarUsuarios} className="ml-2 font-bold underline">Reintentar</button></div>}
        {mensaje && <div role="status" className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800"><CheckCircle2 size={18} />{mensaje}</div>}
        {!seleccionado ? <div className="flex min-h-64 flex-col items-center justify-center text-center"><UserRound className="text-blue-200" size={52} /><h2 className="mt-4 font-black text-[#0b2756]">Selecciona un usuario</h2><p className="mt-1 text-sm text-slate-500">Aquí aparecerán sus datos y el rol que tiene en esta mesa.</p></div> : <div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm text-blue-700">Usuario seleccionado</p><h2 className="mt-1 text-2xl font-black text-[#0b2756]">{seleccionado.NOMBRE}</h2><p className="mt-1 text-sm text-blue-950/70">@{seleccionado.USUARIO}</p></div><span className={`self-start rounded-full px-3 py-1.5 text-xs font-black ${Number(seleccionado.IDROL) === 1 ? "bg-[#0b2756] text-white" : Number(seleccionado.IDROL) === 2 ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-700"}`}>{seleccionado.ROL}</span></div>
          <dl className="mt-6 grid gap-px overflow-hidden rounded-xl bg-blue-100 sm:grid-cols-2"><div className="bg-white p-4"><dt className="text-xs font-bold text-slate-500">Estado</dt><dd className="mt-1 font-bold text-[#0b2756]">{seleccionado.ESTADO ? "Activo" : "Inactivo"}</dd></div><div className="bg-white p-4"><dt className="text-xs font-bold text-slate-500">Mesa activa</dt><dd className="mt-1 font-bold text-[#0b2756]">{logeo.mesa}</dd></div><div className="bg-white p-4"><dt className="text-xs font-bold text-slate-500">Rol en esta mesa</dt><dd className="mt-1 font-bold text-[#0b2756]">{seleccionado.ROL}</dd></div><div className="bg-white p-4"><dt className="text-xs font-bold text-slate-500">ID de usuario</dt><dd className="mt-1 font-bold text-[#0b2756]">{seleccionado.IDUSUARIO}</dd></div></dl>
          <div className="mt-6 flex flex-col gap-3 border-t border-blue-100 pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="max-w-md text-xs text-slate-500">El rol se aplicará solamente a la mesa {logeo.mesa}. Temporalmente no se permite retirar el acceso de soporte.</p><label className="text-xs font-bold text-[#0b2756]">Asignar tipo de rol<select value={seleccionado.IDROL} disabled={procesandoId !== null || Number(seleccionado.IDUSUARIO) === Number(logeo.id_usuario)} onChange={(evento) => actualizarRol(seleccionado, evento.target.value)} className="mt-1 block h-11 rounded-xl border border-blue-200 bg-white px-3 text-sm outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50"><option value="3" disabled>Usuario</option><option value="2">Soporte</option><option value="1">Administrador</option></select></label></div>
        </div>}
      </div>
    </section>

    <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="flex items-center justify-between bg-blue-50/70 p-5"><div><h2 className="flex items-center gap-2 font-black text-[#0b2756]"><UsersRound size={20} />Equipo de soporte</h2><p className="mt-1 text-xs text-blue-800">Administradores y soportes activos en la mesa {logeo.mesa}</p></div><span className="text-2xl font-black text-blue-700">{equipoMesa.length}</span></div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-[#0b2756] text-white"><tr><th className="px-5 py-3">Nombre</th><th className="px-5 py-3">Usuario</th><th className="px-5 py-3">Rol actual</th><th className="px-5 py-3">Estado</th><th className="px-5 py-3">Asignar rol</th></tr></thead>
          <tbody className="divide-y divide-blue-50">{equipoMesa.map((item) => <tr key={item.IDUSUARIO} className="hover:bg-blue-50/50"><td className="px-5 py-4 font-bold text-[#0b2756]">{item.NOMBRE}</td><td className="px-5 py-4 text-slate-600">@{item.USUARIO}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-black ${Number(item.IDROL) === 1 ? "bg-[#0b2756] text-white" : "bg-blue-100 text-blue-800"}`}>{item.ROL}</span></td><td className="px-5 py-4 text-emerald-700">Activo</td><td className="px-5 py-4"><label className="sr-only" htmlFor={`rol-equipo-${item.IDUSUARIO}`}>Rol de {item.NOMBRE}</label><select id={`rol-equipo-${item.IDUSUARIO}`} value={item.IDROL} disabled={procesandoId !== null || Number(item.IDUSUARIO) === Number(logeo.id_usuario)} onChange={(evento) => actualizarRol(item, evento.target.value)} className="h-10 rounded-xl border border-blue-200 bg-white px-3 text-sm outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50"><option value="2">Soporte</option><option value="1">Administrador</option></select></td></tr>)}</tbody>
        </table>
        {equipoMesa.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No hay usuarios de soporte vinculados a esta mesa.</p>}
      </div>
    </section>
  </div>;
}
