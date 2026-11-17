import {obtenerUrlImagen} from '../utilidades/imagen.url';
import {useId, useState} from 'react';
import {leerImagen} from '../eventos/imagen.eventos';
export default function CampoImagen({etiqueta, valor, onChange, error, onError, onEstadoCarga, disabled = false}) {
  const id = useId();
  const [leyendo, setLeyendo] = useState(false);
  const [nombreArchivo, setNombreArchivo] = useState('');
  const seleccionar = async evento => {
    const archivo = evento.target.files?.[0];
    if (!archivo || disabled || leyendo) return;
    setLeyendo(true);
    onEstadoCarga?.(true);
    onError('');
    try { onChange(await leerImagen(archivo)); setNombreArchivo(archivo.name); } catch (e) { onError(e.message); }
    finally {setLeyendo(false); onEstadoCarga?.(false); evento.target.value = '';}
  };
  return <div className="min-w-0 space-y-2">
    <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-slate-500">{etiqueta}</label>
    <input id={id} type="file" accept="image/png,image/jpeg,image/webp" disabled={disabled || leyendo} onChange={seleccionar} aria-invalid={Boolean(error)} aria-describedby={`${id}-ayuda${error ? ` ${id}-error` : ''}`} className="block min-h-11 w-full min-w-0 rounded-xl border border-blue-100 bg-slate-50/80 px-3 py-2 text-sm text-slate-700 outline-none transition file:mr-3 file:rounded-lg file:border-0 file:bg-blue-100 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-blue-800 hover:file:bg-blue-200 focus-visible:border-blue-400 focus-visible:ring-4 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60" />
    <p id={`${id}-ayuda`} className="text-xs text-slate-600">JPG, PNG o WebP. Máximo 2 MB.</p>
    {nombreArchivo && valor && <p className="break-all text-sm text-slate-700">Archivo seleccionado: {nombreArchivo}</p>}
    {leyendo && <p role="status">Leyendo imagen...</p>}
    {error && <p id={`${id}-error`} role="alert" className="text-sm text-red-700">{error}</p>}
    {valor && <div className="flex flex-wrap items-center gap-3 rounded-xl border border-blue-100 bg-slate-50/80 p-3"><img src={obtenerUrlImagen(valor)} alt={etiqueta} className="h-28 w-40 max-w-full rounded-lg bg-white object-contain" /><button type="button" disabled={disabled || leyendo} onClick={() => {onChange(''); setNombreArchivo(''); onError('');}} className="min-h-11 rounded-lg px-3 py-2 text-sm font-semibold text-red-700 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60">Quitar imagen</button></div>}
  </div>;
}
