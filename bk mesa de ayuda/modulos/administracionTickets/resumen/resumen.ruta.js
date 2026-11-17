const rutas = require('express').Router();
const { obtenerResumen } = require('./resumen.controlador');
rutas.get('/resumen', obtenerResumen);
module.exports = rutas;
