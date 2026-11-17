import { useState } from 'react';
export function useVariablesInventario() {
  const [activos, setActivos] = useState([]);
  const [todosActivos, setTodosActivos] = useState([]);
  const [totalInventario, setTotalInventario] = useState(0);
  const [resumenInventario, setResumenInventario] = useState({
    total: 0,
    categorias: 0,
    areas: 0,
    sedes: 0
  });
  const [cargandoInventario, setCargandoInventario] = useState(true);
  const [paginaInventario, setPaginaInventario] = useState(1);
  const [modalActivoAbierto, setModalActivoAbierto] = useState(false);
  const [activoEditando, setActivoEditando] = useState(null);
  const [modalHojaVidaAbierto, setModalHojaVidaAbierto] = useState(false);
  const [activoHojaVida, setActivoHojaVida] = useState(null);
  return { activos, setActivos, todosActivos, setTodosActivos, totalInventario, setTotalInventario, resumenInventario, setResumenInventario, cargandoInventario, setCargandoInventario, paginaInventario, setPaginaInventario, modalActivoAbierto, setModalActivoAbierto, activoEditando, setActivoEditando, modalHojaVidaAbierto, setModalHojaVidaAbierto, activoHojaVida, setActivoHojaVida };
}
