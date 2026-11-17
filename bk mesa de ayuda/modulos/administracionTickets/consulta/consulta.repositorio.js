const sql = require('mssql');
const { conexion } = require('../../../config/db');
const { seleccionTickets } = require('../compartido/seleccionTickets');

const listar = async ({ idMesa, pagina, limite, estado }) => {
  const pool = await conexion();
  const filtroEstado = estado ? 'AND T.ESTADO = @ESTADO' : '';
  const requestDatos = pool.request()
    .input('IDMESA', sql.Int, idMesa)
    .input('OFFSET', sql.Int, (pagina - 1) * limite)
    .input('LIMITE', sql.Int, limite);
  const requestTotal = pool.request().input('IDMESA', sql.Int, idMesa);
  if (estado) {
    requestDatos.input('ESTADO', sql.Int, estado);
    requestTotal.input('ESTADO', sql.Int, estado);
  }
  const [datos, total] = await Promise.all([
    requestDatos.query(`${seleccionTickets} WHERE T.IDMESA = @IDMESA ${filtroEstado}
      ORDER BY T.ID DESC OFFSET @OFFSET ROWS FETCH NEXT @LIMITE ROWS ONLY;`),
    requestTotal.query(`SELECT COUNT_BIG(1) AS TOTAL FROM TICKETSMESA T
      WHERE T.IDMESA = @IDMESA ${filtroEstado};`)
  ]);
  return { datos: datos.recordset, total: Number(total.recordset[0]?.TOTAL || 0) };
};
module.exports = { listar };
