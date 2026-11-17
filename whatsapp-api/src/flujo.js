const normalizar=t=>String(t||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const si=t=>['si','1'].includes(normalizar(t));
const no=t=>['no','2'].includes(normalizar(t));
async function avanzar(estado,texto,repo) {
 const t=String(texto||'').trim(); const s=structuredClone(estado||{paso:'usuario'});
 const respuesta=texto=>({estado:s,respuesta:texto});
 const inicio=()=>({estado:{paso:'usuario'},respuesta:'Bienvenido a TICS (mesa 1). Escribe tu usuario institucional, sin contraseña.'});
 if (!estado||['hola','inicio','reiniciar','cancelar'].includes(normalizar(t))) return inicio();
 const menu=async paso=>{
  const opciones=await repo.opciones(paso,s);
  if(!opciones.length) return respuesta('No hay opciones configuradas. Contacta a TICS o escribe REINICIAR para intentar nuevamente.');
  s.paso=paso;s.opciones=opciones;
  return respuesta('Selecciona '+paso+' escribiendo su número:\n'+opciones.map((o,i)=>(i+1)+'. '+o.nombre).join('\n'));
 };
 if(s.paso==='usuario'){
  if(!t||t.length>100)return respuesta('Escribe un usuario válido de hasta 100 caracteres.');
  const u=await repo.usuario(t);
  if(!u)return respuesta('Usuario no encontrado o inactivo. Escribe nuevamente tu usuario institucional.');
  s.usuario=u;s.paso='confirmarUsuario';return respuesta('Nombre completo: '+u.nombre+'. ¿Confirmas que eres esta persona? SI / NO.');
 }
 if(s.paso==='confirmarUsuario'){
  if(no(t))return {estado:{paso:'usuario'},respuesta:'Volvamos a validar. Escribe nuevamente tu usuario institucional.'};
  if(!si(t))return respuesta('Confirma el nombre completo respondiendo SI o NO.');
  return menu('incidente');
 }
 if(['incidente','sede','area','prioridad'].includes(s.paso)){
  const o=/^\d+$/.test(t)&&s.opciones[Number(t)-1];
  if(!o)return respuesta('Selecciona un número de la lista anterior.');
  const paso=s.paso;s[paso]=o;delete s.opciones;
  if(paso==='incidente')return menu('sede');
  if(paso==='sede')return menu('area');
  if(paso==='area')return menu('prioridad');
  s.paso='ubicacion';return respuesta('Indica tu ubicación física, máximo 500 caracteres.');
 }
 if(s.paso==='ubicacion'){
  if(!t||t.length>500)return respuesta('La ubicación debe tener entre 1 y 500 caracteres.');
  s.ubicacion=t;s.paso='descripcion';return respuesta('Describe el problema, máximo 999 caracteres.');
 }
 if(s.paso==='descripcion'){
  if(!t||t.length>999)return respuesta('La descripción debe tener entre 1 y 999 caracteres.');
  s.descripcion=t;s.paso='confirmarTicket';
  return respuesta('Solicitud TICS (mesa 1)\nSolicitante: '+s.usuario.nombre+'\nIncidente: '+s.incidente.nombre+'\nSede: '+s.sede.nombre+'\nárea: '+s.area.nombre+'\nPrioridad: '+s.prioridad.nombre+'\nUbicación: '+s.ubicacion+'\nProblema: '+s.descripcion+'\n¿Crear ticket? SI / NO.');
 }
 if(s.paso==='confirmarTicket'){
  if(no(t))return {estado:{paso:'usuario'},respuesta:'Solicitud cancelada. Escribe tu usuario para comenzar nuevamente.'};
  if(!si(t))return respuesta('Responde SI para crear el ticket o NO para cancelar.');
  const id=await repo.crear(s);
  return {estado:{paso:'usuario'},respuesta:'Ticket #'+id+' creado en TICS (mesa 1), pendiente de asignación. Escribe tu usuario para otra solicitud.'};
 }
 return inicio();
}
module.exports={avanzar};
