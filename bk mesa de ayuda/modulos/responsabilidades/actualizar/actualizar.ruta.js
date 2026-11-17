const rutas = require('express').Router();
rutas.patch('/:id/estado', require('../compartido/responsabilidades.controlador').cambiarEstadoResponsabilidad);
rutas.put('/:id', require('./actualizar.controlador').actualizarResponsabilidad);
module.exports = rutas;
