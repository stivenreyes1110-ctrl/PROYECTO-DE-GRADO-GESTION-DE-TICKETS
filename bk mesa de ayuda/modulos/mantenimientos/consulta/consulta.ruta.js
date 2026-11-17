const rutas = require('express').Router();
rutas.get('/', require('./consulta.controlador').obtenerMantenimientos);
module.exports = rutas;
