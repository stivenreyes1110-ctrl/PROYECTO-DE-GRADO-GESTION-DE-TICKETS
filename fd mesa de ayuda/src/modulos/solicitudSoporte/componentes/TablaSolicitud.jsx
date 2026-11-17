import { useEffect, useMemo, useRef, useState } from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlinePencilSquare, HiOutlineTrash } from "react-icons/hi2";
import { TiMinus } from "react-icons/ti";

const filtrosIniciales = { ticket: "", dependencia: "", solicitud: "", prioridad: "", estado: "", registro: "", tiempo: "", respuesta: "", responsables: "" };
const texto = (...valores) => valores.filter((valor) => valor !== null && valor !== undefined).join(" ").toLocaleLowerCase("es");

const calcularTiempo = (ticket) => {
  const inicio = new Date(ticket.HORAREGISTRO);
  const fin = ticket.HORACIERRE ? new Date(ticket.HORACIERRE) : new Date();
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) return { texto: "Sin dato", clase: "bg-slate-100 text-slate-600" };
  const minutosTotales = Math.max(0, Math.floor((fin.getTime() - inicio.getTime()) / 60000));
  const dias = Math.floor(minutosTotales / 1440);
  const horas = Math.floor((minutosTotales % 1440) / 60);
  const minutos = minutosTotales % 60;
  const tiempo = dias > 0 ? `${dias}d ${horas}h` : horas > 0 ? `${horas}h ${minutos}m` : `${minutos}m`;
  const clase = minutosTotales > 55 ? "bg-red-50 text-red-700" : minutosTotales > 30 ? "bg-orange-50 text-orange-700" : minutosTotales > 20 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700";
  return { texto: tiempo, clase };
};

const formatearFecha = (fecha) => {
  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return fecha || "—";
  return valor.toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

export default function TablaSolicitud({ getTickets, page, setPage, tickets = [], paginacion = {}, filtroTickets, setFiltroTickets, onEditar, onEliminar }) {
  const [filtrosColumnas, setFiltrosColumnas] = useState(filtrosIniciales);
  const cambioFiltroColumna = useRef(false);

  useEffect(() => {
    if (!cambioFiltroColumna.current) {
      getTickets(page, filtroTickets, filtrosColumnas);
      return undefined;
    }

    cambioFiltroColumna.current = false;
    const temporizador = setTimeout(() => {
      getTickets(page, filtroTickets, filtrosColumnas);
    }, 350);
    return () => clearTimeout(temporizador);
  }, [filtroTickets, filtrosColumnas, getTickets, page]);

  const ticketsFiltrados = useMemo(() => {
    const terminos = Object.fromEntries(Object.entries(filtrosColumnas).map(([clave, valor]) => [clave, valor.trim().toLocaleLowerCase("es")]));
    return tickets.filter((ticket) => {
      const tiempo = calcularTiempo(ticket).texto;
      return (!terminos.ticket || texto(ticket.ID_TICKET, ticket.DIRIP).includes(terminos.ticket))
        && (!terminos.dependencia || texto(ticket.AREA, ticket.SEDE).includes(terminos.dependencia))
        && (!terminos.solicitud || texto(ticket.DESCRIPCION, ticket.INCIDENTE).includes(terminos.solicitud))
        && (!terminos.prioridad || texto(ticket.PRIORIDAD).includes(terminos.prioridad))
        && (!terminos.estado || texto(ticket.ESTADO).includes(terminos.estado))
        && (!terminos.registro || texto(formatearFecha(ticket.HORAREGISTRO), ticket.HORAREGISTRO).includes(terminos.registro))
        && (!terminos.tiempo || texto(tiempo).includes(terminos.tiempo))
        && (!terminos.respuesta || texto(ticket.CONTESTACION).includes(terminos.respuesta))
        && (!terminos.responsables || texto(ticket.USUARIO_SOLICITANTE, ticket.USUARIO_ASIGNADO).includes(terminos.responsables));
    });
  }, [filtrosColumnas, tickets]);

  const cambiarFiltroColumna = (columna, valor) => {
    cambioFiltroColumna.current = true;
    setFiltrosColumnas((actuales) => ({ ...actuales, [columna]: valor }));
    setPage(1);
  };
  const hayFiltrosColumnas = Object.values(filtrosColumnas).some((valor) => valor.trim());
  const inputFiltro = (columna, placeholder) => <input type="search" value={filtrosColumnas[columna]} onChange={(evento) => cambiarFiltroColumna(columna, evento.target.value)} placeholder={placeholder} aria-label={`Filtrar por ${placeholder}`} className="h-7 w-full rounded-lg border border-blue-100 bg-white px-2 text-[10px] font-medium normal-case tracking-normal text-slate-700 outline-none placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />;

  const cambiarFiltroEstado = (estado) => {
    cambioFiltroColumna.current = false;
    setFiltroTickets(estado);
    setPage(1);
  };
  const filtrosEstado = [
    { id: "1", nombre: "Pendientes", activo: "bg-blue-600 text-white", normal: "bg-blue-50 text-blue-700" },
    { id: "2", nombre: "En proceso", activo: "bg-cyan-600 text-white", normal: "bg-cyan-50 text-cyan-700" },
    { id: "3", nombre: "Solucionados", activo: "bg-emerald-600 text-white", normal: "bg-emerald-50 text-emerald-700" },
    { id: "4", nombre: "Todos", activo: "bg-violet-600 text-white", normal: "bg-violet-50 text-violet-700" }
  ];

  return <section className="support-animated-table overflow-hidden rounded-[24px] border border-blue-100 bg-white shadow-sm">
    <header className="border-b border-blue-100 bg-gradient-to-r from-white to-blue-50/60 px-4 py-4 lg:px-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div><h3 className="text-lg font-black text-[#0b2756]">Tickets registrados</h3><p className="mt-0.5 text-xs text-slate-500">{paginacion.total || 0} solicitudes encontradas · usa los campos de cada columna para buscar.</p></div>
        <div className="flex flex-wrap items-center gap-2">
          {filtrosEstado.map((filtro) => <button key={filtro.id} type="button" onClick={() => cambiarFiltroEstado(filtro.id)} className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${filtroTickets === filtro.id ? filtro.activo : filtro.normal}`}><TiMinus /> {filtro.nombre}</button>)}
          <div className="ml-1 flex items-center overflow-hidden rounded-xl border border-blue-100 bg-white"><button type="button" onClick={() => { cambioFiltroColumna.current = false; setPage(Math.max(1, page - 1)); }} disabled={page <= 1} className="flex h-9 w-9 items-center justify-center text-blue-700 hover:bg-blue-50 disabled:opacity-30" aria-label="Página anterior"><HiOutlineChevronLeft /></button><span className="border-x border-blue-100 px-3 text-xs font-bold text-slate-600">{page} / {Math.max(1, paginacion.totalPaginas || 0)}</span><button type="button" onClick={() => { cambioFiltroColumna.current = false; setPage(page + 1); }} disabled={page >= (paginacion.totalPaginas || 0)} className="flex h-9 w-9 items-center justify-center text-blue-700 hover:bg-blue-50 disabled:opacity-30" aria-label="Página siguiente"><HiOutlineChevronRight /></button></div>
        </div>
      </div>
    </header>

    <div className="max-h-[58vh] overflow-auto">
      <table className="w-full min-w-[1140px] table-fixed text-left text-xs uppercase">
        <thead className="sticky top-0 z-20 border-b border-blue-100 bg-[#f6faff] text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <tr><th className="w-[82px] px-3 py-3">Ticket</th><th className="w-[125px] px-3 py-3">Dependencia</th><th className="w-[240px] px-3 py-3">Solicitud</th><th className="w-[92px] px-3 py-3 text-center">Prioridad</th><th className="w-[105px] px-3 py-3 text-center">Estado</th><th className="w-[112px] px-3 py-3">Registro</th><th className="w-[80px] px-3 py-3 text-center">Tiempo</th><th className="w-[210px] px-3 py-3">Respuesta</th><th className="w-[145px] px-3 py-3">Responsables</th><th className="w-[78px] px-3 py-3 text-center">Acciones</th></tr>
          <tr className="border-t border-blue-100 bg-white/95"><th className="px-2 py-2">{inputFiltro("ticket", "ID o IP")}</th><th className="px-2 py-2">{inputFiltro("dependencia", "Área o sede")}</th><th className="px-2 py-2">{inputFiltro("solicitud", "Descripción")}</th><th className="px-2 py-2">{inputFiltro("prioridad", "Prioridad")}</th><th className="px-2 py-2">{inputFiltro("estado", "Estado")}</th><th className="px-2 py-2">{inputFiltro("registro", "Fecha")}</th><th className="px-2 py-2">{inputFiltro("tiempo", "Tiempo")}</th><th className="px-2 py-2">{inputFiltro("respuesta", "Respuesta")}</th><th className="px-2 py-2">{inputFiltro("responsables", "Nombre")}</th><th className="px-2 py-2 text-center">{hayFiltrosColumnas && <button type="button" onClick={() => setFiltrosColumnas(filtrosIniciales)} className="rounded-lg bg-red-50 px-2 py-1.5 text-[9px] font-bold normal-case text-red-600 hover:bg-red-100">Limpiar</button>}</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {ticketsFiltrados.map((ticket) => {
            const tiempo = calcularTiempo(ticket);
            const prioridad = ticket.PRIORIDAD === "ALTA" ? "bg-red-50 text-red-700" : ticket.PRIORIDAD === "MEDIA" ? "bg-orange-50 text-orange-700" : "bg-emerald-50 text-emerald-700";
            const estado = ticket.ESTADO === "EN PROCESO" ? "bg-cyan-50 text-cyan-700" : ticket.ESTADO === "SOLUCIONADO" || ticket.ESTADO === "CERRADO" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700";
            return <tr key={ticket.ID_TICKET} className="align-top transition hover:bg-blue-50/45">
              <td className="px-3 py-3"><p className="font-black text-blue-700">#{ticket.ID_TICKET}</p><p className="mt-1 truncate text-[10px] text-slate-400" title={ticket.DIRIP}>{ticket.DIRIP || "Sin IP"}</p></td>
              <td className="px-3 py-3"><p className="truncate font-bold text-slate-700" title={ticket.AREA}>{ticket.AREA || "—"}</p><p className="mt-1 truncate text-[10px] text-slate-400" title={ticket.SEDE}>{ticket.SEDE || "Sin sede"}</p></td>
              <td className="px-3 py-3"><p className="line-clamp-2 leading-5 text-slate-700" title={ticket.DESCRIPCION}>{ticket.DESCRIPCION || "Sin descripción"}</p><p className="mt-1 truncate text-[10px] font-semibold text-blue-600">{ticket.INCIDENTE}</p></td>
              <td className="px-3 py-3 text-center"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black ${prioridad}`}>{ticket.PRIORIDAD}</span></td><td className="px-3 py-3 text-center"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black ${estado}`}>{ticket.ESTADO}</span></td>
              <td className="px-3 py-3 text-[10px] leading-4 text-slate-500">{formatearFecha(ticket.HORAREGISTRO)}</td><td className="px-3 py-3 text-center"><span className={`inline-flex rounded-lg px-2 py-1 text-[10px] font-bold ${tiempo.clase}`}>{tiempo.texto}</span></td>
              <td className="px-3 py-3"><p className="line-clamp-2 leading-5 text-slate-600" title={ticket.CONTESTACION}>{ticket.CONTESTACION || "Sin respuesta todavía"}</p></td><td className="px-3 py-3"><p className="truncate font-semibold text-slate-700" title={ticket.USUARIO_SOLICITANTE}>{ticket.USUARIO_SOLICITANTE || "—"}</p><p className="mt-1 truncate text-[10px] text-slate-400" title={ticket.USUARIO_ASIGNADO}>{ticket.USUARIO_ASIGNADO || "Sin asignar"}</p></td>
              <td className="px-3 py-3 text-center">{ticket.ESTADO === "PENDIENTE" ? <div className="flex justify-center gap-1"><button type="button" onClick={() => onEditar(ticket)} title="Editar" className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"><HiOutlinePencilSquare /></button><button type="button" onClick={() => onEliminar(ticket)} title="Eliminar" className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><HiOutlineTrash /></button></div> : <span className="text-slate-300">—</span>}</td>
            </tr>;
          })}
        </tbody>
      </table>
      {ticketsFiltrados.length === 0 && <div className="p-10 text-center"><p className="text-sm font-bold text-slate-600">{hayFiltrosColumnas ? "No encontramos coincidencias" : "No hay tickets en este estado"}</p><p className="mt-1 text-xs text-slate-400">{hayFiltrosColumnas ? "Ajusta o limpia los filtros de las columnas." : "Prueba otro estado o crea una solicitud."}</p></div>}
    </div>
  </section>;
}
