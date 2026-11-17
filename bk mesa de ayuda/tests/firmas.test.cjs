const {test} = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const {validarFirma} = require('../modulos/inventario/firmas/firmas.validacion');
const servicio = require('../modulos/inventario/firmas/firmas.servicio');
const rutas = require('../modulos/inventario/firmas/firmas.ruta');
const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';
test('firmante requerido e imagen validada', () => {
  for (const IDFIRMANTE of [undefined, null, 0, -1, 1.5, '7', true]) assert.ok(validarFirma('COORDINADOR', {IDFIRMANTE, NOMBRE:'Texto libre', FIRMA:png}).error);
  assert.ok(validarFirma('OTRO', {IDFIRMANTE:7,FIRMA:png}).error);
  assert.ok(validarFirma('DESIGNADO', {IDFIRMANTE:7,FIRMA:'data:image/png;base64,abcd'}).error);
  const r = validarFirma('DESIGNADO', {IDFIRMANTE:7,NOMBRE:'Nombre manipulado',FIRMA:png});
  assert.equal(r.valor.idFirmante,7);
  assert.equal(r.valor.nombre,undefined);
  assert.ok(Buffer.isBuffer(r.valor.imagen));
});
test('API de firmantes: permisos, errores y separacion de actor y firmante', async t => {
  const originales = {...servicio};
  let llamada;
  servicio.consultarFirmantes = async () => [{IDUSUARIO:7,NOMBRE:'Firmante',USUARIO:'firmante'}];
  servicio.guardarFirma = async (...args) => {
    llamada=args;
    if (args[2].idFirmante===8) throw Object.assign(new Error('El firmante no existe o esta inactivo.'),{number:50200});
    return {NOMBRE:'Firmante',IDFIRMANTE:args[2].idFirmante,IDUSUARIO:args[3].idUsuario,FIRMA:png};
  };
  const app=express();app.use(express.json());
  app.use((req,res,next)=>{req.usuario={idRol:Number(req.headers['x-rol'] || 1),idUsuario:4,idMesa:2};next();});
  app.use(rutas);
  const server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
  const enviar=(ruta,method='GET',body,rol=1)=>fetch(`http://127.0.0.1:${server.address().port}${ruta}`,{method,headers:{'Content-Type':'application/json','x-rol':String(rol)},...(body?{body:JSON.stringify(body)}:{})});
  try {
    await t.test('usuario sin permiso no lista ni guarda',async()=>{
      assert.equal((await enviar('/1/firmantes','GET',null,3)).status,403);
      assert.equal((await enviar('/1/firmas/COORDINADOR','PUT',{IDFIRMANTE:7,FIRMA:png},3)).status,403);
    });
    await t.test('lista para administrador y soporte',async()=>{for(const rol of [1,2]) {const r=await enviar('/1/firmantes','GET',null,rol);assert.equal(r.status,200);assert.equal((await r.json())[0].IDUSUARIO,7);}});
    await t.test('rechaza activo invalido',async()=>assert.equal((await enviar('/abc/firmantes')).status,400));
    await t.test('guarda actor y firmante distintos sin confiar en nombre enviado',async()=>{
      const r=await enviar('/1/firmas/COORDINADOR','PUT',{IDFIRMANTE:7,NOMBRE:'Manipulado',FIRMA:png});
      assert.equal(r.status,200);const firma=await r.json();assert.equal(firma.IDUSUARIO,4);assert.equal(firma.IDFIRMANTE,7);assert.equal(firma.NOMBRE,'Firmante');assert.equal(llamada[2].nombre,undefined);
    });
    await t.test('firmante inactivo devuelve error comprensible',async()=>{
      const r=await enviar('/1/firmas/DESIGNADO','PUT',{IDFIRMANTE:8,FIRMA:png});assert.equal(r.status,400);assert.match((await r.json()).mensaje,/inactivo/);
    });
  } finally {Object.assign(servicio,originales);server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
