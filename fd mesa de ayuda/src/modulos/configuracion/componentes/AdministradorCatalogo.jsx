import {useVariablesConfiguracion} from '../variables/useVariablesConfiguracion';
import FormularioCatalogo from './FormularioCatalogo';
import TablaCatalogo from './TablaCatalogo';
export default function AdministradorCatalogo({seccion, logeo, onActualizarCatalogos}) {
  const v = useVariablesConfiguracion({token: logeo.token, recurso: seccion.id, onActualizarCatalogos});
  return <section className="space-y-4" aria-busy={v.cargando || v.procesando}>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold text-blue-950">{seccion.nombre}</h2><p className="mt-1 max-w-2xl text-sm text-blue-800">{seccion.descripcion}</p></div><button type="button" disabled={v.procesando} onClick={() => v.setEditor({})} className="shrink-0 self-start rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60">Agregar {seccion.singular}</button></div>
    {v.error && <div role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{v.error} {!v.editor && <button type="button" onClick={v.recargar} className="ml-2 underline">Reintentar</button>}</div>}
    {v.mensaje && <p role="status" className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">{v.mensaje}</p>}
    <div className={`grid items-start gap-5 ${v.editor ? 'lg:grid-cols-[minmax(0,1fr)_320px]' : ''}`}><div className="min-w-0 space-y-4">
      <label className="block text-sm font-semibold text-blue-950">Buscar en {seccion.nombre.toLowerCase()}<input type="search" value={v.busqueda} onChange={e => v.buscar(e.target.value)} className="mt-2 block w-full max-w-md rounded-lg border border-blue-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nombre, c?digo o sede" /></label>
      <p className="text-sm text-blue-800">Solo se pueden eliminar registros sin datos asociados. Los registros en uso conservan su historial.</p>
      <button type="button" onClick={v.recargar} disabled={v.cargando || v.procesando} className="min-h-11 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-800 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50">Actualizar listado</button>
      <TablaCatalogo seccion={seccion} registros={v.visibles} cargando={v.cargando} procesando={v.procesando} idMesa={logeo.idmesa || logeo.mesa} onEditar={v.setEditor} onEliminar={v.eliminar} />
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-blue-800"><span>{v.total} registros</span><div className="flex items-center gap-3"><button type="button" disabled={v.pagina <= 1} onClick={() => v.setPagina(v.pagina-1)} className="rounded-lg border border-blue-200 bg-white px-3 py-2 disabled:opacity-40">Anterior</button><span>{v.pagina} / {v.totalPaginas}</span><button type="button" disabled={v.pagina >= v.totalPaginas} onClick={() => v.setPagina(v.pagina+1)} className="rounded-lg border border-blue-200 bg-white px-3 py-2 disabled:opacity-40">Siguiente</button></div></div>
    </div>{v.editor && <FormularioCatalogo key={v.editor.ID ?? 'nuevo'} seccion={seccion} registro={v.editor} sedes={v.sedes} procesando={v.procesando} onGuardar={v.guardar} onCerrar={() => v.setEditor(null)} />}</div>
  </section>;
}
