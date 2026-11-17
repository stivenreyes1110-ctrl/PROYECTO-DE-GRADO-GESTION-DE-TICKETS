import {useId} from 'react';
export default function TablaCatalogo({seccion, registros, cargando, procesando, idMesa, onEditar, onEliminar}) {
  const id = useId();
  const columnas = seccion.id === 'areas' ? ['Nombre', 'Sede', 'Piso'] : seccion.id === 'prioridades' ? ['Nombre', 'Código', 'Orden'] : seccion.id === 'incidentes' ? ['Nombre', 'Alcance'] : ['Nombre'];
  return <div className="overflow-x-auto rounded-xl border border-blue-100 bg-white">
    <table className="w-full text-left text-sm">
      <caption className="sr-only">{seccion.nombre}: registros y disponibilidad de eliminación</caption>
      <thead className="bg-blue-50 text-blue-950"><tr>{columnas.map(col => <th scope="col" key={col} className="px-4 py-3 font-semibold">{col}</th>)}<th scope="col" className="px-4 py-3 font-semibold">Uso del registro</th><th scope="col" className="px-4 py-3 text-right">Acciones</th></tr></thead>
      <tbody className="divide-y divide-blue-100">{cargando ? <tr><td colSpan={columnas.length+2} className="p-8 text-center text-blue-800" role="status">Cargando registros...</td></tr> : registros.length === 0 ? <tr><td colSpan={columnas.length+2} className="p-8 text-center text-blue-800">No hay registros para mostrar.</td></tr> : registros.map(r => {
        const compartido = seccion.id === 'incidentes' && Number(r.IDMESA) !== Number(idMesa);
        const puedeEliminar = !compartido && r.PUEDE_ELIMINAR === true;
        const motivo = compartido ? 'Incidente compartido: solo consulta.' : r.MOTIVO_ELIMINACION || (puedeEliminar ? 'Sin datos asociados.' : 'Estado de uso no disponible. Actualice el listado.');
        const descripcion = `${id}-${r.ID}-uso`;
        return <tr key={r.ID} className="hover:bg-blue-50/40"><th scope="row" className="px-4 py-4 font-medium text-blue-950">{r.NOMBRE}</th>
          {seccion.id === 'areas' && <><td className="px-4 py-4 text-blue-800">{r.SEDE}</td><td className="px-4 py-4 text-blue-800">{r.PISO ?? 'Sin piso'}</td></>}
          {seccion.id === 'prioridades' && <><td className="px-4 py-4 text-blue-800">{r.CODIGO}</td><td className="px-4 py-4 text-blue-800">{r.ORDEN}</td></>}
          {seccion.id === 'incidentes' && <td className="px-4 py-4 text-blue-800">{compartido ? 'Compartido' : 'Esta mesa'}</td>}
          <td className="min-w-48 px-4 py-4"><span className={`inline-block rounded-md px-2 py-1 text-xs font-semibold ${r.EN_USO ? 'bg-amber-50 text-amber-900' : puedeEliminar ? 'bg-emerald-50 text-emerald-900' : 'bg-blue-50 text-blue-900'}`}>{r.EN_USO ? 'En uso' : puedeEliminar ? 'Disponible' : compartido ? 'Solo consulta' : 'Sin verificar'}</span><p id={descripcion} className="mt-2 max-w-sm text-xs leading-5 text-blue-800">{motivo}</p></td>
          <td className="px-4 py-4 text-right">{compartido ? <span className="text-xs text-blue-800">Solo consulta</span> : <div className="flex justify-end gap-2"><button type="button" disabled={procesando} onClick={() => onEditar(r)} aria-label={`Editar ${r.NOMBRE}`} className="min-h-11 rounded-lg px-3 py-2 font-semibold text-blue-700 hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50">Editar</button><button type="button" disabled={procesando || !puedeEliminar} onClick={() => onEliminar(r)} aria-label={`Eliminar ${r.NOMBRE}`} aria-describedby={descripcion} title={puedeEliminar ? 'Eliminar registro' : motivo} className="min-h-11 rounded-lg px-3 py-2 font-semibold text-red-700 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50">Eliminar</button></div>}</td>
        </tr>;
      })}</tbody>
    </table>
  </div>;
}
