import {useFirmasHojaVida} from '../variables/useFirmasHojaVida';
import FirmasHojaVida from './FirmasHojaVida';
import {obtenerUrlImagen} from '../utilidades/imagen.url';
import {formatearFecha} from '../utilidades/inventario.utilidades';
import {obtenerVariablesHojaVida} from '../variables/hojaVida.variables';
import {imprimirHojaVida} from '../eventos/hojaVida.eventos';
import { Download, X } from 'lucide-react';

export default function ModalHojaVidaEquipo(props) {
  return props.isOpen && props.activo ? <ContenidoHojaVida key={props.activo.ID} {...props} /> : null;
}
function ContenidoHojaVida({onClose, activo, mantenimientos = [], logeo}) {
  const estadoFirmas = useFirmasHojaVida(logeo?.token, activo.ID);

  const {mantenimientosEquipo, preventivos, correctivos} = obtenerVariablesHojaVida(activo, mantenimientos);
  const descargarPdf = () => imprimirHojaVida(activo, mantenimientosEquipo, estadoFirmas.firmas);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={() => {if (!estadoFirmas.guardando) onClose();}}
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
      />

      <div className="relative max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-2xl shadow-blue-200/60">
        <div className="flex h-16 items-center justify-between border-b border-blue-100 bg-gradient-to-r from-white to-blue-50 px-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Hoja de vida del equipo</h3>
            <p className="text-xs text-blue-800">
              {activo.CATEGORIA || 'Activo'} {activo.MARCA || ''} {activo.MODELO || ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={estadoFirmas.cargando || estadoFirmas.guardando || Boolean(estadoFirmas.error)}
              onClick={descargarPdf}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700"
              title="Descargar PDF"
            >
              <Download className="h-4 w-4" />
              <span>PDF</span>
            </button>
            <button
              disabled={estadoFirmas.guardando}
              onClick={onClose}
              className="rounded-lg p-1.5 text-blue-800 hover:bg-blue-50 hover:text-blue-950"
              title="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[calc(92vh-4rem)] overflow-y-auto p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-700">Mantenimientos</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{mantenimientosEquipo.length}</p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-700">Preventivos</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{preventivos.length}</p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-700">Correctivos</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{correctivos.length}</p>
            </div>
          </div>

          <section className="mt-6"><h4 className="mb-3 text-sm font-bold text-blue-950">Foto del activo</h4>{activo.FOTO ? <img src={obtenerUrlImagen(activo.FOTO)} alt={`Foto del activo ${activo.PLACA || activo.ID}`} className="h-48 max-w-full rounded-lg object-contain" /> : <p className="text-sm text-slate-600">Sin foto del activo</p>}</section>
          <section className="mt-6 rounded-2xl border border-blue-100">
            <div className="border-b border-blue-100 bg-blue-50 px-4 py-3">
              <h4 className="text-sm font-bold text-blue-950">Datos del equipo</h4>
            </div>
            <div className="grid gap-4 p-4 md:grid-cols-2">
              {[
                ['Categoria', activo.CATEGORIA],
                ['Marca', activo.MARCA],
                ['Modelo', activo.MODELO],
                ['Numero de serie', activo.NUMEROSERIE],
                ['Placa', activo.PLACA],
                ['Sede', activo.NOMBRESEDE],
                ['Area', activo.NOMBREAREA],
                ['Ubicacion', activo.DESCRIPCIONUBICACION]
              ].map(([titulo, valor]) => (
                <div key={titulo}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-800">{titulo}</p>
                  <p className="mt-1 text-sm font-medium text-blue-950">{valor || 'Sin registro'}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6">
            <h4 className="mb-3 text-sm font-bold text-blue-950">Historial preventivo y correctivo</h4>
            <div className="overflow-x-auto rounded-2xl border border-blue-100">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-blue-100 bg-blue-50 text-xs font-semibold text-blue-800">
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Responsable</th>
                    <th className="px-4 py-3">Descripcion</th>
                    <th className="px-4 py-3">Evidencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50">
                  {mantenimientosEquipo.length > 0 ? (
                    mantenimientosEquipo.map((mantenimiento) => (
                      <tr key={mantenimiento.ID}>
                        <td className="px-4 py-3 text-xs text-blue-800">{formatearFecha(mantenimiento.FECHA)}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{mantenimiento.TIPOMANTENIMIENTO}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{mantenimiento.ESTADO || 'Sin estado'}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{mantenimiento.RESPONSABLE || 'Sin responsable'}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{mantenimiento.DESCRIPCION || 'Sin descripcion'}</td>
                        <td className="px-4 py-3">{mantenimiento.EVIDENCIA ? <img src={obtenerUrlImagen(mantenimiento.EVIDENCIA)} alt={`Evidencia del mantenimiento ${mantenimiento.ID}`} className="h-20 w-28 object-contain" /> : <span className="text-xs text-slate-600">Sin evidencia</span>}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-sm text-blue-800">
                        Este equipo aun no tiene mantenimientos registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
          <FirmasHojaVida usuarios={estadoFirmas.usuarios} firmas={estadoFirmas.firmas} cargando={estadoFirmas.cargando} guardando={estadoFirmas.guardando} error={estadoFirmas.error} onGuardar={estadoFirmas.guardar} onReintentar={estadoFirmas.reintentar} />
        </div>
      </div>
    </div>
  );
}
