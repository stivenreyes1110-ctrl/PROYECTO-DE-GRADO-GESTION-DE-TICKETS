import { API_BASE_URL } from '../../config/api.js';
import { useState } from "react";

import TarjetasSolicitud from "./componentes/TarjetasSolicitud";
import ModalSolicitud from "./componentes/ModalSolicitud";
import EncabezadoSolicitud from "./componentes/EncabezadoSolicitud";
import TablaSolicitud from "./componentes/TablaSolicitud";
import ModalEditarSolicitud from "./componentes/ModalEditarSolicitud";
import { useRenderProfiler } from "../../utils/logger";

function SolicitudSoporte({ 
   //VARIABLES DE USUARIO
   //VARIABLES DE LOGEO
   logeo,
   
   //VARIABLES DE TICKETS
   getTickets,
   tickets,
   paginacionTickets,
   page,
   setPage, 
   filtroTickets,
   setFiltroTickets,

   //VARIABLE DE AREAS
   getArea,
   areas, 

   //VARIABLE DE CONTEO
   getConteo,
   conteo,
   
   //VARIABLE DE SEDES
   getSede,
   sedes,

   //VARIABLE DE INCIDENTES
   getIncidentes,
   incidentes,

   //VARIABLE DE FECHA HORA
   fechaHora,
}) {
   useRenderProfiler("SolicitudSoporte", { page, filtroTickets });

   const [modalAbierto, setModalAbierto] = useState(false);
   const [ticketEditando, setTicketEditando] = useState(null);

   const actualizarTicket = async (id, datos) => {
      const respuesta = await fetch(`${API_BASE_URL}/solicitudes-soporte/${id}`, {
         method: "PUT",
         headers: { "Content-Type": "application/json", Authorization: `Bearer ${logeo.token}` },
         body: JSON.stringify(datos)
      });
      const resultado = await respuesta.json().catch(() => null);
      if (!respuesta.ok) throw new Error(resultado?.mensaje || "No se pudo actualizar el ticket");
      setTicketEditando(null);
      await Promise.all([getTickets(page, filtroTickets), getConteo()]);
   };

   const eliminarTicket = async (ticket) => {
      if (!window.confirm(`¿Eliminar el ticket #${ticket.ID_TICKET}?`)) return;
      const respuesta = await fetch(`${API_BASE_URL}/solicitudes-soporte/${ticket.ID_TICKET}`, {
         method: "DELETE", headers: { Authorization: `Bearer ${logeo.token}` }
      });
      const resultado = await respuesta.json().catch(() => null);
      if (!respuesta.ok) { alert(resultado?.mensaje || "No se pudo eliminar el ticket"); return; }
      await Promise.all([getTickets(page, filtroTickets), getConteo()]);
   };

   return (
      <div className="flex min-h-full w-full flex-col gap-5">

         {/* HEADER */}
         <EncabezadoSolicitud
            setModalAbierto={setModalAbierto}
            fechaHora={fechaHora}
         />

         {/* CARDS */}
         <TarjetasSolicitud
            logeo={logeo}
            getConteo={getConteo}
            conteo={conteo}
            
            modalAbierto={modalAbierto}
            setModalAbierto={setModalAbierto}
         />

         {/* TABLA */}
         <TablaSolicitud
            //VARIABLES DE TICKET POR USUARIO
            getTickets={getTickets}
            page={page}
            setPage={setPage}
            tickets={tickets}
            paginacion={paginacionTickets}
            setFiltroTickets={setFiltroTickets}
            filtroTickets={filtroTickets}
            onEditar={setTicketEditando}
            onEliminar={eliminarTicket}

         />

         {/* MODAL */}
         <ModalSolicitud
            //VARIABLE DE ABRIR
            modalAbierto={modalAbierto}
            setModalAbierto={setModalAbierto}

            //VARIBLE DE LOGEO
            logeo={logeo}

            //VARIABLES DE TICKET POR USUARIO
            getTickets={getTickets}
            page={page}

            //VARIABLES MODAL
            getArea={getArea}
            areas={areas}

            getSede={getSede}
            sedes={sedes}

            getIncidentes={getIncidentes}
            incidentes={incidentes}
         />

         {ticketEditando && (
            <ModalEditarSolicitud
              logeo={logeo}
               key={ticketEditando.ID_TICKET}
               ticket={ticketEditando}
               onClose={() => setTicketEditando(null)}
               onGuardar={actualizarTicket}
               areas={areas}
               sedes={sedes}
               incidentes={incidentes}
            />
         )}

      </div>
   );
}

export default SolicitudSoporte;
