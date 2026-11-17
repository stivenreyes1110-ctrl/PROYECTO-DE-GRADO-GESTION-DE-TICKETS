const express = require('express');
const { actualizarEstado } = require('./actualizarEstado.controlador');

const rutas = express.Router();
rutas.patch('/:ticketId/estado', actualizarEstado);

module.exports = rutas;
