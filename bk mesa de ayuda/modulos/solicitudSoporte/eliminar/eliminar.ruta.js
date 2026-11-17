const rutas = require('express').Router();
rutas.delete('/:id', require('./eliminar.controlador').eliminarSolicitud);
module.exports = rutas;
