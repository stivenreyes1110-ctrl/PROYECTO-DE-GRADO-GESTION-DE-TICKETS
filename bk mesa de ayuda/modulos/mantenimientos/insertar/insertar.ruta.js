const rutas = require('express').Router();
rutas.post('/', require('./insertar.controlador').insertarMantenimiento);
module.exports = rutas;
