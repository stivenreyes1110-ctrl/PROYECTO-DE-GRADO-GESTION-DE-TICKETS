const rutas = require('express').Router();
const validarToken = require('../../middleware/validar.token');
rutas.use(validarToken);
rutas.use(require('./consulta/consulta.ruta'));
rutas.use(require('./insertar/insertar.ruta'));
rutas.use(require('./actualizar/actualizar.ruta'));
rutas.use(require('./eliminar/eliminar.ruta'));
module.exports = rutas;
