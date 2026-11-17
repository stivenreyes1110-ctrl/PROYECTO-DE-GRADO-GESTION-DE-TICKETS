const rutas = require('express').Router();
const validarToken = require('../../middleware/validar.token');
const controlador = require('./configuracion.controlador');
rutas.use(validarToken, controlador.soloAdministrador);
rutas.get('/:recurso', controlador.validarRecurso, controlador.listar);
rutas.post('/:recurso', controlador.validarRecurso, controlador.guardar);
rutas.put('/:recurso/:id', controlador.validarRecurso, controlador.guardar);
rutas.delete('/:recurso/:id', controlador.validarRecurso, controlador.eliminar);
module.exports = rutas;
