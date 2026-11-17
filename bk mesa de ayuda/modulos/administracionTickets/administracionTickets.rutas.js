const express = require('express');
const validarToken = require('../../middleware/validar.token');
const autorizar = require('./middlewares/autorizarAdministracionTickets.middleware');
const { registrarAcceso } = require('./utilidades/auditoriaAdministracionTickets');

const rutas = express.Router();
rutas.use(registrarAcceso);
rutas.use(validarToken);
rutas.use(autorizar);
rutas.use(require('./consulta/consulta.ruta'));
rutas.use(require('./resumen/resumen.ruta'));
rutas.use(require('./soportes/soportes.ruta'));
rutas.use(require('./asignacion/asignacion.ruta'));
rutas.use(require('./actualizarEstado/actualizarEstado.ruta'));

module.exports = rutas;
