const express = require('express');
const validarToken = require('../../../middleware/validar.token');
const {
  obtenerConteoMantenimientos
} = require('./conteo.controlador');

const rutas = express.Router();

rutas.use(validarToken);
rutas.get('/mantenimientos', obtenerConteoMantenimientos);

module.exports = rutas;
