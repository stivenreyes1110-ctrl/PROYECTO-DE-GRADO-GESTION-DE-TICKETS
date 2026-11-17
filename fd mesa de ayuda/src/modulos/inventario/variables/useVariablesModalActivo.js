import {useState} from 'react';
import {datosIniciales} from './inventario.constantes';
export function useVariablesModalActivo({editItem, idMesa}) {
  const [formulario, setFormulario] = useState(() => ({
    ...Object.fromEntries(Object.entries(datosIniciales).map(([campo, valor]) => [campo, editItem?.[campo] ?? valor])),
    IDMESA: Number(idMesa)
  }));
  const [errorImagen, setErrorImagen] = useState('');
  return {formulario, setFormulario, errorImagen, setErrorImagen};
}
