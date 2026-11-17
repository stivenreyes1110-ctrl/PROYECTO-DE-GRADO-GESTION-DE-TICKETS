const sql = require('mssql');
const { conexion } = require('../../../config/db');

const asignar = async ({ idMesa, idTicket, idSoporte }) => {
  const pool = await conexion();
  const resultado = await pool.request()
    .input('IDMESA', sql.Int, idMesa)
    .input('IDTICKET', sql.Int, idTicket)
    .input('IDSOPORTE', sql.Int, idSoporte)
    .query(`
      UPDATE T SET T.IDSOPORTE = @IDSOPORTE
      OUTPUT INSERTED.*
      FROM TICKETSMESA T
      WHERE T.ID = @IDTICKET AND T.IDMESA = @IDMESA
        AND EXISTS (
          SELECT 1 FROM SOPORTESMESA S
          WHERE S.ID = @IDSOPORTE AND S.IDMESA = @IDMESA
        );
    `);
  return resultado.recordset[0] || null;
};
module.exports = { asignar };
