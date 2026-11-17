const sql = require('mssql');
const { conexion } = require('../../../config/db');
const { prepararAlcance } = require('../compartido/alcanceGestion');

const actualizarEstadoAsignado = async ({ contexto, idTicket, estado, observacion }) => {
  const pool = await conexion();
  const request = pool.request()
    .input('IDTICKET', sql.Int, idTicket)
    .input('ESTADO', sql.Int, estado)
    .input('OBSERVACION', sql.NVarChar(2000), observacion);
  const condiciones = prepararAlcance(request, contexto);
  const resultado = await request.query(`
    UPDATE T
    SET
      T.ESTADO = @ESTADO,
      T.CONTESTACION = @OBSERVACION,
      T.HORACIERRE = CASE WHEN @ESTADO = 3 THEN GETDATE() ELSE NULL END
    OUTPUT INSERTED.*
    FROM TICKETSMESA T
    LEFT JOIN SOPORTESMESA S ON S.ID = T.IDSOPORTE AND S.IDMESA = T.IDMESA
    WHERE T.ID = @IDTICKET
      AND ${condiciones}
      AND T.ESTADO IN (1, 2);
  `);
  return resultado.recordset[0] || null;
};

module.exports = { actualizarEstadoAsignado };
