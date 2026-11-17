const sql = require('mssql');
const { conexion } = require('../../../config/db');

const listarSoportes = async (idMesa) => {
  const pool = await conexion();
  const resultado = await pool.request().input('IDMESA', sql.Int, idMesa).query(`
    SELECT S.ID, S.ID AS IDSOPORTE, U.NOMBRE
    FROM SOPORTESMESA S
    INNER JOIN USUARIOSMESA U ON U.ID = S.IDUSUARIO
    WHERE S.IDMESA = @IDMESA
    ORDER BY U.NOMBRE;
  `);
  return resultado.recordset;
};
module.exports = { listarSoportes };
