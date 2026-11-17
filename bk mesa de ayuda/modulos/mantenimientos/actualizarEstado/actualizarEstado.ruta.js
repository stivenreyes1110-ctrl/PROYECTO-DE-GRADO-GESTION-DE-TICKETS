const rutas = require('express').Router();
rutas.patch('/:id/estado', require('./actualizarEstado.controlador').actualizarEstadoMantenimiento);
module.exports = rutas;
