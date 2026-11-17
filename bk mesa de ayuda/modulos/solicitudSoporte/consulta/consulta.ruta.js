const rutas = require('express').Router();
rutas.get('/', require('./consulta.controlador').listarSolicitudes);
module.exports = rutas;
