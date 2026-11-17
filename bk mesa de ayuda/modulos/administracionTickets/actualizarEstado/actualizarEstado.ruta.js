const rutas = require('express').Router();
const { actualizarEstado } = require('./actualizarEstado.controlador');
rutas.patch('/:ticketId/estado', actualizarEstado);
module.exports = rutas;
