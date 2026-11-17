const express = require('express');
const router = express.Router();


const loginControlador = require('./login.controlador')


router.post ('/login', loginControlador.losLogin)


module.exports = router;
