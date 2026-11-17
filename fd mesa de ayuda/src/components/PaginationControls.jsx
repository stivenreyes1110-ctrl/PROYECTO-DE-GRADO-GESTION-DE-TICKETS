import React from 'react';

export default function PaginationControls({ pagina, total, limite, onChange }) {
  const totalPaginas = Math.max(1, Math.ceil(total / limite));
  const inicio = total === 0 ? 0 : (pagina - 1) * limite + 1;
  const fin = Math.min(pagina * limite, total);

  return (
    <div className="flex flex-col gap-3 border-t border-blue-100 bg-white px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <span>
        Mostrando {inicio} - {fin} de {total} registros
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(pagina - 1)}
          disabled={pagina <= 1}
          className="rounded-lg border border-blue-100 px-3 py-1.5 font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Anterior
        </button>
        <span className="rounded-lg bg-blue-50 px-3 py-1.5 font-semibold text-blue-700">
          {pagina} / {totalPaginas}
        </span>
        <button
          type="button"
          onClick={() => onChange(pagina + 1)}
          disabled={pagina >= totalPaginas}
          className="rounded-lg border border-blue-100 px-3 py-1.5 font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
