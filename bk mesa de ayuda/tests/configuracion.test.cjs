const {test} = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const {validarDatos} = require('../modulos/configuracion/configuracion.validacion');
const servicio = require('../modulos/configuracion/configuracion.servicio');
const c = require('../modulos/configuracion/configuracion.controlador');
test('validacion de configuracion', () => {
  assert.ok(validarDatos('__proto__', {NOMBRE:'x'}).error);
  assert.ok(validarDatos('sedes', {NOMBRE:' '}).error);
  assert.ok(validarDatos('areas', {NOMBRE:'Area', IDSEDE:0}).error);
  assert.ok(validarDatos('areas', {NOMBRE:'Area', IDSEDE:1, PISO:1.2}).error);
  assert.equal(validarDatos('areas', {NOMBRE:'Area', IDSEDE:1, PISO:0}).valor.PISO, 0);
  assert.equal(validarDatos('prioridades', {NOMBRE:'Urgente', CODIGO:'urgente', ORDEN:4}).valor.CODIGO, 'URGENTE');
  assert.ok(validarDatos('prioridades', {NOMBRE:'x', CODIGO:'x;DROP TABLE'}).error);
});
test('API: permisos, alcance de mesa, validacion y conflictos', async t => {
  const original = {...servicio};
  let guardado;
  servicio.esAdministrador = async usuario => usuario.idRol === 1;
  servicio.listar = async (recurso, mesa) => [{ID:1, NOMBRE:recurso, IDMESA:mesa}];
  servicio.guardar = async (...args) => {guardado=args;return {ID:7,...args[1],IDMESA:args[2]};};
  servicio.eliminar = async () => {throw Object.assign(new Error('Registro con datos asociados.'), {number:50109});};
  const app=express();app.use(express.json());
  app.use((req,res,next)=>{req.usuario={idRol:Number(req.headers['x-test-rol']),idMesa:2};next();});
  app.use(c.soloAdministrador);
  app.get('/:recurso',c.validarRecurso,c.listar);
  app.post('/:recurso',c.validarRecurso,c.guardar);
  app.put('/:recurso/:id',c.validarRecurso,c.guardar);
  app.delete('/:recurso/:id',c.validarRecurso,c.eliminar);
  const server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
  const base=`http://127.0.0.1:${server.address().port}`;
  const enviar=(ruta,method='GET',body,rol=1)=>fetch(base+ruta,{method,headers:{'x-test-rol':String(rol),'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  try {
    await t.test('soporte y usuario no administran',async()=>{for(const rol of [2,3])assert.equal((await enviar('/sedes','GET',null,rol)).status,403);});
    await t.test('consulta limitada a mesa del token',async()=>{const r=await enviar('/incidentes');assert.equal(r.status,200);assert.equal((await r.json())[0].IDMESA,2);});
    await t.test('creacion ignora mesa enviada en cuerpo',async()=>{const r=await enviar('/incidentes','POST',{NOMBRE:'Red',IDMESA:99});assert.equal(r.status,201);assert.equal(guardado[2],2);});
    await t.test('edicion envia ID normalizado',async()=>{assert.equal((await enviar('/areas/7','PUT',{NOMBRE:'Area',IDSEDE:1,PISO:0})).status,200);assert.equal(guardado[3],7);});
    await t.test('rechaza recurso, ID y datos invalidos',async()=>{assert.equal((await enviar('/desconocido')).status,404);assert.equal((await enviar('/sedes/abc','PUT',{NOMBRE:'x'})).status,400);assert.equal((await enviar('/areas','POST',{NOMBRE:'x'})).status,400);});
    await t.test('borrado en uso devuelve conflicto comprensible',async()=>{const r=await enviar('/areas/7','DELETE');assert.equal(r.status,409);assert.match((await r.json()).mensaje,/asociados/);});
  } finally {Object.assign(servicio,original);server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
