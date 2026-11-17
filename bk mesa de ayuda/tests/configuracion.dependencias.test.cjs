const {test}=require('node:test');
const assert=require('node:assert/strict');
const sql=require('mssql');
const db=require('../config/db');
const {describirRegistro}=require('../modulos/configuracion/configuracion.dependencias');
test('metadatos: relacion, motivo y proteccion de incidentes compartidos',()=>{
  const r=describirRegistro('areas',{ID:1,DEP_TICKETS:2,DEP_ACTIVOS:1,DEP_RESPONSABILIDADES:0},2);
  assert.equal(r.EN_USO,true);assert.equal(r.PUEDE_ELIMINAR,false);assert.match(r.MOTIVO_ELIMINACION,/2 tickets, 1 activo/);assert.equal(r.DEP_TICKETS,undefined);
  assert.equal(describirRegistro('sedes',{ID:1,DEP_AREAS:0,DEP_TICKETS:0,DEP_ACTIVOS:0},2).PUEDE_ELIMINAR,true);
  assert.equal(describirRegistro('incidentes',{ID:1,IDMESA:null,DEP_TICKETS:0},2).PUEDE_ELIMINAR,false);
});
test('servicio: ninguna dependencia permite llegar al DELETE',async t=>{
  const original={Request:sql.Request,Transaction:sql.Transaction,conexion:db.conexion};
  const archivo=require.resolve('../modulos/configuracion/configuracion.servicio');
  let registro,consultas,confirmado,revertido,nivel,falloDelete;
  class Transaccion{async begin(n){nivel=n;}async commit(){confirmado=true;}async rollback(){revertido=true;}}
  class Solicitud{input(){return this;}async query(texto){consultas.push(texto);if(texto.trim().startsWith('SELECT'))return {recordset:registro?[registro]:[]};if(falloDelete)throw falloDelete;return {recordset:[]};}}
  sql.Transaction=Transaccion;sql.Request=Solicitud;db.conexion=async()=>({});delete require.cache[archivo];
  const servicio=require(archivo);
  const preparar=r=>{registro=r;consultas=[];confirmado=false;revertido=false;falloDelete=null;};
  try{
    for(const [recurso,dependencia] of [['incidentes','TICKETS'],['sedes','AREAS'],['sedes','TICKETS'],['sedes','ACTIVOS'],['areas','TICKETS'],['areas','ACTIVOS'],['areas','RESPONSABILIDADES'],['prioridades','TICKETS']]){
      await t.test(`${recurso} bloquea ${dependencia}`,async()=>{
        preparar({ID:1,IDMESA:2,[`DEP_${dependencia}`]:1});
        await assert.rejects(servicio.eliminar(recurso,1,2),e=>e.number===50109);
        assert.equal(consultas.some(c=>c.includes('DELETE FROM')),false);assert.equal(confirmado,false);assert.equal(revertido,true);assert.equal(nivel,sql.ISOLATION_LEVEL.SERIALIZABLE);
      });
    }
    for(const recurso of ['incidentes','sedes','areas','prioridades'])await t.test(`${recurso} libre se elimina y confirma`,async()=>{
      preparar({ID:1,IDMESA:2});await servicio.eliminar(recurso,1,2);assert.equal(consultas.length,2);assert.equal(confirmado,true);assert.equal(revertido,false);
    });
    await t.test('desaparecido devuelve 404 y revierte',async()=>{preparar(null);await assert.rejects(servicio.eliminar('areas',1,2),e=>e.number===50104);assert.equal(revertido,true);assert.equal(consultas.length,1);});
    await t.test('relacion creada despues de listar vuelve a bloquearse',async()=>{preparar({ID:1,IDMESA:2,DEP_TICKETS:1});await assert.rejects(servicio.eliminar('prioridades',1,2),e=>e.number===50109);assert.equal(consultas.length,1);});
    await t.test('fallo de integridad revierte la transaccion',async()=>{preparar({ID:1,IDMESA:2});falloDelete=Object.assign(new Error('FK'),{number:547});await assert.rejects(servicio.eliminar('areas',1,2),e=>e.number===547);assert.equal(confirmado,false);assert.equal(revertido,true);});
  }finally{sql.Request=original.Request;sql.Transaction=original.Transaction;db.conexion=original.conexion;delete require.cache[archivo];}
});
