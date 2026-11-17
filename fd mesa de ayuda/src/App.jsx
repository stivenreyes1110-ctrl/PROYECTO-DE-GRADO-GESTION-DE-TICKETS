import { API_BASE_URL } from './config/api.js';
import { useCallback, useState, useEffect } from 'react';

import Slider from './slider';
import Login from './login';
import logger, { profileFetch } from './utils/logger';

import './App.css';



// ======================================================
// 2. COMPONENTE PRINCIPAL
// ======================================================
function App() {



  // ======================================================
  // 2.1 CONFIGURACIÓN GENERAL
  // ======================================================



  // ======================================================
  // 2.2 VARIABLES DE AUTENTICACIÓN
  // ======================================================

  const [logeado, setLogeado] = useState(false);

  const [logeo, setLogeo] = useState([]);




  // ======================================================
  // 2.3 VARIABLES MAESTRAS
  // ======================================================

  const [areas, setAreas] = useState([]);

  const [sedes, setSedes] = useState([]);

  const [incidentes, setIncidentes] = useState([]);




  // ======================================================
  // 2.4 VARIABLES DE TICKETS
  // ======================================================

  const [tickets, setTickets] = useState([]);

  const [filtroTickets, setFiltroTickets] = useState('1');

  const [page, setPage] = useState(1);
  const [paginacionTickets, setPaginacionTickets] = useState({
    pagina: 1,
    limite: 10,
    total: 0,
    totalPaginas: 0
  });




  // ======================================================
  // 2.5 VARIABLES DE DASHBOARD
  // ======================================================

  const [conteo, setConteo] = useState([]);




  // ======================================================
  // 2.6 VARIABLES DERIVADAS
  // ======================================================

  const cerrarSesion = useCallback(() => {
    setLogeado(false);
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  }, []);




  // ======================================================
  // 3. INICIALIZACIÓN DE SESIÓN
  // ======================================================

  useEffect(() => {

    const iniciarFetchPrincipales = async () => {

      try {

        const usuarioGuardado =
          localStorage.getItem("usuario");



        if (usuarioGuardado) {

          const usuario =
            JSON.parse(usuarioGuardado);

          if (Number(usuario.versionAcceso) !== 2) {
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            return;
          }

          setLogeo(usuario);

          setLogeado(true);

          logger.info(
            "AUTH",
            "SE ESTAN INCIANDO LOS FETCH PRINCIPALES"
          );

          logger.info(
            "AUTH",
            "1.DATOS DE LOGEO:",
            usuario
          );

        }

      } catch (error) {

        logger.error(
          "AUTH",
          "Error al iniciar sesión:",
          error
        );

      }

    };

    iniciarFetchPrincipales();

  }, []);




  // ======================================================
  // 4. FETCH AREAS
  // ======================================================

  const getArea = useCallback(async () => {

    try {

      const respuesta = await profileFetch(
        `${API_BASE_URL}/areas`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization":
              `Bearer ${logeo.token}`
          }
        }
      );

      if (!respuesta.ok) {

        throw new Error(
          "Error al obtener áreas"
        );

      }

      const data =
        await respuesta.json();

      setAreas(data);

      logger.info(
        "FETCH_AREAS",
        "2.DATOS DE ÁREAS:",
        data
      );

      return data;

    } catch (error) {

      logger.error("FETCH_AREAS", "Falla al obtener áreas", error);

      cerrarSesion();

    }

  }, [logeo.token, cerrarSesion]);




  // ======================================================
  // 5. FETCH SEDES
  // ======================================================

  const getSede = useCallback(async () => {

    try {

      const respuesta = await profileFetch(
        `${API_BASE_URL}/sedes`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization":
              `Bearer ${logeo.token}`
          }
        }
      );

      const data =
        await respuesta.json();

      setSedes(data);

      logger.info(
        "FETCH_SEDES",
        "3.DATOS DE SEDES:",
        data
      );

      return data;

    } catch (error) {

      logger.error("FETCH_SEDES", "Falla al obtener sedes", error);

      cerrarSesion();

    }

  }, [logeo.token, cerrarSesion]);




  // ======================================================
  // 7. FETCH INCIDENTES
  // ======================================================

  const getIncidentes = useCallback(async () => {

    try {

      const respuesta = await profileFetch(
        `${API_BASE_URL}/incidentes`,
        {
          method: "GET",
          headers: {
            "Content-Type":
              "application/json",
            "Authorization":
              `Bearer ${logeo.token}`
          }
        }
      );

      const data =
        await respuesta.json();

      setIncidentes(data);

      logger.info(
        "FETCH_INCIDENTES",
        "5.DATOS DE INCIDENTES:",
        data
      );

      return data;

    } catch (error) {

      logger.error("FETCH_INCIDENTES", "Falla al obtener incidentes", error);

      cerrarSesion();

    }

  }, [logeo.token, cerrarSesion]);




  // ======================================================
  // 8. FETCH TICKETS
  // ======================================================

  const getTickets = useCallback(async (
    page,
    filtro = filtroTickets,
    filtrosColumnas = {}
  ) => {

    try {
      const parametros = new URLSearchParams({
        pagina: String(page),
        limite: "10",
        estado: String(filtro)
      });

      Object.entries(filtrosColumnas).forEach(([nombre, valor]) => {
        if (nombre !== "tiempo" && String(valor || "").trim()) {
          const nombreParametro = nombre === "estado" ? "estadoTexto" : nombre;
          parametros.set(nombreParametro, String(valor).trim());
        }
      });

      const respuesta = await profileFetch(
        `${API_BASE_URL}/solicitudes-soporte?${parametros.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type":
              "application/json",
            "Authorization":
              `Bearer ${logeo.token}`
          }
        }
      );

      const data =
        await respuesta.json();

      setTickets(data.datos || []);
      setPaginacionTickets(data.paginacion || {
        pagina: page,
        limite: 10,
        total: 0,
        totalPaginas: 0
      });

      logger.info(
        "FETCH_TICKETS",
        "6.DATOS DE TICKETS:",
        data
      );

      return data.datos || [];

    } catch (error) {

      logger.error("FETCH_TICKETS", "Falla al obtener tickets", error);

      cerrarSesion();

    }

  }, [filtroTickets, logeo.token, cerrarSesion]);




  // ======================================================
  // 9. FETCH CONTEO DASHBOARD
  // ======================================================

  const getConteo = useCallback(async () => {

    try {

      const respuesta = await profileFetch(
        `${API_BASE_URL}/solicitudes-soporte/resumen`,
        {
          method: "GET",
          headers: {
            "Content-Type":
              "application/json",
            "Authorization":
              `Bearer ${logeo.token}`
          }
        }
      );

      const data = await respuesta.json();

      setConteo(data.datos || []);

      logger.info(
        "FETCH_CONTEO",
        "7.DATOS DE CONTEO:",
        data
      );

      return data.datos || [];

    } catch (error) {

      logger.error("FETCH_CONTEO", "Falla al obtener conteo", error);

      cerrarSesion();

    }

  }, [logeo.token, cerrarSesion]);




  // ======================================================
  // 11. RENDER PRINCIPAL
  // ======================================================

  return (
    <>
      {logeado ? (

        <Slider

          // AUTENTICACIÓN
          logeo={logeo}
          setLogeado={setLogeado}

          // TICKETS
          getTickets={getTickets}
          tickets={tickets}
          paginacionTickets={paginacionTickets}
          page={page}
          setPage={setPage}
          filtroTickets={filtroTickets}
          setFiltroTickets={setFiltroTickets}

          // DASHBOARD
          getConteo={getConteo}
          conteo={conteo}

          // ÁREAS
          getArea={getArea}
          areas={areas}

          // SEDES
          getSede={getSede}
          sedes={sedes}

          // INCIDENTES
          getIncidentes={getIncidentes}
          incidentes={incidentes}

        />

      ) : (

        <Login
          setLogeado={setLogeado}
          setLogeo={setLogeo}
        />

      )}
    </>
  );

}



// ======================================================
// 12. EXPORTACIÓN
// ======================================================
export default App;
