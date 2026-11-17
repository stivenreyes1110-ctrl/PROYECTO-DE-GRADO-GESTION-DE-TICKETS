const {
  consultarAreas,
  consultarCatalogo,
  consultarInventario
} = require('./consulta.servicio');

const obtenerAreas = async (peticion, respuesta) => {
  try {
    respuesta.json(await consultarAreas(peticion.query.sede));
  } catch (error) {
    respuesta.status(500).json({ mensaje: 'Error al consultar las áreas', error: error.message });
  }
};

const obtenerSedes = async (peticion, respuesta) => {
  try {
    respuesta.json(await consultarCatalogo('SEDESCLB'));
  } catch (error) {
    respuesta.status(500).json({ mensaje: 'Error al consultar las sedes', error: error.message });
  }
};

const obtenerInventario = async (peticion, respuesta) => {
  try {
    const datos = await consultarInventario({
      pagina: Number(peticion.query.pagina) || 1,
      limite: Number(peticion.query.limite) || 0,
      idMesa: Number(peticion.usuario.idMesa)
    });
    respuesta.json(datos);
  } catch (error) {
    respuesta.status(500).json({ mensaje: 'Error al consultar el inventario', error: error.message });
  }
};

module.exports = { obtenerAreas, obtenerSedes, obtenerInventario };
