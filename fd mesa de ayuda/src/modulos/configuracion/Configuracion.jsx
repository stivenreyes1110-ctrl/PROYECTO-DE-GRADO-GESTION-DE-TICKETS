import {useState} from 'react';
import {Settings} from 'lucide-react';
import AjustesRol from '../ajustesRol/AjustesRol';
import AdministradorCatalogo from './componentes/AdministradorCatalogo';
import {SECCIONES} from './variables/configuracion.constantes';
export default function Configuracion({logeo, onActualizarCatalogos}) {
  const [seccion, setSeccion] = useState('usuarios');
  if (Number(logeo.idrol) !== 1) return <p role="alert" className="p-6 text-red-700">Esta secci?n requiere permisos de administrador.</p>;
  const actual = SECCIONES.find(s => s.id === seccion);
  return <div className="space-y-6">
    <header className="flex items-start gap-4 border-b border-blue-200 pb-5"><Settings className="mt-1 shrink-0 text-blue-700" size={28} /><div><h1 className="text-2xl font-bold text-blue-950">Configuraci?n</h1><p className="mt-1 text-sm text-blue-800">Administra el equipo y los cat?logos de la mesa {logeo.mesa}.</p></div></header>
    <nav aria-label="Secciones de configuraci?n" className="flex flex-wrap gap-2">{SECCIONES.map(s => <button key={s.id} type="button" aria-pressed={seccion === s.id} onClick={() => setSeccion(s.id)} className={`rounded-lg px-4 py-2.5 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-blue-500 ${seccion === s.id ? 'bg-blue-700 text-white' : 'bg-white text-blue-800 hover:bg-blue-50'}`}>{s.nombre}</button>)}</nav>
    {seccion === 'usuarios' ? <AjustesRol logeo={logeo} compacto /> : <AdministradorCatalogo key={seccion} seccion={actual} logeo={logeo} onActualizarCatalogos={onActualizarCatalogos} />}
  </div>;
}
