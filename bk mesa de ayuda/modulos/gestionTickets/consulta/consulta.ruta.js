const express = require('express');
const { listarAsignados } = require('./consulta.controlador');

const rutas = express.Router();
rutas.get('/', listarAsignados);

module.exports = rutas;
