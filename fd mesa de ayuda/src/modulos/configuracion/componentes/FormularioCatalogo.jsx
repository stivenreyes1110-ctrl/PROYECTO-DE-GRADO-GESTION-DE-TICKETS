import {useId, useState} from 'react';
import {CLASE_CAMPO} from '../variables/configuracion.constantes';
export default function FormularioCatalogo({seccion, registro, sedes, procesando, onGuardar, onCerrar}) {
  const id = useId();
  const [datos, setDatos] = useState(() => ({NOMBRE: registro.NOMBRE || '', IDSEDE: registro.IDSEDE || '', PISO: registro.PISO ?? '', CODIGO: registro.CODIGO || '', ORDEN: registro.ORDEN ?? 0}));
  const cambiar = e => setDatos(actual => ({...actual, [e.target.name]: e.target.value}));
  return <aside className="rounded-xl border border-blue-200 bg-white p-5 lg:sticky lg:top-5 lg:self-start">
    <h3 className="text-lg font-bold text-blue-950">{registro.ID ? 'Editar' : 'Agregar'} {seccion.singular}</h3>
    <form onSubmit={e => {e.preventDefault();if (!procesando) onGuardar(datos);}} className="mt-5 space-y-4">
      <fieldset disabled={procesando} className="space-y-4">
        <label htmlFor={`${id}-nombre`} className="block text-sm font-semibold text-blue-950">Nombre<input id={`${id}-nombre`} name="NOMBRE" value={datos.NOMBRE} onChange={cambiar} required maxLength={100} className={CLASE_CAMPO} autoFocus /></label>
        {seccion.id === 'areas' && <>
          <label htmlFor={`${id}-sede`} className="block text-sm font-semibold text-blue-950">Sede<select id={`${id}-sede`} name="IDSEDE" value={datos.IDSEDE} onChange={cambiar} required className={CLASE_CAMPO}><option value="">Selecciona una sede</option>{sedes.map(s => <option key={s.ID} value={s.ID}>{s.NOMBRE}</option>)}</select></label>
          <label htmlFor={`${id}-piso`} className="block text-sm font-semibold text-blue-950">Piso<input id={`${id}-piso`} name="PISO" type="number" min={-100} max={1000} step="1" value={datos.PISO} onChange={cambiar} className={CLASE_CAMPO} /></label>
        </>}
        {seccion.id === 'prioridades' && <>
          <label htmlFor={`${id}-codigo`} className="block text-sm font-semibold text-blue-950">C?digo<input id={`${id}-codigo`} name="CODIGO" value={datos.CODIGO} onChange={cambiar} required maxLength={20} pattern="[A-Za-z0-9_]+" className={CLASE_CAMPO} /><span className="mt-1 block text-xs font-normal text-blue-800">Se guarda en los tickets. Usa letras, n?meros o guion bajo.</span></label>
          <label htmlFor={`${id}-orden`} className="block text-sm font-semibold text-blue-950">Orden<input id={`${id}-orden`} name="ORDEN" type="number" min={0} max={1000} step="1" value={datos.ORDEN} onChange={cambiar} required className={CLASE_CAMPO} /></label>
        </>}
      </fieldset>
      <div className="flex flex-wrap justify-end gap-3 border-t border-blue-100 pt-4"><button type="button" onClick={onCerrar} disabled={procesando} className="rounded-lg px-3 py-2 text-sm font-semibold text-blue-800 focus-visible:ring-2 focus-visible:ring-blue-500">Cancelar</button><button type="submit" disabled={procesando} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60">{procesando ? 'Guardando?' : 'Guardar'}</button></div>
    </form>
  </aside>;
}
