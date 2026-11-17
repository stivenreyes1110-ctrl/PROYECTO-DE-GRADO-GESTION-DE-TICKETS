import { useMemo } from "react";
import { CalendarDays, Clock3, UserRound } from "lucide-react";

const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const claseEstado = { PENDIENTE: "border-amber-100 bg-amber-50 text-amber-700", "EN PROCESO": "border-blue-100 bg-blue-50 text-blue-700", FINALIZADO: "border-emerald-100 bg-emerald-50 text-emerald-700" };

export default function CronogramaResponsabilidades({ responsabilidades, periodo, onCambiarPeriodo, titulo = "Cronograma mensual", descripcion = "Actividades para el periodo seleccionado." }) {
  const { mes, anio } = periodo;
  const anioActual = new Date().getFullYear();
  const anios = Array.from({ length: 11 }, (_, i) => anioActual - 5 + i);
  const dias = Array.from({ length: new Date(anio, mes, 0).getDate() }, (_, i) => i + 1);
  const eventos = useMemo(() => responsabilidades.filter((item) => {
    const inicioMes = `${anio}-${String(mes).padStart(2, "0")}-01`;
    const finMes = `${anio}-${String(mes).padStart(2, "0")}-${String(dias.length).padStart(2, "0")}`;
    return item.fecha <= finMes && item.fechaFin >= inicioMes;
  }), [anio, dias.length, mes, responsabilidades]);
  const porDia = useMemo(() => eventos.reduce((grupo, item) => {
    const [anioInicio, mesInicio, diaInicio] = item.fecha.split("-").map(Number);
    const [anioFin, mesFin, diaFin] = item.fechaFin.split("-").map(Number);
    const primerDia = anioInicio === anio && mesInicio === mes ? diaInicio : 1;
    const ultimoDia = anioFin === anio && mesFin === mes ? diaFin : dias.length;
    for (let dia = primerDia; dia <= ultimoDia; dia += 1) {
      grupo[dia] = [...(grupo[dia] || []), item];
    }
    return grupo;
  }, {}), [anio, dias.length, eventos, mes]);

  return (
    <div className="space-y-4 p-4">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-blue-100 bg-white p-3 shadow-sm"><div className="flex items-center gap-3"><span className="rounded-xl bg-blue-600 p-2 text-white"><CalendarDays size={20} /></span><div><p className="text-[11px] font-bold uppercase text-slate-500">Periodo seleccionado</p><h2 className="font-bold capitalize">{meses[mes - 1]} {anio}</h2></div></div></div>
        <div className="rounded-xl border border-blue-100 bg-white p-3 shadow-sm"><p className="text-[11px] font-bold uppercase text-slate-500">Responsabilidades programadas</p><p className="mt-1 text-xl font-black text-blue-700">{eventos.length}</p></div>
        <div className="rounded-xl border border-blue-100 bg-white p-3 shadow-sm"><p className="text-[11px] font-bold uppercase text-slate-500">Días con actividad</p><p className="mt-1 text-xl font-black text-blue-700">{Object.keys(porDia).length}</p></div>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-blue-100 bg-white shadow-sm">
        <header className="flex flex-col gap-3 border-b border-blue-100 bg-gradient-to-r from-white to-blue-50 p-3 sm:flex-row sm:items-end sm:justify-between">
          <div><h3 className="text-sm font-bold">{titulo}</h3><p className="text-xs text-slate-500">{descripcion}</p></div>
          <div className="flex gap-2">
            <label className="text-[11px] font-bold text-slate-600">Mes<select value={mes} onChange={(e) => onCambiarPeriodo({ mes: Number(e.target.value), anio })} className="mt-1 block rounded-lg border border-blue-200 bg-white px-2 py-1.5 text-xs capitalize">{meses.map((nombre, i) => <option key={nombre} value={i + 1}>{nombre}</option>)}</select></label>
            <label className="text-[11px] font-bold text-slate-600">Año<select value={anio} onChange={(e) => onCambiarPeriodo({ mes, anio: Number(e.target.value) })} className="mt-1 block rounded-lg border border-blue-200 bg-white px-2 py-1.5 text-xs">{anios.map((valor) => <option key={valor}>{valor}</option>)}</select></label>
          </div>
        </header>
        <div className="grid grid-cols-2 gap-px bg-blue-100 p-px sm:grid-cols-4 lg:grid-cols-7">
          {dias.map((dia) => {
            const items = porDia[dia] || [];
            return <article key={dia} className="min-h-28 bg-white p-2 transition duration-300 hover:z-10 hover:bg-blue-50/40 hover:shadow-lg">
              <div className="mb-2 flex items-center justify-between"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[11px] font-black text-blue-700">{dia}</span><span className="text-[10px] text-blue-500">{items.length} evento{items.length === 1 ? "" : "s"}</span></div>
              <div className="space-y-2">{items.map((item) => <article key={item.id} className="w-full rounded-lg border border-blue-100 bg-blue-50/55 p-2"><p className="line-clamp-2 text-xs font-bold text-[#0b2756]">{item.titulo}</p><p className="mt-1 flex items-center gap-1 truncate text-[10px] text-blue-800"><UserRound size={11} />{item.responsable}</p><p className="mt-1 flex items-center gap-1 text-[10px] text-blue-800"><Clock3 size={11} />{item.frecuencia}</p><span className={`mt-1.5 inline-flex rounded-full border px-1.5 py-0.5 text-[8px] font-black ${claseEstado[item.estado] || claseEstado.PENDIENTE}`}>{item.estado}</span></article>)}{items.length === 0 && <div className="rounded-lg border border-dashed border-blue-100 p-2 text-center text-[10px] text-blue-500">Sin actividades</div>}</div>
            </article>;
          })}
        </div>
      </section>
    </div>
  );
}
