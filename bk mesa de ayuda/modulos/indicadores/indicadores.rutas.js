const rutas = require('express').Router();
const validarToken = require('../../middleware/validar.token');
rutas.get('/',validarToken,require('./indicadores.controlador').consultar);
module.exports = rutas;
