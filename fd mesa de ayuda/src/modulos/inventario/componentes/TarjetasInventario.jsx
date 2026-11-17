import { ClipboardList, Layers, MapPin, MonitorCog } from 'lucide-react'

export default function TarjetasInventario({ resumen = {} }) {
  const cards = [
    { title: 'Activos', value: resumen.total || 0, detail: 'Total en inventario', icon: ClipboardList, accent: 'from-blue-500 to-indigo-600', soft: 'bg-blue-50 text-blue-700' },
    { title: 'Categorías', value: resumen.categorias || 0, detail: 'Total en inventario', icon: Layers, accent: 'from-violet-500 to-indigo-600', soft: 'bg-violet-50 text-violet-700' },
    { title: 'Áreas', value: resumen.areas || 0, detail: 'Total en inventario', icon: MapPin, accent: 'from-emerald-500 to-teal-600', soft: 'bg-emerald-50 text-emerald-700' },
    { title: 'Sedes', value: resumen.sedes || 0, detail: 'Total en inventario', icon: MonitorCog, accent: 'from-amber-500 to-orange-600', soft: 'bg-amber-50 text-amber-700' },
  ]

  return (
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
              <Icon size={22} />
            </div>
          </div>
        </article>
      ))}
    </section>
  )
}
