const rutas = require('express').Router();
rutas.get('/', require('./consulta.controlador').obtenerResponsabilidades);
module.exports = rutas;
