const rutas = require('express').Router();
rutas.delete('/:id', require('./eliminar.controlador').borrarResponsabilidad);
module.exports = rutas;
