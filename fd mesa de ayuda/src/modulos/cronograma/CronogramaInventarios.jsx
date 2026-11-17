import { useMemo } from 'react';
import { CalendarDays, Clock, MapPin } from 'lucide-react';

const meses = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre'
];

const obtenerActivo = (evento) => {
  const placa = evento.PLACA ? ` - ${evento.PLACA}` : '';
  const marca = evento.MARCA ? ` ${evento.MARCA}` : '';
  const modelo = evento.MODELO ? ` ${evento.MODELO}` : '';

  return `${evento.CATEGORIA || 'Activo'}${marca}${modelo}${placa}`;
};

const obtenerClaseEstado = (estado = '') => {
  if (estado === 'FINALIZADO') return 'border-blue-100 bg-blue-50 text-blue-700';
  if (estado === 'EN PROCESO') return 'border-amber-100 bg-amber-50 text-amber-700';
  return 'border-slate-100 bg-slate-50 text-slate-600';
};

export default function CronogramaInventarios({ eventos = [], cargando = false, mes, anio, onCambiarPeriodo, onEditarMantenimiento }) {
  const nombreMes = meses[mes - 1];
  const diasDelMes = new Date(anio, mes, 0).getDate();
  const anioActual = new Date().getFullYear();
  const anios = Array.from({ length: 11 }, (_, indice) => anioActual - 5 + indice);

  const eventosPorDia = useMemo(() => {
    return eventos.reduce((agrupados, evento) => {
      const dia = Number(evento.DIA || new Date(evento.FECHA).getDate());
      if (!agrupados[dia]) agrupados[dia] = [];
      agrupados[dia].push(evento);
      return agrupados;
    }, {});
  }, [eventos]);

  const dias = Array.from({ length: diasDelMes }, (_, indice) => indice + 1);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="support-magic-card group">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 transition duration-300 group-hover:scale-110 group-hover:-rotate-3">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Periodo seleccionado</p>
              <h2 className="text-base font-bold capitalize text-slate-900">{nombreMes} {anio}</h2>
            </div>
          </div>
        </article>

        <article className="support-magic-card">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Mantenimientos programados</p>
          <p className="mt-3 text-4xl font-black text-[#0b2756]">{eventos.length}</p>
        </article>

        <article className="support-magic-card">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Días con actividad</p>
          <p className="mt-3 text-4xl font-black text-[#0b2756]">{Object.keys(eventosPorDia).length}</p>
        </article>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-blue-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-blue-100 bg-gradient-to-r from-white to-blue-50/60 p-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Cronograma mensual de inventarios</h3>
            <p className="text-xs text-slate-500">Fechas tomadas desde los mantenimientos del periodo seleccionado.</p>
          </div>
          <div className="flex gap-2">
            <label className="text-[11px] font-semibold text-slate-600">Mes
              <select value={mes} onChange={(evento) => onCambiarPeriodo?.({ mes: Number(evento.target.value), anio })} className="mt-1 block rounded-lg border border-blue-200 bg-white px-2 py-1.5 text-xs capitalize text-slate-700 outline-none focus:ring-2 focus:ring-blue-500">
                {meses.map((nombre, indice) => <option key={nombre} value={indice + 1}>{nombre}</option>)}
              </select>
            </label>
            <label className="text-[11px] font-semibold text-slate-600">Año
              <select value={anio} onChange={(evento) => onCambiarPeriodo?.({ mes, anio: Number(evento.target.value) })} className="mt-1 block rounded-lg border border-blue-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-blue-500">
                {anios.map((valor) => <option key={valor} value={valor}>{valor}</option>)}
              </select>
            </label>
          </div>
        </div>

        {cargando ? (
          <div className="p-8 text-center text-sm text-slate-500">Cargando cronograma...</div>
        ) : (
          <div className="grid grid-cols-2 gap-px bg-blue-100 p-px sm:grid-cols-4 lg:grid-cols-7">
            {dias.map((dia) => {
              const eventosDia = eventosPorDia[dia] || [];

              return (
                <article key={dia} className="min-h-24 bg-white p-2 transition duration-300 hover:z-10 hover:bg-blue-50/40 hover:shadow-lg">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-[11px] font-bold text-blue-700">
                      {dia}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {eventosDia.length} evento{eventosDia.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {eventosDia.length > 0 ? (
                      eventosDia.map((evento) => (
                        <button key={evento.ID} type="button" onClick={() => onEditarMantenimiento?.(evento)} className="w-full rounded-lg border border-blue-100 bg-blue-50/60 p-1.5 text-left transition duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" title="Editar mantenimiento">
                          <p className="line-clamp-2 text-xs font-semibold text-slate-800">{obtenerActivo(evento)}</p>
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                            <Clock className="h-3 w-3 text-blue-500" />
                            <span>{evento.TIPOMANTENIMIENTO || 'Mantenimiento'}</span>
                          </div>
                          <div className="mt-1 hidden items-start gap-1 text-[11px] text-slate-500 xl:flex">
                            <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-blue-500" />
                            <span className="line-clamp-2">
                              {evento.NOMBRESEDE || 'Sin sede'} / {evento.NOMBREAREA || 'Sin area'}
                            </span>
                          </div>
                          <span className={`mt-1.5 inline-flex rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${obtenerClaseEstado(evento.ESTADO)}`}>
                            {evento.ESTADO || 'PENDIENTE'}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="rounded-lg border border-dashed border-blue-100 p-2 text-center text-[10px] text-slate-400">
                        Sin inventarios
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
