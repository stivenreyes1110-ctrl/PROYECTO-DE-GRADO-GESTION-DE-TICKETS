import React, { useMemo, useState } from 'react';
import { Edit3, Search, Stethoscope, Trash2 } from 'lucide-react';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';

const obtenerActivo = (mantenimiento) => {
  const placa = mantenimiento.PLACA ? ` - ${mantenimiento.PLACA}` : '';
  const marca = mantenimiento.MARCA ? ` ${mantenimiento.MARCA}` : '';
  const modelo = mantenimiento.MODELO ? ` ${mantenimiento.MODELO}` : '';

  return `${mantenimiento.CATEGORIA || 'Activo'}${marca}${modelo}${placa}`;
};

const obtenerColorEstado = (estado = '') => {
  if (estado === 'FINALIZADO') return 'border-emerald-100 bg-emerald-50 text-emerald-700';
  if (estado === 'EN PROCESO') return 'border-cyan-100 bg-cyan-50 text-cyan-700';
  return 'border-amber-100 bg-amber-50 text-amber-700';
};

export default function TablaMantenimientos({
  mantenimientos,
  onEdit,
  onDelete,
  pagina,
  total,
  limite,
  onCambiarPagina
}) {
  const [busqueda, setBusqueda] = useState('');
  const totalPaginas = Math.max(1, Math.ceil(total / limite));

  const mantenimientosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return mantenimientos;

    return mantenimientos.filter((mantenimiento) => {
      return (
        String(obtenerActivo(mantenimiento)).toLowerCase().includes(texto) ||
        String(mantenimiento.DESCRIPCIONUBICACION || '').toLowerCase().includes(texto) ||
        String(mantenimiento.TIPOMANTENIMIENTO || '').toLowerCase().includes(texto) ||
        String(mantenimiento.RESPONSABLE || '').toLowerCase().includes(texto) ||
        String(mantenimiento.ESTADO || '').toLowerCase().includes(texto)
      );
    });
  }, [mantenimientos, busqueda]);

  return (
    <section className="support-animated-table overflow-hidden rounded-[24px] border border-blue-100 bg-white shadow-sm">
      <header className="border-b border-blue-100 bg-gradient-to-r from-white to-blue-50/60 px-4 py-4 lg:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500" />
            <input
              type="text"
              placeholder="Buscar por activo, ubicación, tipo, responsable o estado..."
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
        <table className="w-full min-w-[1000px] table-fixed text-left text-xs">
          <thead className="sticky top-0 z-20 border-b border-blue-100 bg-[#f6faff] text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3">ID</th>
              <th className="px-5 py-3">Activo</th>
              <th className="px-5 py-3">Tipo</th>
              <th className="px-5 py-3">Responsable</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3">Fecha</th>
              <th className="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {mantenimientosFiltrados.length > 0 ? (
              mantenimientosFiltrados.map((mantenimiento) => (
                <tr key={mantenimiento.ID} className="align-top transition hover:bg-blue-50/45">
                  <td className="px-5 py-3 text-xs font-semibold text-blue-700">
                    <span className="rounded-lg bg-blue-50 px-2 py-1">{mantenimiento.ID}</span>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-xs font-semibold text-slate-800">{obtenerActivo(mantenimiento)}</p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {mantenimiento.NOMBRESEDE || 'Sin sede'} / {mantenimiento.NOMBREAREA || 'Sin area'}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {mantenimiento.DESCRIPCIONUBICACION || 'Sin descripcion de ubicacion'}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-600">{mantenimiento.TIPOMANTENIMIENTO}</td>
                  <td className="px-5 py-3 text-xs text-slate-600">{mantenimiento.RESPONSABLE || 'Sin responsable'}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${obtenerColorEstado(mantenimiento.ESTADO)}`}>
                      {mantenimiento.ESTADO || 'PENDIENTE'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[11px] text-slate-500">
                    {mantenimiento.FECHA ? new Date(mantenimiento.FECHA).toLocaleString('es-ES') : 'Sin fecha'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(mantenimiento)}
                        className="rounded-lg border border-blue-100 bg-blue-50 p-1 text-blue-700 hover:bg-blue-100"
                        title="Editar mantenimiento"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(mantenimiento.ID)}
                        className="rounded-lg border border-rose-100 bg-rose-50 p-1 text-rose-600 hover:bg-rose-100"
                        title="Eliminar mantenimiento"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-5 py-10 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <Stethoscope className="mb-3 h-12 w-12 text-blue-300" />
                    <p className="text-base font-semibold text-slate-700">No se encontraron mantenimientos</p>
                    <p className="mt-1 text-xs">Registre el primer mantenimiento desde el boton superior.</p>
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
