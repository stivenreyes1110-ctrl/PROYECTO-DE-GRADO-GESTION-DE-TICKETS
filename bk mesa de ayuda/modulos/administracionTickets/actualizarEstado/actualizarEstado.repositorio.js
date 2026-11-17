const sql = require('mssql');
const { conexion } = require('../../../config/db');

const actualizarEstado = async ({ idMesa, idTicket, estado, observacion }) => {
  const pool = await conexion();
  const resultado = await pool.request()
    .input('IDMESA', sql.Int, idMesa)
    .input('IDTICKET', sql.Int, idTicket)
    .input('ESTADO', sql.Int, estado)
    .input('OBSERVACION', sql.NVarChar(2000), observacion || null)
    .query(`
      UPDATE TICKETSMESA
      SET ESTADO = @ESTADO,
          CONTESTACION = COALESCE(@OBSERVACION, CONTESTACION),
          HORACIERRE = CASE WHEN @ESTADO IN (3, 4) THEN GETDATE() ELSE NULL END
      OUTPUT INSERTED.*
      WHERE ID = @IDTICKET AND IDMESA = @IDMESA;
    `);
  return resultado.recordset[0] || null;
};
module.exports = { actualizarEstado };
