const rutas = require('express').Router();
const { listar } = require('./consulta.controlador');
rutas.get('/', listar);
module.exports = rutas;
