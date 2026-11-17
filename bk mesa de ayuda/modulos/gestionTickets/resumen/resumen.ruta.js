const express = require('express');
const { obtenerResumen } = require('./resumen.controlador');

const rutas = express.Router();
rutas.get('/resumen', obtenerResumen);

module.exports = rutas;
