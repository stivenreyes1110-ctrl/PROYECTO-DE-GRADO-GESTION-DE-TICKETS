const rutas = require('express').Router();
rutas.get('/resumen', require('./resumen.controlador').obtenerResumenSolicitudes);
module.exports = rutas;
