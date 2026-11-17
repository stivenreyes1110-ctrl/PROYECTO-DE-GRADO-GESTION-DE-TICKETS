function crearMesaApi({baseUrl,token,crearHabilitado=false,delegarSolicitante=false,fetchImpl=fetch}){
 const base=String(baseUrl||'').replace(/\/$/,'');
 async function llamar(ruta,opciones={}){
  if(!base||!token)throw new Error('Configura MESA80_API_URL y MESA80_API_TOKEN');
  const r=await fetchImpl(base+ruta,{...opciones,signal:AbortSignal.timeout(12000),headers:{...opciones.headers,Authorization:'Bearer '+token}});
  if(!r.ok){const e=new Error(r.status===401?'La sesion de Mesa 80 vencio o no es valida. Vuelve a iniciar sesion.':'Mesa de Ayuda respondio HTTP '+r.status);e.status=r.status;throw e;}
  return r.json();
 }
 return {
  async usuario(nombre){
   const datos=await llamar('/usuarios');if(!Array.isArray(datos))throw new Error('Respuesta de usuarios no valida');
   const coincidencias=datos.filter(u=>Number(u.ESTADO)===1&&String(u.USUARIO).trim().toLowerCase()===nombre.trim().toLowerCase());
   const unicos=[...new Map(coincidencias.map(u=>[Number(u.IDUSUARIO),u])).values()];
   return unicos.length===1?{id:Number(unicos[0].IDUSUARIO),nombre:unicos[0].NOMBRE,usuario:unicos[0].USUARIO}:null;
  },
  async opciones(paso,s){
   const rutas={incidente:'/incidentes',sede:'/sedes',area:'/areas',prioridad:'/prioridades'};
   let datos=await llamar(rutas[paso]);if(!Array.isArray(datos))throw new Error('Catalogo no valido');
   if(paso==='incidente')datos=datos.filter(x=>x.IDMESA==null||Number(x.IDMESA)===1);
   if(paso==='area')datos=datos.filter(x=>Number(x.IDSEDE)===Number(s.sede.id));
   return datos.map(x=>({id:paso==='prioridad'?x.CODIGO:Number(x.ID),nombre:x.NOMBRE}));
  },
  async crear(s){
   if(!crearHabilitado)throw new Error('La creacion real esta desactivada. Activa MESA80_CREATE_ENABLED y reinicia el servicio.');
   // El backend toma solicitante y mesa del JWT, nunca del formulario.
   let identidad;try{identidad=JSON.parse(Buffer.from(token.split('.')[1],'base64url').toString('utf8'));}catch{throw new Error('JWT de Mesa no valido');}
   if(Number(identidad.idMesa)!==1||(!delegarSolicitante&&Number(identidad.idUsuario)!==Number(s.usuario.id)))throw new Error('El token debe pertenecer al solicitante confirmado y a la mesa 1');
   const body=new FormData();
   for(const [k,v]of Object.entries({incidente:s.incidente.id,sede:s.sede.id,area:s.area.id,prioridad:s.prioridad.id,ubicacion:s.ubicacion,descripcion:s.descripcion}))body.set(k,String(v));
   if(delegarSolicitante)body.set('solicitante',s.usuario.usuario);
   const ruta = delegarSolicitante ? '/solicitudes-soporte/whatsapp' : '/solicitudes-soporte';
   let r;try{r=await llamar(ruta,{method:'POST',body});if(!r.ok||!r.data?.ID)throw new Error('Respuesta de creacion no valida');}catch(e){if(!e.status||e.status>=500){e.creacionIncierta=true;e.message='No se pudo confirmar el resultado. Verifica con TICS si se creo el ticket antes de volver a intentarlo.';}throw e;}
   return r.data.ID;
  }
 };
}
module.exports={crearMesaApi};
