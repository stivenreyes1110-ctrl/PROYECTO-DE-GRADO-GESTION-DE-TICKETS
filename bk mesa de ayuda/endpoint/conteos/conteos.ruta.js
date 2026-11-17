const express = require('express');
const router = express.Router();

const conteControlador = require('./conteos.controlador')
const validarToken = require('../../middleware/validar.token');


/*
==================================================
INDICE
==================================================

1. LOSCONTEOSPORUSUARIO
2. LOSCONTEOSPORSOPORTE
3. CONTEODEDIFERENCIAPORTIEMPO
4. LOSCONTEOSINDIVIDUALPORSOPORTE

==================================================
*/


//1. LOSCONTEOSPORUSUARIO - APP.JSX
router.get('/conteo/usuario/:id/:mesa', validarToken, conteControlador.losConteoPorUsuairo)

//3. CONTEODEDIFERENCIAPORTIEMPO - INDICADORES.JSX
router.get('/conteo/diferencia',  validarToken  , conteControlador.lasDiferencia)
router.get('/conteo/agrupaciones', validarToken, conteControlador.agrupacionesPanel)
router.get('/conteo/mesa/resumen', validarToken, conteControlador.obtenerResumenMesa)

//4. LOSCONTEOSINDIVIDUALPORSOPORTE - GESTIONTICKETS:TARJETAS.JSX
router.get('/conteo/:id_rol/:mesa/:id_soporte',validarToken ,conteControlador.losConteos)

//2. LOSCONTEOSPORSOPORTE - DEBE IR DESPUES DE LAS RUTAS ESTATICAS
router.get('/conteo/:mesa', validarToken ,conteControlador.losConteosDeTickets)


module.exports=router





