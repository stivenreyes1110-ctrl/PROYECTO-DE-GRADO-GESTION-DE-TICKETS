const express = require('express');
const router = express.Router();


const validarToken = require('../../middleware/validar.token');
const usuariosControlador = require('./usuarios.controlador');


/*
==================================================
INDICE
==================================================

1. LOSUSUARIOS
2. LOSSOPORTES

==================================================
*/


//1. LOSUSUARIOS
router.get('/usuarios',validarToken,usuariosControlador.losUsuarios);
router.get('/usuarios/roles', validarToken, usuariosControlador.consultarRolesMesa);
router.patch('/usuarios/:idUsuario/rol-soporte', validarToken, usuariosControlador.asignarRolSoporte);
router.patch('/usuarios/:idUsuario/rol', validarToken, usuariosControlador.actualizarRolMesa);


//2. LOSSOPORTES 
router.get('/usuarios/soporte/:mesa', validarToken, usuariosControlador.losSoportes);


module.exports = router;
