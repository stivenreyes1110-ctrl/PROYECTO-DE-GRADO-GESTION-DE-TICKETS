import {useEffect, useState} from 'react';
import {consultarPrioridades} from '../eventos/configuracion.fetch';
export function usePrioridades(token) {
  const [prioridades, setPrioridades] = useState([]);
  const [errorPrioridades, setError] = useState('');
  const [cargandoPrioridades, setCargando] = useState(true);
  useEffect(() => {
    const abort = new AbortController();
    async function cargar() {
      try {
        const datos = await consultarPrioridades(token, abort.signal);
        if (!abort.signal.aborted) {setPrioridades(datos);setError('');}
      } catch(e) {if (!abort.signal.aborted) setError(e.message);}
      finally {if (!abort.signal.aborted) setCargando(false);}
    }
    cargar();return () => abort.abort();
  }, [token]);
  return {prioridades, errorPrioridades, cargandoPrioridades};
}
