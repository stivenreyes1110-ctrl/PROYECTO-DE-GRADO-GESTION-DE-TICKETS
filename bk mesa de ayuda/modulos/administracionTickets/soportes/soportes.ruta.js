const rutas = require('express').Router();
const { listarSoportes } = require('./soportes.controlador');
rutas.get('/soportes', listarSoportes);
module.exports = rutas;
