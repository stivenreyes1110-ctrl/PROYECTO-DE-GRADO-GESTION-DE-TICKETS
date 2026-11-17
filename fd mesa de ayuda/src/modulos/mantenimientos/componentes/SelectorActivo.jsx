import {useId} from 'react';
import {datosActivo, nombreActivoCompleto} from '../utilidades/activoSeleccion.utilidades';
import {obtenerUrlImagen} from '../../inventario/utilidades/imagen.url';
export default function SelectorActivo({activos, valor, onChange, disabled = false}) {
  const id = useId();
  const seleccionado = activos.find(a => String(a.ID) === String(valor));
  return <div className="min-w-0 sm:col-span-2">
    <label htmlFor={id} className="mb-2 block text-sm font-semibold text-blue-950">Equipo para el mantenimiento</label>
    <select id={id} name="IDACTIVO" value={valor} onChange={onChange} disabled={disabled} required className="w-full min-w-0 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm text-blue-950 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60">
      <option value="">Seleccione un activo</option>
      {activos.map(activo => <option key={activo.ID} value={activo.ID}>{nombreActivoCompleto(activo)}</option>)}
    </select>
    {seleccionado && <section aria-label="Datos del equipo seleccionado" className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
      <h4 className="mb-3 text-sm font-semibold text-blue-950">Datos del activo seleccionado</h4>
      {seleccionado.FOTO && <img src={obtenerUrlImagen(seleccionado.FOTO)} alt={`Foto del activo ${seleccionado.PLACA || seleccionado.ID}`} className="mb-4 h-32 max-w-full rounded-lg bg-white object-contain" />}
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">{datosActivo(seleccionado).map(([campo, contenido]) => <div key={campo} className={campo === 'Ubicaci?n' ? 'sm:col-span-2 lg:col-span-3' : ''}><dt className="text-xs font-semibold text-blue-800">{campo}</dt><dd className="mt-1 break-words text-sm text-blue-950">{contenido}</dd></div>)}</dl>
      {!seleccionado.FOTO && <p className="mt-3 text-xs text-blue-800">Sin foto del activo.</p>}
    </section>}
  </div>;
}
