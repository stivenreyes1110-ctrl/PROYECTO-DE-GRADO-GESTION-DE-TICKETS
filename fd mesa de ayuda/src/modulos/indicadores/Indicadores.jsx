import {useEffect, useId, useState} from 'react';
import {solicitarApi} from '../inventario/eventos/inventario.fetch';
import {GraficoBarras, GraficoEvolucion} from './componentes/GraficosIndicadores';
const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const control = 'mt-2 min-h-11 w-full min-w-0 rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm text-blue-950 outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
const numero = valor => Number(valor || 0).toLocaleString('es-CO');
const horas = minutos => minutos == null ? 'Sin datos' : `${(Number(minutos)/60).toLocaleString('es-CO',{maximumFractionDigits:1})} h`;
function periodo(f) {
  if (f.vista === 'mensual') return `${meses[f.mes-1]} de ${f.anio}`;
  if (f.vista === 'anual') return `Año ${f.anio}`;
  if (!f.desde && !f.hasta) return 'Todo el histórico';
  return `${f.desde || 'Inicio del histórico'} hasta ${f.hasta || 'Sin fecha final'}`;
}
export default function Indicadores({logeo}) {
  const id = useId();
  const [hoy] = useState(() => new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Bogota'}).format(new Date()));
  const [filtros,setFiltros] = useState(() => ({vista:'general',anio:hoy.slice(0,4),mes:String(Number(hoy.slice(5,7))),usuario:'',desde:'',hasta:''}));
  const [consulta,setConsulta] = useState(filtros);
  const [revision,setRevision] = useState(0);
  const [estado,setEstado] = useState({datos:null,cargando:true,error:'',soportes:[],anios:[]});
  const [errorFiltro,setErrorFiltro] = useState('');
  useEffect(() => {
    const abort = new AbortController();
    async function cargar() {
      setEstado(e => ({...e,datos:null,cargando:true,error:''}));
      try {
        const params = new URLSearchParams({vista:consulta.vista});
        if (consulta.usuario) params.set('usuario',consulta.usuario);
        if (consulta.vista === 'general') {if(consulta.desde)params.set('desde',consulta.desde);if(consulta.hasta)params.set('hasta',consulta.hasta);}
        else {params.set('anio',consulta.anio);if(consulta.vista==='mensual')params.set('mes',consulta.mes);}
        const datos = await solicitarApi(logeo.token,`/indicadores?${params}`,{signal:abort.signal});
        if(!abort.signal.aborted)setEstado({datos,cargando:false,error:'',soportes:datos.soportes,anios:datos.anios});
      } catch(e) {if(!abort.signal.aborted)setEstado(s => ({...s,datos:null,cargando:false,error:e.message}));}
    }
    cargar();return () => abort.abort();
  },[logeo.token,consulta,revision]);
  const cambiar = e => {setFiltros(f => ({...f,[e.target.name]:e.target.value}));setErrorFiltro('');};
  const aplicar = e => {
    e.preventDefault();
    if(filtros.vista==='general' && filtros.desde && filtros.hasta && filtros.desde>filtros.hasta) {setErrorFiltro('La fecha inicial debe ser anterior o igual a la final.');return;}
    setConsulta({...filtros});setRevision(r => r+1);
  };
  const cambiarVista = vista => {const nuevos={...consulta,vista};setFiltros(nuevos);setConsulta(nuevos);setErrorFiltro('');};
  const datos = estado.datos;
  const resumen = datos?.resumen;
  const anios = [...new Set([Number(hoy.slice(0,4)),Number(filtros.anio),...estado.anios])].sort((a,b) => b-a);
  const estados = resumen ? [['Por asignar',resumen.POR_ASIGNAR],['En proceso',resumen.EN_PROCESO],['Solucionados',resumen.SOLUCIONADOS],['Cerrados',resumen.CERRADOS],...(resumen.SIN_ESTADO ? [['Sin estado',resumen.SIN_ESTADO]] : [])].map(([NOMBRE,TOTAL]) => ({NOMBRE,TOTAL})) : [];
  return <div className="min-h-screen w-full min-w-0 space-y-6 bg-[#f5f9ff] p-4 text-blue-950 sm:p-6">
    <header className="support-hero rounded-2xl border border-blue-100 p-5 sm:p-6"><h1 className="text-2xl font-bold sm:text-3xl">Indicadores de la Mesa de Ayuda</h1><p className="mt-2 text-sm text-blue-800">Consulte la carga de trabajo, los estados y los tiempos de resolución de su mesa.</p></header>
    <nav aria-label="Vistas de indicadores" className="flex flex-wrap gap-2">{[['general','General'],['mensual','Mensual'],['anual','Anual']].map(([vista,nombre]) => <button type="button" key={vista} aria-pressed={filtros.vista===vista} onClick={() => cambiarVista(vista)} className={`min-h-11 rounded-xl border px-5 py-2 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${filtros.vista===vista ? 'border-blue-700 bg-blue-700 text-white' : 'border-blue-200 bg-white text-blue-800 hover:bg-blue-50'}`}>{nombre}</button>)}</nav>
    <form onSubmit={aplicar} className="rounded-xl border border-blue-100 bg-white p-4 sm:p-6">
      <div className="grid items-end gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {filtros.vista==='general' ? <><label htmlFor={`${id}-desde`} className="text-sm font-semibold">Desde<input id={`${id}-desde`} type="date" name="desde" value={filtros.desde} onChange={cambiar} className={control} /></label><label htmlFor={`${id}-hasta`} className="text-sm font-semibold">Hasta<input id={`${id}-hasta`} type="date" name="hasta" value={filtros.hasta} onChange={cambiar} className={control} /></label></> : <><label htmlFor={`${id}-anio`} className="text-sm font-semibold">Año<select id={`${id}-anio`} aria-label="Año" name="anio" value={filtros.anio} onChange={cambiar} className={control}>{anios.map(a => <option key={a} value={a}>{a}</option>)}</select></label>{filtros.vista==='mensual' && <label htmlFor={`${id}-mes`} className="text-sm font-semibold">Mes<select id={`${id}-mes`} aria-label="Mes" name="mes" value={filtros.mes} onChange={cambiar} className={control}>{meses.map((m,i) => <option key={m} value={i+1}>{m}</option>)}</select></label>}</>}
        <label htmlFor={`${id}-usuario`} className="text-sm font-semibold">Usuario de soporte<select id={`${id}-usuario`} aria-label="Usuario de soporte" name="usuario" value={filtros.usuario} onChange={cambiar} className={control}><option value="">Todos los soportes y sin asignar</option>{estado.soportes.map(u => <option key={u.IDUSUARIO} value={u.IDUSUARIO}>{u.NOMBRE}{Number(u.ESTADO)!==1 ? ' (inactivo)' : ''}</option>)}</select></label>
        <div className="flex flex-wrap gap-2"><button type="submit" className="min-h-11 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-500">Aplicar filtros</button><button type="button" onClick={() => {const nuevos={...filtros,usuario:'',desde:'',hasta:'',anio:hoy.slice(0,4),mes:String(Number(hoy.slice(5,7)))};setFiltros(nuevos);setConsulta(nuevos);setErrorFiltro('');}} className="min-h-11 rounded-xl border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500">Restablecer</button></div>
      </div>
      {errorFiltro && <p role="alert" className="mt-3 text-sm text-red-700">{errorFiltro}</p>}
    </form>
    <div aria-busy={estado.cargando} className="space-y-6">
      {estado.cargando && <p role="status" className="rounded-xl border border-blue-100 bg-white p-6">Consultando indicadores...</p>}
      {estado.error && <div role="alert" className="rounded-xl border border-red-200 bg-white p-6"><p className="text-red-700">{estado.error}</p><button type="button" onClick={() => setRevision(r => r+1)} className="mt-3 min-h-11 rounded-xl border border-blue-200 px-4 py-2 text-blue-800 focus-visible:ring-2 focus-visible:ring-blue-500">Reintentar</button></div>}
      {datos && <>
        <div role="status"><h2 className="text-lg font-bold">{periodo(datos.filtros)}</h2><p className="mt-1 text-sm text-blue-800">{datos.filtros.idUsuario ? estado.soportes.find(u => u.IDUSUARIO===datos.filtros.idUsuario)?.NOMBRE : 'Todos los soportes y tickets sin asignar'}. Período según fecha de registro. Estados y asignación actuales.</p></div>
        {resumen.TOTAL===0 && <p role="status" className="rounded-xl border border-blue-200 bg-white p-5">No hay tickets que coincidan con los filtros seleccionados.</p>}
        <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[['Total de tickets',numero(resumen.TOTAL)],['Asignados',numero(resumen.ASIGNADOS)],['Atendidos',numero(resumen.ATENDIDOS)],['Pendientes',numero(resumen.PENDIENTES)],['Solucionados',numero(resumen.SOLUCIONADOS)],['Cerrados',numero(resumen.CERRADOS)],['Sin asignar',numero(resumen.TOTAL-resumen.ASIGNADOS)],['Tiempo promedio',horas(resumen.PROMEDIO_MINUTOS)]].map(([titulo,valor]) => <div key={titulo} className="rounded-xl border border-blue-100 bg-white p-5"><dt className="text-sm font-medium text-blue-800">{titulo}</dt><dd className="mt-2 text-3xl font-bold tabular-nums">{valor}</dd></div>)}</dl>
        <p className="text-sm text-blue-800">Promedio en horas corridas, calculado sobre {numero(resumen.MUESTRA_TIEMPO)} tickets solucionados o cerrados con fechas válidas. Excluidos por fechas incompletas o inconsistentes: {numero(resumen.TIEMPOS_EXCLUIDOS)}.{resumen.SIN_ESTADO>0 && ` Tickets sin estado reconocido: ${numero(resumen.SIN_ESTADO)}.`}</p>
        <GraficoEvolucion datos={datos.serie} vista={datos.filtros.vista} />
        <div className="grid gap-6 xl:grid-cols-2"><GraficoBarras titulo="Tickets por estado" datos={estados} /><GraficoBarras titulo="Tickets por soporte actual" datos={datos.usuarios.map(u => ({NOMBRE:u.NOMBRE,TOTAL:u.TOTAL}))} /></div>
        <section className="min-w-0 rounded-xl border border-blue-100 bg-white p-4 sm:p-6"><h2 className="text-lg font-bold">Estadísticas por usuario</h2><p className="mt-2 text-sm text-blue-800">Atendidos: en proceso, solucionados o cerrados. Pendientes: por asignar o en proceso. Cada ticket se atribuye al soporte actualmente asignado.</p><div className="mt-4 overflow-x-auto"><table className="w-full whitespace-nowrap text-left text-sm"><caption className="sr-only">Estadísticas individuales del período seleccionado</caption><thead className="bg-blue-50 text-blue-950"><tr>{['Usuario','Tickets','Asignados','Atendidos','Solucionados','Cerrados','Pendientes','Tiempo promedio','Muestra de tiempo'].map(t => <th key={t} scope="col" className="px-3 py-3">{t}</th>)}</tr></thead><tbody>{datos.usuarios.map(u => <tr key={u.IDUSUARIO ?? 'sin-asignar'} className="border-t border-blue-100"><th scope="row" className="px-3 py-3 font-semibold">{u.NOMBRE}</th>{['TOTAL','ASIGNADOS','ATENDIDOS','SOLUCIONADOS','CERRADOS','PENDIENTES'].map(k => <td key={k} className="px-3 py-3 tabular-nums">{numero(u[k])}</td>)}<td className="px-3 py-3">{horas(u.PROMEDIO_MINUTOS)}</td><td className="px-3 py-3">{numero(u.MUESTRA_TIEMPO)}</td></tr>)}{datos.usuarios.length===0 && <tr><td colSpan={9} className="p-6 text-center text-blue-800">Sin tickets para mostrar.</td></tr>}</tbody></table></div></section>
        <div className="grid gap-6 xl:grid-cols-2"><GraficoBarras titulo="Tickets por área" datos={datos.areas} /><GraficoBarras titulo="Tickets por sede" datos={datos.sedes} /></div>
      </>}
    </div>
  </div>;
}
