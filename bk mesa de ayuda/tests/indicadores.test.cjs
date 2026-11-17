const {test} = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const {validarFiltros,completarSerie} = require('../modulos/indicadores/indicadores.validacion');
const servicio = require('../modulos/indicadores/indicadores.servicio');
const controlador = require('../modulos/indicadores/indicadores.controlador');
const rutas = require('../modulos/indicadores/indicadores.rutas');
test('router de indicadores carga sus dependencias',()=>assert.equal(typeof rutas,'function')); 
test('periodos: bisiestos, limites e identificadores',()=>{
  assert.deepEqual(validarFiltros({vista:'mensual',anio:'2024',mes:'2'}),{vista:'mensual',anio:2024,mes:2,desde:'2024-02-01',hasta:'2024-02-29',idUsuario:null});
  assert.equal(validarFiltros({vista:'mensual',anio:'2026',mes:'12'}).hasta,'2026-12-31');
  assert.equal(validarFiltros({vista:'anual',anio:'2026'}).desde,'2026-01-01');
  assert.equal(validarFiltros({desde:'2026-10-20',hasta:'2026-10-20',usuario:'7'}).idUsuario,7);
  for(const q of [{vista:'otro'},{desde:'2026-02-29'},{desde:'2026-04-31'},{desde:'2026-12-31',hasta:'2026-01-01'},{usuario:'1;DROP'},{usuario:'0'},{usuario:['7']},{vista:'anual',anio:['2026']},{vista:'mensual',anio:'2026',mes:'13'},{vista:'mensual',anio:'2026',mes:['2']}])assert.throws(()=>validarFiltros(q),e=>e.status===400);
});
test('series: ceros en dias y meses sin tickets',()=>{
  const f=validarFiltros({vista:'mensual',anio:'2024',mes:'2'});
  const serie=completarSerie([{PERIODO:'2024-02-02',TOTAL:5,SOLUCIONADOS:3,CERRADOS:1}],f);
  assert.equal(serie.length,29);assert.equal(serie[0].TOTAL,0);assert.equal(serie[1].TOTAL,5);assert.equal(serie[28].PERIODO,'2024-02-29');
  assert.equal(completarSerie([],validarFiltros({vista:'anual',anio:'2026'})).length,12);
});
test('API: roles, mesa del token y validaciones',async t=>{
  const original=servicio.consultar;let llamada;
  servicio.consultar=async(contexto,filtros)=>{llamada={contexto,filtros};return {resumen:{TOTAL:5},filtros};};
  const app=express();app.use((req,res,next)=>{req.usuario={idRol:Number(req.headers['x-rol']||1),idMesa:2,idUsuario:9};next();});app.get('/',controlador.consultar);
  const server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
  const pedir=(q='',rol=1)=>fetch(`http://127.0.0.1:${server.address().port}/${q}`,{headers:{'x-rol':String(rol)}});
  try{
    await t.test('usuario final no accede',async()=>assert.equal((await pedir('',3)).status,403));
    await t.test('admin y soporte consultan',async()=>{for(const rol of [1,2])assert.equal((await pedir('?vista=anual&anio=2026',rol)).status,200);});
    await t.test('ignora mesa ajena enviada en query',async()=>{await pedir('?mesa=99&usuario=7');assert.equal(llamada.contexto.idMesa,2);assert.equal(llamada.filtros.idUsuario,7);});
    await t.test('rango invalido devuelve 400',async()=>assert.equal((await pedir('?desde=2026-05-20&hasta=2026-01-01')).status,400));
    await t.test('no expone estadisticas de soporte de otra mesa',async()=>{servicio.consultar=async()=>{throw Object.assign(new Error('Soporte ajeno'),{number:50300});};assert.equal((await pedir('?usuario=7')).status,400);});
    await t.test('rechaza membresia revocada',async()=>{servicio.consultar=async()=>{throw Object.assign(new Error('Sin acceso'),{number:50303});};assert.equal((await pedir()).status,403);});
  }finally{servicio.consultar=original;server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
