const rutas = require('express').Router();
rutas.get('/:id', require('./detalle.controlador').obtenerSolicitud);
module.exports = rutas;
