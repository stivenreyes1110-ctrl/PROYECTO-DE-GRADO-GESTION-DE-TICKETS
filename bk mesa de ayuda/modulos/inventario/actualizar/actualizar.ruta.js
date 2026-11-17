const express = require('express');
const { actualizarActivo } = require('./actualizar.controlador');

const rutas = express.Router();

rutas.put('/actualizar/:id', actualizarActivo);

module.exports = rutas;
