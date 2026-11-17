import {useEffect, useMemo, useState} from 'react';
import {consultarCatalogo, guardarCatalogo, eliminarCatalogo} from '../eventos/configuracion.fetch';
export function useVariablesConfiguracion({token, recurso, onActualizarCatalogos}) {
  const [registros, setRegistros] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [editor, setEditor] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [errorCarga, setErrorCarga] = useState('');
  const [errorAccion, setErrorAccion] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const abort = new AbortController();
    async function cargar() {
      setCargando(true);setErrorCarga('');
      try {
        const [datos, opciones] = await Promise.all([consultarCatalogo(token, recurso, abort.signal), recurso === 'areas' ? consultarCatalogo(token, 'sedes', abort.signal) : Promise.resolve([])]);
        if (!abort.signal.aborted) {setRegistros(datos);setSedes(opciones);}
      } catch(e) {if (!abort.signal.aborted) {setRegistros([]);setErrorCarga(e.message);};}
      finally {if (!abort.signal.aborted) setCargando(false);}
    }
    cargar();return () => abort.abort();
  }, [token, recurso, revision]);
  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es');
    return registros.filter(r => `${r.NOMBRE} ${r.SEDE || ''} ${r.CODIGO || ''} ${r.PISO ?? ''}`.toLocaleLowerCase('es').includes(texto));
  }, [registros, busqueda]);
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / 10));
  const paginaVisible = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice((paginaVisible-1)*10, paginaVisible*10);
  const buscar = valor => {setBusqueda(valor);setPagina(1);};
  const guardar = async datos => {
    if (procesando) return;
    setProcesando(true);setErrorAccion('');setMensaje('');
    try {
      await guardarCatalogo(token, recurso, datos, editor?.ID);
      setEditor(null);setMensaje(editor?.ID ? 'Cambios guardados.' : 'Registro agregado.');setRevision(v => v+1);
      await onActualizarCatalogos?.();
    } catch(e) {setErrorAccion(e.message);if (e.status === 409) setRevision(v => v+1);} finally {setProcesando(false);}
  };
  const eliminar = async registro => {
    if (procesando || cargando) return;
    if (registro.PUEDE_ELIMINAR !== true) {setErrorAccion(registro.MOTIVO_ELIMINACION || 'Actualice el listado antes de eliminar.');return;}
    if (!window.confirm(`¿Eliminar ${registro.NOMBRE}? Esta acción no se puede deshacer.`)) return;
    setProcesando(true);setErrorAccion('');setMensaje('');
    try {await eliminarCatalogo(token, recurso, registro.ID);if (editor?.ID === registro.ID) setEditor(null);setMensaje('Registro eliminado.');setRevision(v => v+1);await onActualizarCatalogos?.();}
    catch(e) {setErrorAccion(e.message);if (e.status === 409) setRevision(v => v+1);} finally {setProcesando(false);}
  };
  return {sedes, busqueda, buscar, pagina: paginaVisible, setPagina, totalPaginas, visibles, total: filtrados.length, editor, setEditor, cargando, procesando, error: errorAccion || errorCarga, mensaje, guardar, eliminar, recargar: () => {setErrorAccion('');setMensaje('');setRevision(v => v+1);}};
}
