const sql = require('mssql');
const { conexion } = require('../../../config/db');

const obtenerResumen = async (idMesa) => {
  const pool = await conexion();
  const resultado = await pool.request().input('IDMESA', sql.Int, idMesa).query(`
    WITH ESTADOS AS (
      SELECT 1 AS ID, 'POR ASIGNAR' AS ESTADO
      UNION ALL SELECT 2, 'EN PROCESO'
      UNION ALL SELECT 3, 'SOLUCIONADO'
    )
    SELECT E.ESTADO, COUNT(T.ID) AS TOTAL
    FROM ESTADOS E
    LEFT JOIN TICKETSMESA T ON T.ESTADO = E.ID AND T.IDMESA = @IDMESA
    GROUP BY E.ID, E.ESTADO
    UNION ALL
    SELECT 'TOTAL GENERAL', COUNT_BIG(1) FROM TICKETSMESA WHERE IDMESA = @IDMESA;
  `);
  return resultado.recordset;
};
module.exports = { obtenerResumen };
