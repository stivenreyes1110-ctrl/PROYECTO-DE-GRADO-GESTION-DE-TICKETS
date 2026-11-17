import { Activity, CheckCircle2, Clock3, ListChecks, LoaderCircle } from 'lucide-react';

const normalizarEstado = (estado = '') => {
  return String(estado).trim().toUpperCase();
};

export default function TarjetasMantenimientos({ mantenimientos = [], resumen = null, total = null }) {
  const totalRegistros = total ?? mantenimientos.length;
  const pendientes = resumen?.PENDIENTES ?? mantenimientos.filter((item) => normalizarEstado(item.ESTADO) === 'PENDIENTE').length;
  const enProceso = resumen?.ENPROCESO ?? mantenimientos.filter((item) => normalizarEstado(item.ESTADO) === 'EN PROCESO').length;
  const finalizados = resumen?.FINALIZADOS ?? mantenimientos.filter((item) => normalizarEstado(item.ESTADO) === 'FINALIZADO').length;
  const porcentajeAvance = totalRegistros > 0 ? Math.round((finalizados / totalRegistros) * 100) : 0;

  const cards = [
    {
      title: 'Mantenimientos',
      value: totalRegistros,
      detail: 'Registros totales',
      icon: ListChecks,
      accent: 'from-blue-500 to-indigo-600',
      soft: 'bg-blue-50 text-blue-700'
    },
    {
      title: 'Pendientes',
      value: pendientes,
      detail: 'Por iniciar',
      icon: Clock3,
      accent: 'from-amber-500 to-orange-600',
      soft: 'bg-amber-50 text-amber-700'
    },
    {
      title: 'En proceso',
      value: enProceso,
      detail: 'Actualmente activos',
      icon: LoaderCircle,
      accent: 'from-cyan-500 to-blue-600',
      soft: 'bg-cyan-50 text-cyan-700'
    },
    {
      title: 'Finalizados',
      value: finalizados,
      detail: 'Trabajos cerrados',
      icon: CheckCircle2,
      accent: 'from-emerald-500 to-teal-600',
      soft: 'bg-emerald-50 text-emerald-700'
    }
  ];

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ title, value, detail, icon: Icon, accent, soft }) => (
          <article key={title} className="support-magic-card group">
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{title}</p>
                <p className="mt-3 text-4xl font-black tracking-tight text-[#0b2756]">{value}</p>
                <p className="mt-2 text-xs text-slate-400">{detail}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl transition duration-300 group-hover:scale-110 group-hover:-rotate-3 ${soft}`}>
                <Icon size={22} className={title === 'En proceso' ? 'group-hover:animate-spin' : ''} />
              </div>
            </div>
          </article>
        ))}
      </section>

      <div className="support-magic-card group">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 transition duration-300 group-hover:scale-110">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Porcentaje de avance</p>
              <p className="mt-1 text-3xl font-black text-[#0b2756]">{porcentajeAvance}%</p>
              <p className="mt-1 text-xs text-slate-500">
                {finalizados} de {totalRegistros} mantenimientos finalizados
              </p>
            </div>
          </div>

          <div className="w-full sm:max-w-sm">
            <div className="h-3 overflow-hidden rounded-full bg-blue-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-700"
                style={{ width: `${porcentajeAvance}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
