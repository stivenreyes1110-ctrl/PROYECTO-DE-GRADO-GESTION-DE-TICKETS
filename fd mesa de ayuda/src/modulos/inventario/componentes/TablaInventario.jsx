import {useVariablesTablaInventario} from '../variables/useVariablesTablaInventario';
import { Edit3, FileText, PackageMinus, Search, Trash2 } from 'lucide-react';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';

export default function TablaInventario({
  activos,
  onEdit,
  onDelete,
  onLifeSheet,
  pagina,
  total,
  limite,
  onCambiarPagina
}) {
  const {busqueda, setBusqueda, totalPaginas, activosFiltrados, obtenerArea, obtenerSede, obtenerMesa} = useVariablesTablaInventario({activos, total, limite});

  return (
    <section className="support-animated-table overflow-hidden rounded-[24px] border border-blue-100 bg-white shadow-sm">
      <header className="border-b border-blue-100 bg-gradient-to-r from-white to-blue-50/60 px-4 py-4 lg:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
            <input
              type="text"
              placeholder="Buscar por serie, categoria, marca, modelo, placa o ubicacion..."
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              className="w-full rounded-xl border border-blue-100 bg-white py-2 pl-9 pr-3 text-xs text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <div className="flex shrink-0 items-center overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
            <button type="button" onClick={() => onCambiarPagina(Math.max(1, pagina - 1))} disabled={pagina <= 1} className="flex h-9 w-9 items-center justify-center text-blue-700 hover:bg-blue-50 disabled:opacity-30" aria-label="Página anterior"><HiOutlineChevronLeft /></button>
            <span className="border-x border-blue-100 px-3 text-xs font-semibold text-slate-600">{pagina} / {totalPaginas}</span>
            <button type="button" onClick={() => onCambiarPagina(Math.min(totalPaginas, pagina + 1))} disabled={pagina >= totalPaginas} className="flex h-9 w-9 items-center justify-center text-blue-700 hover:bg-blue-50 disabled:opacity-30" aria-label="Página siguiente"><HiOutlineChevronRight /></button>
          </div>
        </div>
      </header>

      <div className="max-h-[58vh] overflow-auto">
        <table className="w-full min-w-[1450px] table-fixed text-left text-xs">
          <thead className="sticky top-0 z-20 border-b border-blue-100 bg-[#f6faff] text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3">ID</th>
              <th className="px-5 py-3">Numero De Serie</th>
              <th className="px-5 py-3">Categoria</th>
              <th className="px-5 py-3">Marca</th>
              <th className="px-5 py-3">Modelo</th>
              <th className="px-5 py-3">Placa</th>
              <th className="px-5 py-3">Ubicacion</th>
              <th className="px-5 py-3">Area</th>
              <th className="px-5 py-3">Sede</th>
              <th className="px-5 py-3">Mesa</th>
              <th className="px-5 py-3">Fecha registro</th>
              <th className="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {activosFiltrados.length > 0 ? (
              activosFiltrados.map((activo) => (
                <tr key={activo.ID} className="align-top transition hover:bg-blue-50/45">
                  <td className="px-5 py-3 text-xs font-semibold text-blue-700">
                    {activo.ID || 'Sin ID'}
                  </td>
                  <td className="px-5 py-3 text-xs font-semibold text-blue-700">
                    {activo.NUMEROSERIE || 'Sin numero de serie'}
                  </td>
                  <td className="px-5 py-3 text-xs font-semibold text-slate-800">{activo.CATEGORIA}</td>
                  <td className="px-5 py-3 text-xs text-slate-600">{activo.MARCA || 'Sin marca'}</td>
                  <td className="px-5 py-3 text-xs text-slate-600">{activo.MODELO || 'Sin modelo'}</td>
                  <td className="px-5 py-3 text-xs text-slate-700">
                    <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-800">
                      {activo.PLACA || 'Sin placa'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-600">
                    {activo.DESCRIPCIONUBICACION || 'Sin ubicacion'}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-600">{obtenerArea(activo)}</td>
                  <td className="px-5 py-3 text-xs text-slate-600">{obtenerSede(activo)}</td>
                  <td className="px-5 py-3 text-xs text-slate-600">{obtenerMesa(activo)}</td>
                  <td className="px-5 py-3 text-[11px] text-slate-500">
                    {activo.FECHAREGISTRO ? new Date(activo.FECHAREGISTRO).toLocaleString('es-ES') : 'Sin fecha'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onLifeSheet(activo)}
                        className="rounded-lg border border-blue-100 bg-blue-50 p-1 text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-100 hover:shadow-md"
                        title="Hoja de vida"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(activo)}
                        className="rounded-lg border border-blue-100 bg-blue-50 p-1 text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-100 hover:shadow-md"
                        title="Editar activo"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(activo.ID)}
                        className="rounded-lg border border-rose-100 bg-rose-50 p-1 text-rose-600 transition hover:-translate-y-0.5 hover:bg-rose-100 hover:shadow-md"
                        title="Eliminar activo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="12" className="px-5 py-10 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <PackageMinus className="w-12 h-12 mb-3 text-blue-300" />
                    <p className="text-base font-semibold text-slate-700">No se encontraron activos</p>
                    <p className="text-xs mt-1">Intente ajustar la busqueda.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
