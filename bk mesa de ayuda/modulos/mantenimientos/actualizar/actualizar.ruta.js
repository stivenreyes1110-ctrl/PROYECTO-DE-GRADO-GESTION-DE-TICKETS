const rutas = require('express').Router();
rutas.put('/:id', require('./actualizar.controlador').actualizarMantenimiento);
module.exports = rutas;
