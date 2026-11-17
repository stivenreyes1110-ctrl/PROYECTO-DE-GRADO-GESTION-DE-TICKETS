import {useEffect, useId, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import SignatureCanvas from 'react-signature-canvas';
export default function ModalFirma({titulo, usuario, guardando, onClose, onGuardar}) {
  const id = useId();
  const dialogo = useRef(null);
  const canvas = useRef(null);
  const ocupado = useRef(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const modal = dialogo.current;
    const focoAnterior = document.activeElement;
    const overflowAnterior = document.body.style.overflow;
    modal.showModal();
    document.body.style.overflow = 'hidden';
    const dibujo = canvas.current;
    const elemento = dibujo.getCanvas();
    let anchoAnterior = elemento.offsetWidth;
    let altoAnterior = elemento.offsetHeight;
    const ajustar = () => {
      const ancho = Math.round(elemento.clientWidth);
      const alto = Math.round(elemento.clientHeight);
      if (!ancho || !alto) return;
      const datos = dibujo.toData().map(grupo => ({...grupo, points: grupo.points.map(p => ({...p, x: p.x * ancho / anchoAnterior, y: p.y * alto / altoAnterior}))}));
      elemento.width = ancho;
      elemento.height = alto;
      dibujo.clear();
      dibujo.fromData(datos);
      anchoAnterior = ancho;altoAnterior = alto;
    };
    ajustar();
    const observer = new ResizeObserver(ajustar);
    observer.observe(elemento);
    return () => {observer.disconnect();modal.close();document.body.style.overflow = overflowAnterior;focoAnterior?.focus();};
  }, []);
  const guardar = async () => {
    if (ocupado.current || guardando) return;
    if (canvas.current.isEmpty()) {setError('Dibuja la firma antes de guardar.');return;}
    ocupado.current = true;setError('');
    try {await onGuardar(canvas.current.getCanvas().toDataURL('image/png'));}
    catch(e) {setError(e.message);}
    finally {ocupado.current = false;}
  };
  return createPortal(<dialog ref={dialogo} aria-labelledby={`${id}-titulo`} aria-describedby={`${id}-ayuda`} onCancel={e => {e.preventDefault();if (!guardando && !ocupado.current) onClose();}} className="fixed inset-0 m-auto max-h-[94dvh] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto rounded-2xl bg-white p-4 text-blue-950 shadow-xl backdrop:bg-slate-950/60 sm:p-6">
    <h2 id={`${id}-titulo`} className="text-xl font-bold">Firmar: {titulo}</h2>
    <p className="mt-2 font-semibold">{usuario.NOMBRE}</p>
    <p id={`${id}-ayuda`} className="mt-2 text-sm text-blue-800">Dibuja con el dedo, lápiz o mouse. Guardar reemplaza la firma anterior de este responsable.</p>
    <div className="mt-4 overflow-hidden rounded-xl border border-blue-200 bg-white"><SignatureCanvas ref={canvas} clearOnResize={false} penColor="#0f172a" backgroundColor="rgb(255,255,255)" canvasProps={{'aria-label': `Firma de ${usuario.NOMBRE}`, style: {display: 'block', width: '100%', height: 'clamp(180px, 42dvh, 360px)', touchAction: 'none', pointerEvents: guardando ? 'none' : 'auto'}}} /></div>
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    <div aria-busy={guardando} className="mt-4 flex flex-wrap justify-end gap-3">
      <button type="button" disabled={guardando} onClick={() => {canvas.current.clear();setError('');}} className="min-h-11 rounded-xl border border-blue-200 px-4 py-2 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60">Limpiar</button>
      <button type="button" disabled={guardando} onClick={onClose} className="min-h-11 rounded-xl border border-blue-200 px-4 py-2 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60">Cancelar</button>
      <button type="button" disabled={guardando} onClick={guardar} className="min-h-11 rounded-xl bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60">{guardando ? 'Guardando...' : 'Guardar firma'}</button>
    </div>
  </dialog>, document.body);
}
