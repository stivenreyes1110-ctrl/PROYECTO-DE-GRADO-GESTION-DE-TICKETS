const sql = require('mssql');
const { conexion: conectarBaseDatos } = require('../../../config/db');

const borrarActivo = async (id, idMesa) => {
  const conexion = await conectarBaseDatos();
  const resultado = await conexion.request()
    .input('ID', sql.Int, id)
    .input('IDMESA', sql.Int, idMesa)
    .query('DELETE FROM INVENTARIOSMESA WHERE ID = @ID AND IDMESA = @IDMESA');
  return resultado.rowsAffected[0] > 0;
};

module.exports = { borrarActivo };
