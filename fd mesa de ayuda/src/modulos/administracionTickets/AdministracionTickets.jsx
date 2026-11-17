import { API_BASE_URL } from '../../config/api.js';
import { useCallback, useEffect, useState } from "react";
import TarjetasAdministracionTickets from "./componentes/TarjetasAdministracionTickets";
import ModalAdministracionTickets from "./componentes/ModalAdministracionTickets";
import EncabezadoAdministracionTickets from "./componentes/EncabezadoAdministracionTickets";
import TablaAdministracionTickets from "./componentes/TablaAdministracionTickets";
import AsignacionAdministracionTickets from "./componentes/AsignacionAdministracionTickets";
import ProcesoAdministracionTickets from "./componentes/ProcesoAdministracionTickets";

function AdministracionTickets({ logeo, fechaHora, filtroTickets, setFiltroTickets }) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [abrir, setAbrir] = useState(false);
  const [seleccionTicket, setSeleccionTicket] = useState(null);
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
      const respuestaHttp = await fetch(
        `${API_BASE_URL}/administracion-tickets?${parametros.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${logeo.token}`
          }
        }
      );
      const datos = await respuestaHttp.json();
      if (!respuestaHttp.ok) {
        throw new Error(datos?.mensaje || "No fue posible consultar los tickets.");
      }
      setTickets(Array.isArray(datos?.datos) ? datos.datos : []);
    } catch (errorConsulta) {
      setError(errorConsulta.message || "Error de conexión con el servidor.");
    } finally {
      setCargando(false);
    }
  }, [filtroTickets, logeo.token, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getTickets();
  }, [getTickets, abrir, open, modalAbierto]);

  return (
    <div className="flex min-h-full w-full flex-col gap-5">
      <EncabezadoAdministracionTickets
        fechaHora={fechaHora}
        totalVisible={tickets.length}
      />

      <TarjetasAdministracionTickets
        logeo={logeo}
        modalAbierto={modalAbierto}
        open={open}
      />

      {error && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <TablaAdministracionTickets
        setAbrir={setAbrir}
        setSeleccionTicket={setSeleccionTicket}
        setOpen={setOpen}
        setRespuesta={setRespuesta}
        tickets={tickets}
        page={page}
        setPage={setPage}
        filtroTickets={filtroTickets}
        setFiltroTickets={setFiltroTickets}
        cargando={cargando}
      />

      <AsignacionAdministracionTickets
        logeo={logeo}
        abrir={abrir}
        setAbrir={setAbrir}
        seleccionTicket={seleccionTicket}
        tickets={tickets}
        getTickets={getTickets}
        page={page}
        setPage={setPage}
      />

      <ModalAdministracionTickets
        modalAbierto={modalAbierto}
        setModalAbierto={setModalAbierto}
        tickets={tickets}
        getTickets={getTickets}
        page={page}
        setPage={setPage}
      />

      <ProcesoAdministracionTickets
        open={open}
        onClose={() => setOpen(false)}
        respuesta={respuesta}
        setOpen={setOpen}
        tickets={tickets}
        getTickets={getTickets}
        page={page}
        setPage={setPage}
        logeo={logeo}
      />
    </div>
  );
}

export default AdministracionTickets;
