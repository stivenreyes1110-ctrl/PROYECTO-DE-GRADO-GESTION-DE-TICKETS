const express = require('express');
const { insertarActivo } = require('./insertar.controlador');

const rutas = express.Router();

rutas.post('/insertar', insertarActivo);

module.exports = rutas;
