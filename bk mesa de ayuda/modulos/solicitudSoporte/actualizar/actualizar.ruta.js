const rutas = require('express').Router();
rutas.put('/:id', require('./actualizar.controlador').actualizarSolicitud);
module.exports = rutas;
