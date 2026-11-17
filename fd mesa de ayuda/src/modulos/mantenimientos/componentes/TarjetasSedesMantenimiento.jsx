import { Building2, MonitorCheck } from 'lucide-react';

export default function TarjetasSedesMantenimiento({ sedes = [], onSeleccionar }) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-blue-100 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900">Avance de inventarios por sede</h3>
        <p className="mt-1 text-xs text-slate-500">
          Computadores inventariados y mantenimientos finalizados en cada sede.
        </p>
      </div>

      {sedes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-8 text-center text-sm text-slate-500">
          No hay sedes registradas para mostrar.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sedes.map((sede) => {
            const total = Number(sede.TOTALCOMPUTADORES) || 0;
            const completados = Number(sede.COMPUTADORESCONMANTENIMIENTO) || 0;
            const porcentaje = Math.min(100, Math.max(0, Number(sede.PORCENTAJE) || 0));

            return (
              <button
                key={sede.IDSEDE}
                type="button"
                onClick={() => onSeleccionar?.(sede.IDSEDE)}
                className="support-magic-card group text-left"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Sede</p>
                    <h4 className="mt-1 text-base font-bold text-slate-900">
                      {sede.NOMBRESEDE || 'Sede sin nombre'}
                    </h4>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 transition duration-300 group-hover:scale-110 group-hover:-rotate-3">
                    <Building2 size={19} />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-slate-500">Computadores</p>
                    <p className="mt-1 text-xl font-bold text-slate-900">{total}</p>
                  </div>
                  <div className="rounded-xl bg-blue-50 p-3">
                    <p className="text-blue-600">Finalizados</p>
                    <p className="mt-1 text-xl font-bold text-blue-700">{completados}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-slate-600">
                    <MonitorCheck size={15} /> Avance
                  </span>
                  <span className="font-bold text-blue-700">{porcentaje}%</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-blue-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-700"
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
