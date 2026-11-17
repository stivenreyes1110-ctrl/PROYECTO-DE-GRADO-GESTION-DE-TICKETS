const express = require('express');
const { eliminarActivo } = require('./eliminar.controlador');

const rutas = express.Router();

rutas.delete('/eliminar/:id', eliminarActivo);

module.exports = rutas;
