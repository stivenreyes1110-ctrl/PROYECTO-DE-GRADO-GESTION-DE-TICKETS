const rutas = require('express').Router();
const { asignar } = require('./asignacion.controlador');
rutas.patch('/:ticketId/asignacion', asignar);
module.exports = rutas;
