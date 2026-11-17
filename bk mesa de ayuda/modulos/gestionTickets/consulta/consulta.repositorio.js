const sql = require('mssql');
const { conexion } = require('../../../config/db');
const { seleccionGestion, prepararAlcance } = require('../compartido/alcanceGestion');

const consultarAsignados = async ({ contexto, pagina, limite, estado }) => {
  const pool = await conexion();
  const offset = (pagina - 1) * limite;
  const requestDatos = pool.request()
    .input('OFFSET', sql.Int, offset)
    .input('LIMITE', sql.Int, limite);
  const condicionesDatos = prepararAlcance(requestDatos, contexto);
  const filtroEstado = estado ? 'AND T.ESTADO = @ESTADO' : '';
  if (estado) requestDatos.input('ESTADO', sql.Int, estado);

  const resultado = await requestDatos.query(`
    ${seleccionGestion}
    WHERE ${condicionesDatos}
    ${filtroEstado}
    ORDER BY T.ID DESC
    OFFSET @OFFSET ROWS FETCH NEXT @LIMITE ROWS ONLY;
  `);

  const requestTotal = pool.request();
  const condicionesTotal = prepararAlcance(requestTotal, contexto);
  if (estado) requestTotal.input('ESTADO', sql.Int, estado);
  const totalResultado = await requestTotal.query(`
    SELECT COUNT_BIG(1) AS TOTAL
    FROM TICKETSMESA T
    LEFT JOIN SOPORTESMESA S ON S.ID = T.IDSOPORTE AND S.IDMESA = T.IDMESA
    WHERE ${condicionesTotal}
    ${filtroEstado};
  `);

  return {
    datos: resultado.recordset,
    total: Number(totalResultado.recordset[0]?.TOTAL || 0)
  };
};

module.exports = { consultarAsignados };
