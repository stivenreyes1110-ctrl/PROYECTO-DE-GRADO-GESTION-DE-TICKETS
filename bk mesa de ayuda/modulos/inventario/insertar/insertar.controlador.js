const { crearActivo } = require('./insertar.servicio');
const { validarActivo } = require('../validaciones/inventario.validacion');

const insertarActivo = async (peticion, respuesta) => {
  if (!validarActivo(peticion.body)) {
    return respuesta.status(400).json({
      mensaje: 'CATEGORIA, IDAREA e IDSEDE son obligatorios'
    });
  }

  try {
    respuesta.status(201).json(await crearActivo({
      ...peticion.body,
      IDMESA: Number(peticion.usuario.idMesa)
    }));
  } catch (error) {
    respuesta.status(500).json({ mensaje: 'Error al ingresar el activo', error: error.message });
  }
};

module.exports = { insertarActivo };
