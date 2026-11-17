import { useEffect } from "react";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import { LuClock9 } from "react-icons/lu";
import { MdChecklist } from "react-icons/md";
import { FaBoxesStacked } from "react-icons/fa6";

const estilosEstado = {
  "POR ASIGNAR": { accent: "from-blue-500 to-indigo-600", soft: "bg-blue-50 text-blue-700", icon: HiOutlineClipboardDocumentList },
  "EN PROCESO": { accent: "from-cyan-500 to-blue-600", soft: "bg-cyan-50 text-cyan-700", icon: LuClock9 },
  "SOLUCIONADO": { accent: "from-emerald-500 to-teal-600", soft: "bg-emerald-50 text-emerald-700", icon: MdChecklist },
  "TOTAL GENERAL": { accent: "from-violet-500 to-indigo-600", soft: "bg-violet-50 text-violet-700", icon: FaBoxesStacked }
};

export default function TarjetasSolicitud({ getConteo, conteo = [], modalAbierto }) {
  useEffect(() => {
    getConteo();
  }, [getConteo, modalAbierto]);

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {conteo.map((item) => {
        const estilo = estilosEstado[item.ESTADO] || estilosEstado["POR ASIGNAR"];
        const Icono = estilo.icon;
        return (
          <article key={item.ESTADO} className="support-magic-card group">
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${estilo.accent}`} />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{item.ESTADO}</p>
                <p className="mt-3 text-4xl font-black tracking-tight text-[#0b2756]">{item.TOTAL}</p>
                <p className="mt-2 text-xs text-slate-400">Solicitudes registradas</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl transition duration-300 group-hover:scale-110 group-hover:-rotate-3 ${estilo.soft}`}>
                <Icono />
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
