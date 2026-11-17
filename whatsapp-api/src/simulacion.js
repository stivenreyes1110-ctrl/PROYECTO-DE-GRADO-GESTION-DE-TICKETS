function crearSimulacion(){let id=1000;return {
 async usuario(t){return t.toLowerCase()==='demo'?{id:1,usuario:'demo',nombre:'USUARIO DEMOSTRACION TICS'}:null;},
 async opciones(paso){return {incidente:[{id:1,nombre:'Sin acceso a internet'},{id:2,nombre:'Problema con equipo'}],sede:[{id:1,nombre:'Sede de demostracion'}],area:[{id:1,nombre:'Area de demostracion'}],prioridad:[{id:'BAJA',nombre:'Baja'},{id:'MEDIA',nombre:'Media'},{id:'ALTA',nombre:'Alta'}]}[paso];},
 async crear(){return 'DEMO-'+(++id);}
};}
module.exports={crearSimulacion};
