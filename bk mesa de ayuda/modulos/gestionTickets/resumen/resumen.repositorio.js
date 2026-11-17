const { conexion } = require('../../../config/db');
const { prepararAlcance } = require('../compartido/alcanceGestion');

const obtenerResumen = async (contexto) => {
  const pool = await conexion();
  const request = pool.request();
  const condiciones = prepararAlcance(request, contexto);
  const resultado = await request.query(`
    WITH ESTADOS AS (
      SELECT 1 AS ID, 'POR ASIGNAR' AS ESTADO
      UNION ALL SELECT 2, 'EN PROCESO'
      UNION ALL SELECT 3, 'SOLUCIONADO'
    )
    SELECT E.ESTADO, COUNT(T.ID) AS TOTAL
    FROM ESTADOS E
    LEFT JOIN (
      SELECT T.ID, T.ESTADO
      FROM TICKETSMESA T
      LEFT JOIN SOPORTESMESA S ON S.ID = T.IDSOPORTE AND S.IDMESA = T.IDMESA
      WHERE ${condiciones}
    ) T ON T.ESTADO = E.ID
    GROUP BY E.ID, E.ESTADO

    UNION ALL

    SELECT 'TOTAL GENERAL', COUNT_BIG(1)
    FROM TICKETSMESA T
    LEFT JOIN SOPORTESMESA S ON S.ID = T.IDSOPORTE AND S.IDMESA = T.IDMESA
    WHERE ${condiciones};
  `);
  return resultado.recordset;
};

module.exports = { obtenerResumen };
