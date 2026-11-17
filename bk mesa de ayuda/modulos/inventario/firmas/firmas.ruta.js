const rutas=require('express').Router();
const c=require('./firmas.controlador');
rutas.get('/:id/firmas',c.validarAcceso,c.consultar);
rutas.put('/:id/firmas/:tipo',c.validarAcceso,c.guardar);
rutas.get('/:id/firmantes',c.validarAcceso,c.firmantes);
module.exports=rutas;
