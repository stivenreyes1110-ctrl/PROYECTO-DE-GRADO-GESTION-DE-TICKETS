const express = require('express');
const {
  obtenerAreas,
  obtenerInventario,
  obtenerSedes
} = require('./consulta.controlador');

const rutas = express.Router();

rutas.get('/areas', obtenerAreas);
rutas.get('/sedes', obtenerSedes);
rutas.get('/datos', obtenerInventario);

module.exports = rutas;
