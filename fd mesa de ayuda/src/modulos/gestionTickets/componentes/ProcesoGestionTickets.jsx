import { API_BASE_URL } from '../../../config/api.js';
import { useState } from "react";

function ProcesoGestionTickets({ open, onClose, respuesta, setOpen, getTickets, logeo }) {
    const [estado, setEstado] = useState();
    const [cambioEstado, setCambioEstado] = useState("");
    const [verImagen, setVerImagen] = useState(false);
    const [zoom, setZoom] = useState(1);
    const postEstado = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/gestion-tickets/${respuesta.ID_TICKET}/estado`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        `Bearer ${logeo.token}`
                },
                body: JSON.stringify({
                    estado: estado,
                    observacion: cambioEstado
                })
            });
            if (!res.ok) throw new Error("No fue posible actualizar el ticket");
            await getTickets();
            setCambioEstado("");
        } catch (error) {
            console.log(error);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#061c3d]/65 p-4 backdrop-blur-md">
            <div className="support-modal max-h-[94vh] w-full max-w-5xl overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-2xl shadow-blue-950/40">
                {/* HEADER */}
                <div className="support-modal-header relative flex items-center justify-between overflow-hidden px-8 py-6 text-white">
                    <div>
                        <h2 className="text-2xl font-bold">
                            Gestión de Ticket
                        </h2>
                        <p className="text-blue-100 text-sm mt-1">
                            Panel de soporte técnico
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl hover:bg-white/15 transition"
                    >
                        ✕
                    </button>
                </div>

                {/* BODY */}
                <div className="max-h-[72vh] overflow-y-auto bg-[#f4f8ff] p-6 md:p-8">
                    {/* RESUMEN */}
                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-5 shadow-sm">
                            <p className="text-xs text-slate-400 font-semibold">
                                ID TICKET
                            </p>
                            <p className="text-2xl font-bold text-[#0b2756] mt-1">
                                TKT-{respuesta.ID_TICKET}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50 p-5 shadow-sm">
                            <p className="text-xs text-slate-400 font-semibold">
                                ESTADO ACTUAL
                            </p>
                            <span className="inline-block mt-2 px-4 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                {respuesta.ESTADO}
                            </span>
                        </div>

                        <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-white to-violet-50 p-5 shadow-sm">
                            <p className="text-xs text-slate-400 font-semibold">
                                PRIORIDAD
                            </p>
                            <span className="inline-block mt-2 px-4 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                {respuesta.PRIORIDAD || "SIN PRIORIDAD"}
                            </span>
                        </div>
                    </div>

                    {/* INFORMACIÓN */}
                    <div className="mb-6 rounded-[24px] border border-blue-100 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-[#0b2756] mb-5">
                            Información del Ticket
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <p className="text-xs text-slate-400 font-semibold">
                                    Dependencia
                                </p>
                                <p className="text-sm font-bold text-slate-700">
                                    {respuesta.AREA}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-400 font-semibold">
                                    Sede
                                </p>
                                <p className="text-sm font-bold text-slate-700">
                                    {respuesta.SEDE || "No registrada"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-400 font-semibold">
                                    Incidente
                                </p>
                                <p className="text-sm font-bold text-slate-700">
                                    {respuesta.INCIDENTE}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-400 font-semibold">
                                    IP / VNC
                                </p>
                                <p className="text-sm font-bold text-slate-700">
                                    {respuesta.DIRIP || "No registrada"}
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <p className="text-xs text-slate-400 font-semibold mb-2">
                                    Descripción
                                </p>
                                <div className="min-h-[90px] rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700">
                                    {respuesta.DESCRIPCION || "Sin descripción"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RESPUESTA Y ESTADO */}
                    <div className="rounded-[24px] border border-blue-100 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-[#0b2756] mb-5">
                            Respuesta y actualización
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-xs text-slate-400 font-semibold">
                                    Cambiar estado
                                </label>

                                <select
                                    value={estado}
                                    onChange={(e) => setEstado(e.target.value)}
                                    className="mt-2 w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value={0}>SELECCIONA ESTADO</option>
                                    <option value={2}>EN PROCESO</option>
                                    <option value={3}>SOLUCIONADO</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs text-slate-400 font-semibold">
                                    Soporte asignado
                                </label>

                                <input
                                    readOnly
                                    value={respuesta.USUARIO_ASIGNADO || "AÚN NO ASIGNADO"}
                                    className="mt-2 w-full h-12 rounded-2xl border border-slate-200 bg-slate-100 px-4 text-sm text-slate-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-xs text-slate-400 font-semibold">
                                    Respuesta / observación
                                </label>

                                <textarea
                                    placeholder="Escribe la respuesta o gestión realizada..."
                                    className="mt-2 w-full h-32 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none resize-none focus:ring-2 focus:ring-blue-400"
                                    value={cambioEstado}
                                    onChange={(e) => setCambioEstado(e.target.value)}
                                />
                            </div>

                            {respuesta.ARCHIVO_URL && <div className="md:col-span-2">
                                <label className="text-xs text-slate-400 font-semibold">
                                    imagen
                                </label>

                                <img
                                    src={respuesta.ARCHIVO_URL}
                                    alt="Evidencia"
                                    onClick={() => {
                                        setVerImagen(true);
                                        setZoom(1);
                                    }}
                                    className="w-40 h-40 object-cover rounded-xl border cursor-pointer hover:scale-105 transition"
                                />
                                {verImagen && (
                                    <div className="fixed inset-0 bg-black/80 z-[9999] flex flex-col items-center justify-center p-4">

                                        <div className="absolute top-5 right-5 flex gap-3">
                                            <button
                                                onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}
                                                className="px-4 py-2 bg-white rounded-xl font-bold"
                                            >
                                                Zoom -
                                            </button>

                                            <button
                                                onClick={() => setZoom((z) => Math.min(z + 0.2, 3))}
                                                className="px-4 py-2 bg-white rounded-xl font-bold"
                                            >
                                                Zoom +
                                            </button>

                                            <button
                                                onClick={() => setZoom(1)}
                                                className="px-4 py-2 bg-white rounded-xl font-bold"
                                            >
                                                Reset
                                            </button>

                                            <button
                                                onClick={() => setVerImagen(false)}
                                                className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        <div className="max-w-[95vw] max-h-[85vh] overflow-auto bg-white rounded-2xl p-3">
                                            <img
                                                src={respuesta.ARCHIVO_URL}
                                                alt="Evidencia ampliada"
                                                style={{
                                                    transform: `scale(${zoom})`,
                                                    transformOrigin: "center center",
                                                }}
                                                className="max-w-none transition-transform duration-200"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>}
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="flex flex-col-reverse gap-3 border-t border-blue-100 bg-white px-8 py-5 sm:flex-row sm:justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={() => {
                            postEstado();
                            setOpen(false);
                            alert("Estado actualizado correctamente!");
                        }}
                        className="px-8 py-3 rounded-2xl bg-gradient-to-r from-[#0b5fd3] to-[#1976ff] text-white font-bold shadow-lg hover:scale-105 hover:shadow-xl transition-all"
                    >
                        Guardar cambios
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProcesoGestionTickets;
