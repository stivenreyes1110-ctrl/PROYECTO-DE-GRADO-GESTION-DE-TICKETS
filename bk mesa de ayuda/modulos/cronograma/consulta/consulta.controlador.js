const { consultarCronogramaInventarios } = require('./consulta.servicio');

const obtenerCronogramaInventarios = async (req, res) => {
  try {
    const fechaActual = new Date();
    const mes = Number(req.query.mes) || fechaActual.getMonth() + 1;
    const anio = Number(req.query.anio) || fechaActual.getFullYear();
    if (mes < 1 || mes > 12 || anio < 1900 || anio > 2100) {
      return res.status(400).json({ mensaje: 'El mes o el año no son válidos' });
    }
    const datos = await consultarCronogramaInventarios(mes, anio, Number(req.usuario.idMesa));
    res.json(datos);
  } catch (error) {
    console.error('Error al consultar cronograma:', error);
    res.status(500).json({ mensaje: 'Error al consultar el cronograma de inventarios' });
  }
};

module.exports = { obtenerCronogramaInventarios };
