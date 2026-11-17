const rutas = require('express').Router();
rutas.delete('/:id', require('./eliminar.controlador').borrarMantenimiento);
module.exports = rutas;
