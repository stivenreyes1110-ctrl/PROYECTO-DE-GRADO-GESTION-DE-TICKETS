import {useId, useState} from 'react';
import ModalFirma from './ModalFirma';
export default function CampoFirma({tipo, titulo, firma, usuarios, guardando, onGuardar}) {
  const id = useId();
  const [abierto, setAbierto] = useState(false);
  const [firmante, setFirmante] = useState(firma?.IDFIRMANTE ? String(firma.IDFIRMANTE) : '');
  const [mensaje, setMensaje] = useState('');
  const seleccionado = usuarios.find(u => String(u.IDUSUARIO) === firmante);
  return <div className="min-w-0 space-y-4 rounded-xl border border-blue-200 bg-white p-4">
    <h5 className="font-semibold text-blue-950">{titulo}</h5>
    <label htmlFor={id} className="block text-sm font-medium text-blue-950">Firmante</label>
    <select id={id} value={firmante} onChange={e => {setFirmante(e.target.value);setMensaje('');}} disabled={guardando} className="min-h-11 w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm text-blue-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60">
      <option value="">Seleccione un usuario</option>
      {usuarios.map(u => <option key={u.IDUSUARIO} value={u.IDUSUARIO}>{u.NOMBRE} ({u.USUARIO})</option>)}
    </select>
    {firma ? <div className="space-y-2"><img src={firma.FIRMA} alt={`Firma de ${firma.NOMBRE}`} className="h-28 w-full object-contain" /><p className="text-sm font-medium text-blue-950">{firma.NOMBRE}</p><p className="text-xs text-blue-800">Guardada el {new Date(firma.FECHAFIRMA).toLocaleString('es-CO', {timeZone: 'America/Bogota'})}</p></div> : <p className="text-sm text-blue-800">Pendiente de firma.</p>}
    {firma && !firma.IDFIRMANTE && <p className="text-xs text-blue-800">Firma anterior conservada. Seleccione un usuario si desea reemplazarla.</p>}
    <button type="button" disabled={guardando || !seleccionado} onClick={() => {setAbierto(true);setMensaje('');}} className="min-h-11 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60">{firma ? 'Firmar de nuevo' : 'Firmar'}</button>
    {mensaje && <p role="status" className="text-sm text-emerald-800">{mensaje}</p>}
    {abierto && seleccionado && <ModalFirma titulo={titulo} usuario={seleccionado} guardando={guardando} onClose={() => setAbierto(false)} onGuardar={async FIRMA => {await onGuardar(tipo, {IDFIRMANTE: Number(firmante), FIRMA});setAbierto(false);setMensaje('Firma guardada.');}} />}
  </div>;
}
