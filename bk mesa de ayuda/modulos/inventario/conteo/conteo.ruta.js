const express = require('express');
const { obtenerConteoInventario } = require('./conteo.controlador');

const rutas = express.Router();

rutas.get('/conteo', obtenerConteoInventario);

module.exports = rutas;
