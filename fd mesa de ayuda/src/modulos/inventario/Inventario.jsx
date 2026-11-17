import ModalActivo from './componentes/ModalActivo';
import ModalHojaVidaEquipo from './componentes/ModalHojaVidaEquipo';
import EncabezadoInventario from './componentes/EncabezadoInventario';
import TablaInventario from './componentes/TablaInventario';
import TarjetasInventario from './componentes/TarjetasInventario';

export default function Inventario({
  logeo,
  activos,
  cargando,
  totalInventario,
  resumenInventario,
  paginaInventario,
  registrosPorPagina,
  onCambiarPagina,
  onEditarActivo,
  onEliminarActivo,
  onGuardarActivo,
  modalActivoAbierto,
  onCerrarModalActivo,
  activoEditando,
  areas,
  sedes,
  idMesa,
  onAbrirHojaVida,
  modalHojaVidaAbierto,
  onCerrarHojaVida,
  activoHojaVida,
  mantenimientosHojaVida,
  onNuevoActivo
}) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <EncabezadoInventario onNuevoActivo={onNuevoActivo} idMesa={idMesa} />
      <TarjetasInventario resumen={resumenInventario} />

      {cargando ? (
        <div className="rounded-2xl border border-blue-100 bg-white p-8 text-center text-slate-500 shadow-sm">
          Cargando inventario...
        </div>
      ) : (
        <TablaInventario
          activos={activos}
          onEdit={onEditarActivo}
          onDelete={onEliminarActivo}
          onLifeSheet={onAbrirHojaVida}
          pagina={paginaInventario}
          total={totalInventario}
          limite={registrosPorPagina}
          onCambiarPagina={onCambiarPagina}
        />
      )}

      <ModalActivo
        isOpen={modalActivoAbierto}
        onClose={onCerrarModalActivo}
        onSave={onGuardarActivo}
        editItem={activoEditando}
        areas={areas}
        sedes={sedes}
        idMesa={idMesa}
      />

      <ModalHojaVidaEquipo
        logeo={logeo}
        isOpen={modalHojaVidaAbierto}
        onClose={onCerrarHojaVida}
        activo={activoHojaVida}
        mantenimientos={mantenimientosHojaVida}
      />
    </div>
  );
}
