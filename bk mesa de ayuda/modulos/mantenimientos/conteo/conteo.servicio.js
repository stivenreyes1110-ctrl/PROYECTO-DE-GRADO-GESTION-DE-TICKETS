const sql = require('mssql');
const { conexion: conectarBaseDatos } = require('../../../config/db');

const crearConsultaConteo = (conexion, idMesa, anio, idSede) => {
  const consulta = conexion.request().input('IDMESA', sql.Int, idMesa);
  const filtros = ['activo.IDMESA = @IDMESA'];
  if (anio) {
    consulta.input('ANIO', sql.Int, anio);
    filtros.push('YEAR(mantenimiento.FECHA) = @ANIO');
  }
  if (idSede) {
    consulta.input('IDSEDE', sql.Int, idSede);
    filtros.push('activo.IDSEDE = @IDSEDE');
  }
  return { consulta, where: filtros.length ? `WHERE ${filtros.join(' AND ')}` : '' };
};

const contarMantenimientos = async (idMesa, anio = null, idSede = null) => {
  const conexion = await conectarBaseDatos();
  const { consulta, where } = crearConsultaConteo(conexion, idMesa, anio, idSede);
  const resultado = await consulta.query(`
    SELECT COUNT(*) AS TOTAL
    FROM MANTENIMIENTOSMESA mantenimiento
    INNER JOIN INVENTARIOSMESA activo ON activo.ID = mantenimiento.IDACTIVO
    ${where}
  `);
  return resultado.recordset[0].TOTAL;
};

const contarMantenimientosPorEstado = async (idMesa, anio = null, idSede = null) => {
  const conexion = await conectarBaseDatos();
  const { consulta, where } = crearConsultaConteo(conexion, idMesa, anio, idSede);
  const resultado = await consulta.query(`
    SELECT
      SUM(CASE WHEN UPPER(LTRIM(RTRIM(ESTADO))) = 'PENDIENTE' THEN 1 ELSE 0 END) AS PENDIENTES,
      SUM(CASE WHEN UPPER(LTRIM(RTRIM(ESTADO))) = 'EN PROCESO' THEN 1 ELSE 0 END) AS ENPROCESO,
      SUM(CASE WHEN UPPER(LTRIM(RTRIM(ESTADO))) = 'FINALIZADO' THEN 1 ELSE 0 END) AS FINALIZADOS
    FROM MANTENIMIENTOSMESA mantenimiento
    INNER JOIN INVENTARIOSMESA activo ON activo.ID = mantenimiento.IDACTIVO
    ${where}
  `);
  return resultado.recordset[0];
};

const consultarAniosMantenimientos = async (idMesa) => {
  const conexion = await conectarBaseDatos();
  const resultado = await conexion.request().input('IDMESA', sql.Int, idMesa).query(`
    SELECT DISTINCT YEAR(mantenimiento.FECHA) AS ANIO
    FROM MANTENIMIENTOSMESA mantenimiento
    INNER JOIN INVENTARIOSMESA activo ON activo.ID = mantenimiento.IDACTIVO
    WHERE mantenimiento.FECHA IS NOT NULL AND activo.IDMESA = @IDMESA
    ORDER BY ANIO DESC
  `);
  return resultado.recordset.map((registro) => registro.ANIO);
};

const consultarResumenSedesMantenimientos = async (idMesa, anio) => {
  const conexion = await conectarBaseDatos();
  const resultado = await conexion.request()
    .input('ANIO', sql.Int, anio)
    .input('IDMESA', sql.Int, idMesa)
    .query(`
    SELECT
      sede.ID AS IDSEDE,
      sede.NOMBRE AS NOMBRESEDE,
      COUNT(DISTINCT activo.ID) AS TOTALCOMPUTADORES,
      COUNT(DISTINCT CASE
        WHEN YEAR(mantenimiento.FECHA) = @ANIO
          AND UPPER(LTRIM(RTRIM(mantenimiento.ESTADO))) = 'FINALIZADO'
        THEN activo.ID
      END) AS COMPUTADORESCONMANTENIMIENTO
    FROM SEDESCLB sede
    LEFT JOIN INVENTARIOSMESA activo
      ON activo.IDSEDE = sede.ID
      AND activo.IDMESA = @IDMESA
      AND UPPER(activo.CATEGORIA) LIKE '%COMPUTADOR%'
    LEFT JOIN MANTENIMIENTOSMESA mantenimiento ON mantenimiento.IDACTIVO = activo.ID
    GROUP BY sede.ID, sede.NOMBRE
    HAVING COUNT(DISTINCT activo.ID) > 0
    ORDER BY sede.NOMBRE
  `);
  return resultado.recordset.map((sede) => ({
    ...sede,
    PORCENTAJE: sede.TOTALCOMPUTADORES > 0
      ? Math.round((sede.COMPUTADORESCONMANTENIMIENTO / sede.TOTALCOMPUTADORES) * 100)
      : 0
  }));
};

module.exports = {
  contarMantenimientos,
  contarMantenimientosPorEstado,
  consultarAniosMantenimientos,
  consultarResumenSedesMantenimientos
};
