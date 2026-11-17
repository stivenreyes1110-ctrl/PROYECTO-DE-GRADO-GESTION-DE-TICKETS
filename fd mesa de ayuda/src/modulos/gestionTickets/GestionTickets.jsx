import { API_BASE_URL } from '../../config/api.js';
import { useCallback, useEffect, useState } from "react";
import TarjetasGestionTickets from "./componentes/TarjetasGestionTickets";
import EncabezadoGestionTickets from "./componentes/EncabezadoGestionTickets";
import TablaGestionTickets from "./componentes/TablaGestionTickets";
import ProcesoGestionTickets from "./componentes/ProcesoGestionTickets";

function GestionTickets({ logeo, fechaHora, filtroTickets, setFiltroTickets }) {
   const [open, setOpen] = useState(false);
   const [respuesta, setRespuesta] = useState(null);
   const [tickets, setTickets] = useState([]);
   const [page, setPage] = useState(1);
   const [cargando, setCargando] = useState(false);
   const [error, setError] = useState("");

   const getTickets = useCallback(async () => {
      setCargando(true);
      setError("");
      try {
         const parametros = new URLSearchParams({
            pagina: String(page),
            limite: "10",
            estado: String(filtroTickets)
         });
         const res = await fetch(`${API_BASE_URL}/gestion-tickets?${parametros.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization":
              `Bearer ${logeo.token}`
          }
         });
         const data = await res.json();
         if (!res.ok) throw new Error(data?.mensaje || data?.error || `No fue posible consultar los tickets (${res.status}).`);
         setTickets(Array.isArray(data?.datos) ? data.datos : []);
      } catch (error) {
         setError(error.message || "Error de conexión con el servidor.");
      } finally {
         setCargando(false);
      }
   }, [filtroTickets, logeo.token, page]);

   useEffect(() => {
      // La consulta sincroniza el listado con página, filtro y cierre de modales.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      getTickets();
   }, [getTickets, open]);

   return (
      <div className="flex min-h-full w-full flex-col gap-5">

         <EncabezadoGestionTickets fechaHora={fechaHora} totalVisible={tickets.length} />

         <TarjetasGestionTickets
            logeo={logeo}
            open={open}
         />

         {error && (
            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
               {error}
            </div>
         )}

         <TablaGestionTickets
            setOpen={setOpen}
            tickets={tickets}
            page={page}
            setPage={setPage}
            filtroTickets={filtroTickets}
            setFiltroTickets={setFiltroTickets}
            setRespuesta={setRespuesta}
            cargando={cargando}
         />

         <ProcesoGestionTickets
            open={open}
            onClose={() => setOpen(false)}
            respuesta={respuesta}
            setOpen={setOpen}
            getTickets={getTickets}
            logeo={logeo}
         />
      </div>
   );
}

export default GestionTickets;
