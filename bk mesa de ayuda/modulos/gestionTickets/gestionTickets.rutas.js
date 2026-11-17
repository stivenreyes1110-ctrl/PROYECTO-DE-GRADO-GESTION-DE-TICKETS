const express = require('express');
const validarToken = require('../../middleware/validar.token');
const autorizarGestionTickets = require('./middlewares/autorizarGestionTickets.middleware');
const { registrarAcceso } = require('./utilidades/auditoriaGestionTickets');
const consultaRutas = require('./consulta/consulta.ruta');
const resumenRutas = require('./resumen/resumen.ruta');
const actualizarEstadoRutas = require('./actualizarEstado/actualizarEstado.ruta');

const rutas = express.Router();

rutas.use(registrarAcceso);
rutas.use(validarToken);
rutas.use(autorizarGestionTickets);
rutas.use(consultaRutas);
rutas.use(resumenRutas);
rutas.use(actualizarEstadoRutas);

module.exports = rutas;
