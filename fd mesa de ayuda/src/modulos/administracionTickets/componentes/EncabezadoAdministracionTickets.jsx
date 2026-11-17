import { FaHeadset } from "react-icons/fa";
import { HiOutlineClipboardDocumentCheck, HiOutlineSparkles } from "react-icons/hi2";

export default function EncabezadoAdministracionTickets({ fechaHora, totalVisible }) {
  const fecha = fechaHora instanceof Date ? fechaHora : new Date();
  return (
    <section className="support-hero relative overflow-hidden rounded-[28px] border border-blue-100 p-6 shadow-sm md:p-8">
      <div className="support-orb support-orb-one" />
      <div className="support-orb support-orb-two" />
      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4 md:items-center">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white/80 text-2xl text-blue-700 shadow-xl shadow-blue-200/50 backdrop-blur">
            <FaHeadset />
            <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
          </div>
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              <HiOutlineSparkles className="text-base" /> Centro de administración
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#0b2756] md:text-3xl">Administrador de soporte</h1>
            <p className="mt-1 text-sm text-slate-500">Supervisa, asigna y gestiona los tickets de la mesa.</p>
            <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/80 px-3 py-1 text-[11px] font-semibold text-emerald-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Servicio disponible · {fecha.toLocaleDateString()} · {fecha.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
        <div className="support-primary-button pointer-events-none cursor-default">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15"><HiOutlineClipboardDocumentCheck className="text-xl" /></span>
          <span><strong className="block text-sm">{totalVisible} tickets</strong><small className="block text-[10px] font-medium text-blue-100">Visibles para administrar</small></span>
        </div>
      </div>
    </section>
  );
}
