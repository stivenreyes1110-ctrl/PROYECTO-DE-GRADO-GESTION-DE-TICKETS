import SelectorActivo from './SelectorActivo';
import CampoImagen from '../../inventario/componentes/CampoImagen';
import {useState} from 'react';
import { Save, X } from 'lucide-react';


const datosIniciales = {
  IDACTIVO: '',
  TIPOMANTENIMIENTO: 'Preventivo',
  FECHA: '',
  DESCRIPCION: '',
  DIAGNOSTICO: '',
  SOLUCION: '',
  RESPONSABLE: '',
  EVIDENCIA: '',
  ESTADO: 'FINALIZADO'
};

const obtenerFechaInput = (fecha) => {
  if (!fecha) return new Date().toISOString().slice(0, 16);

  const fechaConvertida = new Date(fecha);
  if (Number.isNaN(fechaConvertida.getTime())) return new Date().toISOString().slice(0, 16);

  return fechaConvertida.toISOString().slice(0, 16);
};

export default function ModalMantenimiento(props) {
  return props.isOpen ? <FormularioMantenimiento key={props.editItem?.ID ?? 'nuevo'} {...props} /> : null;
}
function FormularioMantenimiento({
  onClose,
  onSave: guardar,
  editItem,
  activos = []
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
  const [formulario, setFormulario] = useState(() => ({
    ...Object.fromEntries(Object.entries(datosIniciales).map(([campo, valor]) => [campo, editItem?.[campo] ?? valor])),
    FECHA: obtenerFechaInput(editItem?.FECHA)
  }));
  const [errorImagen, setErrorImagen] = useState('');
  const cambiarCampo = (evento) => {
    const { name, value } = evento.target;
    setFormulario((anterior) => ({ ...anterior, [name]: value }));
  };

  const enviarFormulario = (evento) => {
    evento.preventDefault();
    if (guardando || leyendoImagen || errorImagen) return;

    if (!formulario.IDACTIVO || !formulario.TIPOMANTENIMIENTO) {
      alert('Activo y tipo de mantenimiento son obligatorios');
      return;
    }

    onSave({
      ...formulario,
      IDACTIVO: Number(formulario.IDACTIVO)
    });
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
      />

      <div role="dialog" aria-modal="true" aria-labelledby="titulo-mantenimiento" className="relative flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-2xl shadow-blue-200/60">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-blue-100 bg-gradient-to-r from-white to-blue-50 px-6">
          <h3 id="titulo-mantenimiento" className="text-lg font-bold text-slate-900">
            {editItem ? 'Editar mantenimiento' : 'Nuevo mantenimiento'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-blue-800 hover:bg-blue-50 hover:text-blue-950"
            title="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form aria-busy={guardando} onSubmit={enviarFormulario} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
          {errorGuardado && <p role="alert" className="mb-4 text-sm text-red-700">{errorGuardado}</p>}
          <fieldset className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2" disabled={guardando}>
            <legend className="mb-4 text-base font-bold text-slate-900">Datos del mantenimiento</legend>
            <SelectorActivo activos={activos} valor={formulario.IDACTIVO} onChange={cambiarCampo} disabled={guardando} />

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Tipo
              </label>
              <select
                name="TIPOMANTENIMIENTO"
                value={formulario.TIPOMANTENIMIENTO}
                onChange={cambiarCampo}
                className="w-full rounded-xl border border-blue-100 bg-slate-50/80 px-4 py-2.5 text-sm text-slate-700 focus:border-blue-600 focus:outline-none"
              >
                <option value="Preventivo">Preventivo</option>
                <option value="Correctivo">Correctivo</option>
                <option value="Predictivo">Predictivo</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Fecha
              </label>
              <input
                type="datetime-local"
                name="FECHA"
                value={formulario.FECHA}
                onChange={cambiarCampo}
                className="w-full rounded-xl border border-blue-100 bg-slate-50/80 px-4 py-2.5 text-sm text-slate-700 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Estado
              </label>
              <select
                name="ESTADO"
                value={formulario.ESTADO}
                onChange={cambiarCampo}
                className="w-full rounded-xl border border-blue-100 bg-slate-50/80 px-4 py-2.5 text-sm text-slate-700 focus:border-blue-600 focus:outline-none"
              >
                <option value="PENDIENTE">Pendiente</option>
                <option value="EN PROCESO">En proceso</option>
                <option value="FINALIZADO">Finalizado</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Responsable
              </label>
              <input
                type="text"
                name="RESPONSABLE"
                value={formulario.RESPONSABLE}
                onChange={cambiarCampo}
                placeholder="Nombre del responsable"
                className="w-full rounded-xl border border-blue-100 bg-slate-50/80 px-4 py-2.5 text-sm text-slate-700 focus:border-blue-600 focus:outline-none"
              />
            </div>

          </fieldset>

          <fieldset className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2" disabled={guardando}>
            <legend className="mb-4 text-base font-bold text-slate-900">Detalle del trabajo</legend>
            {['DESCRIPCION', 'DIAGNOSTICO', 'SOLUCION'].map((campo) => (
              <div key={campo} className={campo === 'DESCRIPCION' ? 'sm:col-span-2' : 'min-w-0'}>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {{DESCRIPCION: 'Descripción', DIAGNOSTICO: 'Diagnóstico', SOLUCION: 'Solución'}[campo]}
                </label>
                <textarea
                  name={campo}
                  value={formulario[campo]}
                  onChange={cambiarCampo}
                  rows="3"
                  className="w-full resize-none rounded-xl border border-blue-100 bg-slate-50/80 px-4 py-2.5 text-sm text-slate-700 focus:border-blue-600 focus:outline-none"
                />
              </div>
            ))}
          </fieldset>

          <section aria-label="Evidencia fotográfica" className="space-y-4 border-t border-blue-100 pt-5">
          <h4 className="text-base font-bold text-slate-900">Evidencia fotográfica</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CampoImagen etiqueta="Foto de evidencia del mantenimiento" valor={formulario.EVIDENCIA} onChange={(EVIDENCIA) => setFormulario(anterior => ({...anterior, EVIDENCIA}))} error={errorImagen} onError={setErrorImagen} onEstadoCarga={setLeyendoImagen} disabled={guardando} />

          </div>
          </section>
          </div>

          <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-blue-100 bg-white px-4 py-4 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-blue-100 bg-white px-5 py-2.5 text-sm font-semibold text-blue-800 hover:bg-blue-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando || leyendoImagen || Boolean(errorImagen)}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700"
            >
              <Save className="h-4.5 w-4.5" />
              <span>{guardando ? 'Guardando...' : leyendoImagen ? 'Leyendo imagen...' : 'Guardar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
