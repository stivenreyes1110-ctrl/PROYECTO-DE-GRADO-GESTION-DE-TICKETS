const {avanzar}=require('./flujo');
const {crearMesaApi}=require('./mesa-api');const {crearSimulacion}=require('./simulacion');
function crearProcesador(repo){
 const sesiones=new Map(),mensajes=new Map(),colas=new Map();
 const ttl=30*60*1000;
 async function procesar(m,enviar){
  const anterior=colas.get(m.from)||Promise.resolve();
  const trabajo=anterior.catch(()=>{}).then(async()=>{
   const ahora=Date.now();
   for(const [k,v]of sesiones)if(ahora-v.fecha>ttl)sesiones.delete(k);
   for(const [k,v]of mensajes)if(ahora-v.fecha>24*60*60*1000)mensajes.delete(k);
   let registro=mensajes.get(m.id);
   if(!registro){
    const estado=sesiones.get(m.from)?.estado;
    let resultado;
    try{resultado=m.type==='text'?await avanzar(estado,m.text?.body,repo):{estado:estado||{paso:'usuario'},respuesta:'Envia texto o escribe INICIO.'};}
    catch(e){
     if(estado?.paso==='confirmarTicket'){
      // Un timeout de POST puede significar que el ticket si se creo. No reintentar automaticamente.
      resultado={estado:{paso:'verificarResultado'},respuesta:'No se pudo confirmar la creacion. Verifica con TICS antes de volver a solicitar el ticket. Escribe INICIO para reiniciar.'};
     }else throw e;
    }
    if(estado?.paso==='verificarResultado'&&!['inicio','reiniciar','cancelar','hola'].includes(String(m.text?.body||'').trim().toLowerCase()))resultado={estado,respuesta:'Verifica primero con TICS si el ticket fue creado. Escribe INICIO para reiniciar.'};
    sesiones.set(m.from,{estado:resultado.estado,fecha:ahora});
    registro={respuesta:resultado.respuesta,enviado:false,fecha:ahora};mensajes.set(m.id,registro);
   }
   if(!registro.enviado){await enviar(m.from,registro.respuesta);registro.enviado=true;}
  });
  colas.set(m.from,trabajo);
  try{await trabajo;}finally{if(colas.get(m.from)===trabajo)colas.delete(m.from);}
 }
 return {procesar};
}
const repo=process.env.MESA80_MODE==='api'?crearMesaApi({baseUrl:process.env.MESA80_API_URL,token:process.env.MESA80_API_TOKEN,crearHabilitado:process.env.MESA80_CREATE_ENABLED==='true',delegarSolicitante:process.env.MESA80_WHATSAPP_SOLICITANTE==='true'}):crearSimulacion();
module.exports={...crearProcesador(repo),crearProcesador};
