const sql = require('mssql');
const { conexion: conectarBaseDatos } = require('../../../config/db');

const contarInventario = async (idMesa) => {
  const conexion = await conectarBaseDatos();
  const resultado = await conexion.request()
    .input('IDMESA', sql.Int, idMesa)
    .query(`
    SELECT
      COUNT(*) AS TOTAL,
      COUNT(DISTINCT NULLIF(LTRIM(RTRIM(inventario.CATEGORIA)), '')) AS CATEGORIAS,
      COUNT(DISTINCT inventario.IDAREA) AS AREAS,
      COUNT(DISTINCT inventario.IDSEDE) AS SEDES
    FROM INVENTARIOSMESA inventario
    INNER JOIN AREASCLB area ON area.ID = inventario.IDAREA AND area.idsede = inventario.IDSEDE
    INNER JOIN SEDESCLB sede ON sede.ID = area.idsede
    INNER JOIN MESASAYUDA mesa ON mesa.ID = inventario.IDMESA
    WHERE inventario.IDMESA = @IDMESA
  `);
  return resultado.recordset[0] || {
    TOTAL: 0,
    CATEGORIAS: 0,
    AREAS: 0,
    SEDES: 0
  };
};

module.exports = { contarInventario };
