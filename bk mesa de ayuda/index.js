require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');


const rutaUsuarios = require('./endpoint/usuarios/usuarios.ruta');
const rutaSolicitudSoporte = require('./modulos/solicitudSoporte/solicitudSoporte.rutas');
const rutaGestionTickets = require('./modulos/gestionTickets/gestionTickets.rutas');
const rutaAdministracionTickets = require('./modulos/administracionTickets/administracionTickets.rutas');
const rutaMesa = require('./endpoint/mesas/mesas.ruta');
const rutaAreas = require('./endpoint/areas/areas.ruta');
const rutaIncidentes = require('./endpoint/incidentes/incidentes.ruta');
const rutaSedes = require('./endpoint/sedes/sedes.ruta');
const rutaConteo = require('./endpoint/conteos/conteos.ruta');
const rutaLogin = require('./endpoint/login/login.ruta');
const rutaInventarios = require('./modulos/inventario/inventario.rutas');
const rutaMantenimientos = require('./modulos/mantenimientos/mantenimientos.rutas');
const rutaConteosMantenimientos = require('./modulos/mantenimientos/conteo/conteo.ruta');
const rutaCronograma = require('./modulos/cronograma/cronograma.rutas');
const rutaResponsabilidades = require('./modulos/responsabilidades/responsabilidades.rutas');
// const mantenimientosRoutes = require('./modulos/archivosMantenimientos/routes/mantenimientos.routes');


const app = express();

app.set('trust proxy', true);
app.use(cors());
app.use(express.json({limit: '3mb'}));


app.use('/api', rutaUsuarios);
app.use('/api/solicitudes-soporte', rutaSolicitudSoporte);
app.use('/api/gestion-tickets', rutaGestionTickets);
app.use('/api/administracion-tickets', rutaAdministracionTickets);
app.use('/api', rutaMesa);
app.use('/api', rutaAreas);
app.use('/api', rutaIncidentes);
app.use('/api', rutaSedes);
app.use('/api', rutaConteo);
app.use('/api/indicadores', require('./modulos/indicadores/indicadores.rutas'));
app.use('/api', rutaLogin);
app.use('/api/inventario', rutaInventarios);
app.use('/api/mantenimientos', rutaMantenimientos);
app.use('/api/conteos', rutaConteosMantenimientos);
app.use('/api/cronograma', rutaCronograma);
app.use('/api/responsabilidades', rutaResponsabilidades);
app.use('/api/configuracion', require('./modulos/configuracion/configuracion.rutas'));
app.get('/api/prioridades', require('./middleware/validar.token'), require('./modulos/configuracion/configuracion.controlador').prioridades);


app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// use.use("/api/manenimientos",mantenimientosRoutes);
// app.use("/modulos/archivosMantenimientos/uploads", express.static(path.join(__dirname, "modulos/archivosMantenimientos/uploads")));


app.listen(3020, "0.0.0.0", () => {
  console.log('🚀 Servidor en puerto 3020');
});
