const { Router } = require('express');
const validarToken = require('../../../middleware/validar.token');
const { obtenerCronogramaInventarios } = require('./consulta.controlador');

const router = Router();

router.use(validarToken);
router.get('/inventarios', obtenerCronogramaInventarios);

module.exports = router;
