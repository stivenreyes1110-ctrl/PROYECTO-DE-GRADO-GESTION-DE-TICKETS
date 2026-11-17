const express = require('express');
const multer = require('multer');
const path = require('path');
const validarToken = require('../../middleware/validar.token');
const { registrarAcceso } = require('./utilidades/auditoriaSolicitud');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads/TICS')),
  filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });
const rutas = express.Router();
rutas.use(registrarAcceso);
rutas.use(validarToken);
rutas.use(require('./consulta/consulta.ruta'));
rutas.use(require('./resumen/resumen.ruta'));
rutas.use(require('./detalle/detalle.ruta'));
rutas.post('/whatsapp', upload.none(), require('./insertar/solicitanteWhatsApp'), require('./insertar/insertar.controlador').crearSolicitud);
rutas.post('/', upload.single('archivo'), require('./insertar/insertar.controlador').crearSolicitud);
rutas.use(require('./actualizar/actualizar.ruta'));
rutas.use(require('./eliminar/eliminar.ruta'));
module.exports = rutas;
