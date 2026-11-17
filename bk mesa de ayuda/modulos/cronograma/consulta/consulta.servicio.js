const sql = require('mssql');
const { conexion: conectarBaseDatos } = require('../../../config/db');

const consultarCronogramaInventarios = async (mes, anio, idMesa) => {
  const conexion = await conectarBaseDatos();
  const consulta = conexion.request()
    .input('MES', sql.Int, mes)
    .input('ANIO', sql.Int, anio)
    .input('IDMESA', sql.Int, idMesa);
  const resultado = await consulta.query(`
    SELECT
      mantenimiento.ID,
      mantenimiento.IDACTIVO,
      mantenimiento.TIPOMANTENIMIENTO,
      mantenimiento.FECHA,
      DAY(mantenimiento.FECHA) AS DIA,
      mantenimiento.RESPONSABLE,
      mantenimiento.ESTADO,
      activo.CATEGORIA,
      activo.MARCA,
      activo.MODELO,
      activo.PLACA,
      activo.DESCRIPCIONUBICACION,
      area.NOMBRE AS NOMBREAREA,
      sede.NOMBRE AS NOMBRESEDE,
      mesa.NOMBRE AS NOMBREMESA
    FROM MANTENIMIENTOSMESA mantenimiento
    INNER JOIN INVENTARIOSMESA activo ON activo.ID = mantenimiento.IDACTIVO
    INNER JOIN AREASCLB area ON area.ID = activo.IDAREA AND area.idsede = activo.IDSEDE
    INNER JOIN SEDESCLB sede ON sede.ID = area.idsede
    INNER JOIN MESASAYUDA mesa ON mesa.ID = activo.IDMESA
    WHERE
      YEAR(mantenimiento.FECHA) = @ANIO
      AND MONTH(mantenimiento.FECHA) = @MES
      AND activo.IDMESA = @IDMESA
    ORDER BY mantenimiento.FECHA ASC
  `);

  return resultado.recordset;
};

module.exports = { consultarCronogramaInventarios };
