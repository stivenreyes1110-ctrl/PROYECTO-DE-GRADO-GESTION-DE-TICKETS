import { ArrowLeft } from 'lucide-react';
import ModalMantenimiento from './componentes/ModalMantenimiento';
import TablaMantenimientos from './componentes/TablaMantenimientos';
import TarjetasMantenimientos from './componentes/TarjetasMantenimientos';
import TarjetasSedesMantenimiento from './componentes/TarjetasSedesMantenimiento';

export default function Mantenimientos({
  mantenimientos,
  resumenMantenimientos,
  totalMantenimientos,
  paginaMantenimientos,
  registrosPorPagina,
  anioMantenimientos,
  sedesMantenimientos = [],
  sedeMantenimientos,
  onCambiarSede,
  onCambiarPagina,
  onEditarMantenimiento,
  onEliminarMantenimiento,
  modalMantenimientoAbierto,
  onCerrarModalMantenimiento,
  onGuardarMantenimiento,
  mantenimientoEditando,
  activos
}) {
  const sedeSeleccionada = sedesMantenimientos.find(
    (sede) => Number(sede.IDSEDE) === Number(sedeMantenimientos)
  );

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <TarjetasMantenimientos
        mantenimientos={mantenimientos}
        resumen={resumenMantenimientos}
        total={totalMantenimientos}
      />
 {/*
      <section className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Periodo de mantenimiento</h3>
          <p className="mt-1 text-xs text-slate-500">Seleccione el año que desea consultar.</p>
        </div>
       <select
          value={anioMantenimientos ?? ''}
          onChange={(evento) => onCambiarAnio?.(evento.target.value ? Number(evento.target.value) : null)}
          className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 outline-none focus:ring-2 focus:ring-blue-500"
        >
        <option value="">Resumen general</option>
          {aniosMantenimientos.map((anio) => (
            <option key={anio} value={anio}>{anio}</option>
          ))}
        </select>
      </section>*/}

      {!sedeMantenimientos && (
        <TarjetasSedesMantenimiento
          sedes={sedesMantenimientos}
          onSeleccionar={onCambiarSede}
        />
      )}

      {sedeMantenimientos && (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600">{anioMantenimientos || 'Todos los años'}</p>
              <h3 className="text-base font-bold text-slate-900">
                {sedeSeleccionada?.NOMBRESEDE || 'Sede seleccionada'}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onCambiarSede?.(null)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-100 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
            >
              <ArrowLeft size={16} /> Volver a sedes
            </button>
          </div>

          <TablaMantenimientos
            mantenimientos={mantenimientos}
            onEdit={onEditarMantenimiento}
            onDelete={onEliminarMantenimiento}
            pagina={paginaMantenimientos}
            total={totalMantenimientos}
            limite={registrosPorPagina}
            onCambiarPagina={onCambiarPagina}
          />
        </section>
      )}

      <ModalMantenimiento
        isOpen={modalMantenimientoAbierto}
        onClose={onCerrarModalMantenimiento}
        onSave={onGuardarMantenimiento}
        editItem={mantenimientoEditando}
        activos={activos}
      />
    </div>
  );
}
