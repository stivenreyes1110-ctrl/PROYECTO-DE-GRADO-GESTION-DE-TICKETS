import {useState} from 'react';
import {campoClase} from '../variables/inventario.constantes';
import {useVariablesModalActivo} from '../variables/useVariablesModalActivo';
import {crearEventosModalActivo} from '../eventos/modalActivo.eventos';
import CampoImagen from './CampoImagen';
import { Save, X } from 'lucide-react';

export default function ModalActivo(props) {
  return props.isOpen ? <FormularioActivo key={props.editItem?.ID ?? 'nuevo'} {...props} /> : null;
}
function FormularioActivo({
  onClose,
  onSave: guardar,
  editItem,
  areas = [],
  sedes = [],
  idMesa
}) {
  const [guardando, setGuardando] = useState(false);
  const [leyendoImagen, setLeyendoImagen] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState('');
  const onSave = async datos => {
    if (guardando || leyendoImagen || errorImagen) return;
    setGuardando(true);
    setErrorGuardado('');
    try { await guardar(datos); } catch (error) { setErrorGuardado(error.message); }
    finally { setGuardando(false); }
  };
  const {formulario, setFormulario, errorImagen, setErrorImagen} = useVariablesModalActivo({editItem, idMesa});
  const {cambiarCampo, obtenerNombre, areasFiltradas, enviarFormulario} = crearEventosModalActivo({formulario, setFormulario, areas, idMesa, onSave});
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
      />

      <div className="support-modal relative w-full max-w-2xl overflow-hidden rounded-[26px] border border-white/20 bg-white shadow-2xl shadow-blue-950/30">
        <div className="support-modal-header flex h-20 items-center justify-between px-6 text-white">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-100">Mesa de ayuda {idMesa}</p>
            <h3 className="mt-1 text-xl font-black">
            {editItem ? 'Editar activo' : 'Nuevo activo'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:rotate-90 hover:bg-white/20"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form aria-busy={guardando} onSubmit={enviarFormulario} className="max-h-[75vh] overflow-y-auto p-6 space-y-5">
          {errorGuardado && <p role="alert" className="mb-4 text-sm text-red-700">{errorGuardado}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Numero de serie
              </label>
              <input
                type="text"
                name="NUMEROSERIE"
                value={formulario.NUMEROSERIE}
                onChange={cambiarCampo}
                placeholder="Ej. SN-123456"
                className={campoClase}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Categoria
              </label>
              <input
                type="text"
                name="CATEGORIA"
                value={formulario.CATEGORIA}
                onChange={cambiarCampo}
                placeholder="Ej. Computador"
                className={campoClase}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Descripcion de ubicacion
            </label>
            <textarea
              name="DESCRIPCIONUBICACION"
              value={formulario.DESCRIPCIONUBICACION}
              onChange={cambiarCampo}
              rows="2"
              placeholder="Ej. Consultorio 203, junto a recepcion"
              className={`${campoClase} resize-none`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Marca
              </label>
              <input
                type="text"
                name="MARCA"
                value={formulario.MARCA}
                onChange={cambiarCampo}
                placeholder="Ej. Dell"
                className={campoClase}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Modelo
              </label>
              <input
                type="text"
                name="MODELO"
                value={formulario.MODELO}
                onChange={cambiarCampo}
                placeholder="Ej. OptiPlex"
                className={campoClase}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Placa
              </label>
              <input
                type="text"
                name="PLACA"
                value={formulario.PLACA}
                onChange={cambiarCampo}
                placeholder="Ej. ABC123"
                className={campoClase}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Sede
              </label>
              <select
                name="IDSEDE"
                value={formulario.IDSEDE}
                onChange={cambiarCampo}
                className={campoClase}
              >
                <option value="">Seleccione una sede</option>
                {sedes.map((sede) => (
                  <option key={sede.ID} value={sede.ID}>
                    {obtenerNombre(sede)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Area
              </label>
              <select
                name="IDAREA"
                value={formulario.IDAREA}
                onChange={cambiarCampo}
                className={campoClase}
              >
                <option value="">
                  {formulario.IDSEDE ? 'Seleccione un area' : 'Seleccione primero una sede'}
                </option>
                {areasFiltradas.map((area) => (
                  <option key={area.ID} value={area.ID}>
                    {obtenerNombre(area)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Mesa
              </label>
              <div className="flex min-h-11 items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 text-sm font-bold text-emerald-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                Mesa {idMesa} reconocida automáticamente
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CampoImagen etiqueta="Foto del activo" valor={formulario.FOTO} onChange={(FOTO) => setFormulario(anterior => ({...anterior, FOTO}))} error={errorImagen} onError={setErrorImagen} onEstadoCarga={setLeyendoImagen} disabled={guardando} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-blue-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando || leyendoImagen || Boolean(errorImagen)}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <Save className="w-4.5 h-4.5" />
              <span>{guardando ? 'Guardando...' : leyendoImagen ? 'Leyendo imagen...' : 'Guardar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
