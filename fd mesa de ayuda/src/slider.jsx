import { useState } from "react";
import SolicitudSoporte from "./modulos/solicitudSoporte/SolicitudSoporte";
import { FaRegBell } from "react-icons/fa";
import { IoChevronBack, IoChevronForward, IoLogOutOutline } from "react-icons/io5";
import {
  FaChartBar, FaTools
} from "react-icons/fa";
import { AiOutlineFileProtect } from 'react-icons/ai'
import { GiTakeMyMoney } from "react-icons/gi";
import GestionTickets from "./modulos/gestionTickets/GestionTickets";
import { FaComputer } from "react-icons/fa6";
import logo from "./assets/logo.png"
import Indicadores from "./modulos/indicadores/Indicadores";
import AdministracionTickets from "./modulos/administracionTickets/AdministracionTickets"
import { useEffect } from "react";
import { FaPersonDrowning } from "react-icons/fa6";
import ModulosOperativos from "./modulos/operaciones/ModulosOperativos";
import ResponsabilidadesArea from "./modulos/responsabilidades/ResponsabilidadesArea";
import Configuracion from "./modulos/configuracion/Configuracion";

const ROLES = Object.freeze({
  ADMIN: 1,
  SOPORTE: 2,
  USUARIO: 3
});

function Slider({
  // VARIABLES DE LOGEO
  logeo,
  setLogeado,


  // VARIABLES DE TICKETS
  getTickets,
  page, setPage,
  tickets,
  paginacionTickets,
  filtroTickets, setFiltroTickets,


  // VARIABLES DE CONTEO
  getConteo, conteo,


  //VARIABLES DE MODAL
  getArea, areas,
  getSede, sedes,
  getIncidentes, incidentes


}) {

  const [vista, setVista] = useState("inicio")
  const [open, setOpen] = useState(true);
  const rolActual = Number(logeo.idrol);
  const enlaces = [


    {
      nombre: "Solicitudes de Soporte",
      vista: "mesa",
      logo: <AiOutlineFileProtect className="m-2 text-lg" />,
      roles: [ROLES.ADMIN, ROLES.SOPORTE, ROLES.USUARIO]
    },

    {
      nombre: "Gestión Tickets",
      vista: "gestion",
      logo: <FaComputer className="m-2 text-lg" />,
      roles: [ROLES.ADMIN, ROLES.SOPORTE]
    },{
      nombre: "Administrador Soporte",
      vista: "Administrador",
      logo: <GiTakeMyMoney className="m-2 text-lg" />,
      roles: [ROLES.ADMIN]
    },
    {
      nombre: "Inventario de area",
      vista: "inventario",
      logo: <GiTakeMyMoney className="m-2 text-lg" />,
      roles: [ROLES.ADMIN, ROLES.SOPORTE]
    },

    {
      nombre: "Mantenimientos",
      vista: "mantenimientos",
      logo: <FaTools className="m-2 text-lg" />,
      roles: [ROLES.ADMIN, ROLES.SOPORTE]
    },

    {
      nombre: "Cronograma",
      vista: "cronograma",
      logo: <FaRegBell className="m-2 text-lg" />,
      roles: [ROLES.ADMIN, ROLES.SOPORTE]
    },

    {
      nombre: "Indicadores",
      vista: "panel",
      logo: <FaChartBar className="text-lg" />,
      roles: [ROLES.ADMIN, ROLES.SOPORTE]
    },

    {
      nombre: "Pendientes",
      vista: "responsabilidades",
      logo: <AiOutlineFileProtect className="text-lg" />,
      roles: [ROLES.ADMIN, ROLES.SOPORTE]
    },
    {
      nombre: "Gestión de usuarios",
      vista: "configuracion",
      logo: <FaPersonDrowning className="text-lg" />,
      roles: [ROLES.ADMIN]
    }
  ];

  const enlacesFiltrados = enlaces.filter(item =>
    item.roles.includes(rolActual)
  );

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setLogeado(false);
  };

  const navegar = (item) => {
    if (!item.roles.includes(rolActual)) return;
    if (item.url) {
      window.open(item.url, "_blank", "noopener,noreferrer");
    } else {
      if (item.vista === "mesa") {
        setFiltroTickets("1");
        setPage(1);
      }
      setVista(item.vista);
    }
  };

  const renderVista = () => {
    switch (vista) {


      case "mesa":
        return <SolicitudSoporte logeo={logeo} getTickets={getTickets} page={page} setPage={setPage} tickets={tickets} paginacionTickets={paginacionTickets} getConteo={getConteo} conteo={conteo} getArea={getArea} areas={areas} getSede={getSede} sedes={sedes} getIncidentes={getIncidentes} incidentes={incidentes} fechaHora={fechaHora} filtroTickets={filtroTickets} setFiltroTickets={setFiltroTickets} />;

      case "gestion":
        return <GestionTickets logeo={logeo} fechaHora={fechaHora} filtroTickets={filtroTickets} setFiltroTickets={setFiltroTickets} />;

      case "Administrador":
        return <AdministracionTickets logeo={logeo} fechaHora={fechaHora} filtroTickets={filtroTickets} setFiltroTickets={setFiltroTickets} />;
      case "panel":
        return <Indicadores logeo={logeo} onClick={() => { setPage(1) }} />;

      case "inventario":
        return <ModulosOperativos vista="inventario" logeo={logeo} />;

      case "mantenimientos":
        return <ModulosOperativos vista="mantenimientos" logeo={logeo} />;

      case "cronograma":
        return <ModulosOperativos vista="cronograma" logeo={logeo} />;

      case "responsabilidades":
        return <ResponsabilidadesArea logeo={logeo} />;

      case "gestion-usuarios":
      case "configuracion":
        return <Configuracion logeo={logeo} onActualizarCatalogos={() => Promise.all([getArea(), getSede(), getIncidentes()])} />;

      default:
        return <SolicitudSoporte logeo={logeo} getTickets={getTickets} page={page} setPage={setPage} tickets={tickets} paginacionTickets={paginacionTickets} getConteo={getConteo} conteo={conteo} getArea={getArea} areas={areas} getSede={getSede} sedes={sedes} getIncidentes={getIncidentes} incidentes={incidentes} fechaHora={fechaHora} filtroTickets={filtroTickets} setFiltroTickets={setFiltroTickets} />;


    }
  }


  const [fechaHora, setFechaHora] = useState(new Date());


  useEffect(() => {
    const intervalo = setInterval(() => {


      setFechaHora(new Date());


    }, 60000);


    return () => clearInterval(intervalo);


  }, []);


  return (
    <div className="flex min-h-screen w-full bg-[#f4f8ff] font-din">




      {/* SIDEBAR */}
      <aside className={`magic-sidebar ${open ? "w-72" : "w-[88px]"}`}>
        <div className={`flex h-28 items-center border-b border-white/10 ${open ? "justify-between px-5" : "justify-center px-3"}`}>
          <img
            src={logo}
            alt="Clínica Belén"
            className={`max-h-20 object-contain transition-all ${open ? "w-44 opacity-100" : "w-0 opacity-0"}`}
          />
          <button type="button" onClick={() => setOpen((actual) => !actual)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white transition hover:bg-white/20">
            {open ? <IoChevronBack /> : <IoChevronForward />}
          </button>
        </div>

        <div className={`mx-3 mt-4 rounded-2xl border border-white/10 bg-white/[0.08] ${open ? "p-3" : "p-2"}`}>
          <div className={`flex items-center ${open ? "gap-3" : "justify-center"}`}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg text-blue-700"><FaPersonDrowning /></span>
            {open && <div className="min-w-0"><p className="truncate text-sm font-bold">{logeo.nombre}</p><p className="truncate text-[11px] text-blue-100">Mesa {logeo.mesa} · Rol {logeo.idrol}</p></div>}
          </div>
        </div>

        <nav className="magic-nav flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
          {enlacesFiltrados.map((item, index) => (
            <button
              key={`${item.nombre}-${index}`}
              type="button"
              onClick={() => navegar(item)}
              title={!open ? item.nombre : undefined}
              className={`magic-nav-item group relative w-full ${open ? "justify-start gap-3 px-3.5" : "justify-center px-2"} ${vista === item.vista ? "magic-nav-active" : ""}`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg transition group-hover:scale-110">
                {item.logo}
              </span>
              {open && <span className="truncate text-sm font-semibold">{item.nombre}</span>}
              {item.url && open && <span className="ml-auto text-xs opacity-50">↗</span>}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          <button type="button" onClick={cerrarSesion} className={`magic-nav-item w-full text-rose-100 ${open ? "justify-start gap-3 px-3.5" : "justify-center px-2"}`}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl text-xl"><IoLogOutOutline /></span>
            {open && <span className="text-sm font-semibold">Cerrar sesión</span>}
          </button>
        </div>
      </aside>




      {/* CONTENIDO */}
      <main className="flex flex-col flex-1 min-h-screen overflow-hidden">




        {/* La navegación, el usuario y el cierre de sesión viven en el sidebar. */}





        {/* ÁREA PRINCIPAL */}
        <section className="flex-1 overflow-auto p-8 relative">

          <div className="absolute inset-0 pointer-events-none opacity-50">
            <div className="absolute -top-40 right-0 w-[600px] h-[600px] bg-blue-100 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-40 w-[400px] h-[400px] bg-cyan-100 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            {renderVista()}
          </div>

        </section>

      </main>
    </div>
  );
}
export default Slider;
