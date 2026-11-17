const {guardarImagen} = require('../../middleware/guardar.imagen');
const {validarImagen} = require('../../middleware/validar.imagen');
const express = require('express');
const validarToken = require('../../middleware/validar.token');
const consultaRutas = require('./consulta/consulta.ruta');
const conteoRutas = require('./conteo/conteo.ruta');
const insertarRutas = require('./insertar/insertar.ruta');
const actualizarRutas = require('./actualizar/actualizar.ruta');
const eliminarRutas = require('./eliminar/eliminar.ruta');

const rutas = express.Router();

rutas.use(validarToken);
rutas.use(validarImagen('FOTO'));
rutas.use(guardarImagen('FOTO'));
rutas.use(require('./firmas/firmas.ruta'));
rutas.use(consultaRutas);
rutas.use(conteoRutas);
rutas.use(insertarRutas);
rutas.use(actualizarRutas);
rutas.use(eliminarRutas);

module.exports = rutas;
