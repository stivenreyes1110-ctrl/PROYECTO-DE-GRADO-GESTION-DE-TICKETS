const rutas = require('express').Router();
rutas.post('/', require('./insertar.controlador').insertarResponsabilidad);
module.exports = rutas;
