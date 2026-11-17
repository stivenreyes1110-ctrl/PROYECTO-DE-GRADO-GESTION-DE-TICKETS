import {useEffect, useState} from 'react';
import * as api from '../eventos/firmas.fetch';
export function useFirmasHojaVida(token, id) {
  const [usuarios, setUsuarios] = useState([]);
  const [firmas, setFirmas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const abort = new AbortController();
    async function cargar() {
      setCargando(true);setError('');
      try {
        const [datos, firmantes] = await Promise.all([api.consultarFirmas(token, id, abort.signal), api.consultarFirmantes(token, id, abort.signal)]);
        if (!abort.signal.aborted) {setFirmas(datos);setUsuarios(firmantes);}
      } catch(e) {if (!abort.signal.aborted) setError(e.message);}
      finally {if (!abort.signal.aborted) setCargando(false);}
    }
    cargar();return () => abort.abort();
  }, [token, id, revision]);
  const guardar = async (tipo, datos) => {
    if (guardando || cargando || error) throw new Error('Espera a que carguen las firmas o reintenta la consulta.');
    setGuardando(true);
    try {
      const firma = await api.guardarFirma(token, id, tipo, datos);
      setFirmas(actuales => [...actuales.filter(f => f.TIPO !== tipo), firma]);
      return firma;
    } finally {setGuardando(false);}
  };
  return {firmas, usuarios, cargando, guardando, error, guardar, reintentar: () => setRevision(v => v+1)};
}
